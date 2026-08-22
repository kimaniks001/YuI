// Small dependency-free QR encoder for SecurePay offer links.
// Byte mode, error-correction level L, versions 1-9. This keeps QR creation
// entirely in the browser: no Store URL or customer context is sent to a
// third-party QR service.

type RsBlock = { total: number; data: number };

const RS_L: Record<number, RsBlock[]> = {
  1: [{ total: 26, data: 19 }],
  2: [{ total: 44, data: 34 }],
  3: [{ total: 70, data: 55 }],
  4: [{ total: 100, data: 80 }],
  5: [{ total: 134, data: 108 }],
  6: [{ total: 86, data: 68 }, { total: 86, data: 68 }],
  7: [{ total: 98, data: 78 }, { total: 98, data: 78 }],
  8: [{ total: 121, data: 97 }, { total: 121, data: 97 }],
  9: [{ total: 146, data: 116 }, { total: 146, data: 116 }],
};

const ALIGNMENT: Record<number, number[]> = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46],
};

const EXP = new Array<number>(512).fill(0);
const LOG = new Array<number>(256).fill(0);
for (let i = 0; i < 8; i += 1) EXP[i] = 1 << i;
for (let i = 8; i < 256; i += 1) EXP[i] = EXP[i - 4] ^ EXP[i - 5] ^ EXP[i - 6] ^ EXP[i - 8];
for (let i = 0; i < 255; i += 1) LOG[EXP[i]] = i;
for (let i = 255; i < EXP.length; i += 1) EXP[i] = EXP[i - 255];

function gfMul(a: number, b: number) {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function polyMultiply(a: number[], b: number[]) {
  const out = new Array<number>(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) out[i + j] ^= gfMul(a[i], b[j]);
  }
  return out;
}

function rsGenerator(count: number) {
  let generator = [1];
  for (let i = 0; i < count; i += 1) generator = polyMultiply(generator, [1, EXP[i]]);
  return generator;
}

function rsRemainder(data: number[], count: number) {
  const generator = rsGenerator(count);
  const work = [...data, ...new Array<number>(count).fill(0)];
  for (let i = 0; i < data.length; i += 1) {
    const factor = work[i];
    if (factor === 0) continue;
    const factorLog = LOG[factor];
    for (let j = 0; j < generator.length; j += 1) {
      if (generator[j] !== 0) work[i + j] ^= EXP[factorLog + LOG[generator[j]]];
    }
  }
  return work.slice(data.length);
}

class BitBuffer {
  readonly bits: boolean[] = [];
  put(value: number, length: number) {
    for (let i = length - 1; i >= 0; i -= 1) this.bits.push(((value >>> i) & 1) === 1);
  }
  putBit(value: boolean) { this.bits.push(value); }
}

function totalDataCodewords(version: number) {
  return RS_L[version].reduce((sum, block) => sum + block.data, 0);
}

function chooseVersion(byteLength: number) {
  for (let version = 1; version <= 9; version += 1) {
    const countBits = 8;
    const required = 4 + countBits + byteLength * 8;
    if (required <= totalDataCodewords(version) * 8) return version;
  }
  throw new Error('This local QR supports Store links up to QR version 9.');
}

function createCodewords(text: string, version: number) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const blocks = RS_L[version];
  const dataCapacity = totalDataCodewords(version);
  const buffer = new BitBuffer();
  buffer.put(0b0100, 4); // byte mode
  buffer.put(bytes.length, 8); // versions 1-9
  bytes.forEach(byte => buffer.put(byte, 8));

  const totalBits = dataCapacity * 8;
  if (buffer.bits.length + 4 <= totalBits) buffer.put(0, 4);
  while (buffer.bits.length % 8 !== 0) buffer.putBit(false);

  const data: number[] = [];
  for (let i = 0; i < buffer.bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) if (buffer.bits[i + j]) value |= 1 << (7 - j);
    data.push(value);
  }
  let pad = true;
  while (data.length < dataCapacity) {
    data.push(pad ? 0xec : 0x11);
    pad = !pad;
  }

  const dataBlocks: number[][] = [];
  const errorBlocks: number[][] = [];
  let offset = 0;
  blocks.forEach(block => {
    const part = data.slice(offset, offset + block.data);
    offset += block.data;
    dataBlocks.push(part);
    errorBlocks.push(rsRemainder(part, block.total - block.data));
  });

  const out: number[] = [];
  const maxData = Math.max(...dataBlocks.map(block => block.length));
  const maxError = Math.max(...errorBlocks.map(block => block.length));
  for (let i = 0; i < maxData; i += 1) dataBlocks.forEach(block => { if (i < block.length) out.push(block[i]); });
  for (let i = 0; i < maxError; i += 1) errorBlocks.forEach(block => { if (i < block.length) out.push(block[i]); });
  return out;
}

function bchDigit(value: number) {
  let digit = 0;
  let current = value;
  while (current !== 0) { digit += 1; current >>>= 1; }
  return digit;
}

function bchTypeInfo(data: number) {
  const g15 = 0x537;
  let value = data << 10;
  while (bchDigit(value) - bchDigit(g15) >= 0) value ^= g15 << (bchDigit(value) - bchDigit(g15));
  return ((data << 10) | value) ^ 0x5412;
}

function bchTypeNumber(data: number) {
  const g18 = 0x1f25;
  let value = data << 12;
  while (bchDigit(value) - bchDigit(g18) >= 0) value ^= g18 << (bchDigit(value) - bchDigit(g18));
  return (data << 12) | value;
}

function setupFinder(modules: Array<Array<boolean | null>>, row: number, col: number) {
  const size = modules.length;
  for (let r = -1; r <= 7; r += 1) {
    for (let c = -1; c <= 7; c += 1) {
      if (row + r < 0 || row + r >= size || col + c < 0 || col + c >= size) continue;
      const dark =
        (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
        (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
        (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      modules[row + r][col + c] = dark;
    }
  }
}

function setupAlignment(modules: Array<Array<boolean | null>>, version: number) {
  const positions = ALIGNMENT[version];
  positions.forEach(row => positions.forEach(col => {
    if (modules[row][col] !== null) return;
    for (let r = -2; r <= 2; r += 1) {
      for (let c = -2; c <= 2; c += 1) {
        modules[row + r][col + c] = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
      }
    }
  }));
}

function setupTiming(modules: Array<Array<boolean | null>>) {
  const size = modules.length;
  for (let r = 8; r < size - 8; r += 1) if (modules[r][6] === null) modules[r][6] = r % 2 === 0;
  for (let c = 8; c < size - 8; c += 1) if (modules[6][c] === null) modules[6][c] = c % 2 === 0;
}

function setupVersionInfo(modules: Array<Array<boolean | null>>, version: number) {
  if (version < 7) return;
  const bits = bchTypeNumber(version);
  const size = modules.length;
  for (let i = 0; i < 18; i += 1) {
    const dark = ((bits >>> i) & 1) === 1;
    modules[Math.floor(i / 3)][i % 3 + size - 11] = dark;
    modules[i % 3 + size - 11][Math.floor(i / 3)] = dark;
  }
}

function setupFormatInfo(modules: Array<Array<boolean | null>>, maskPattern: number) {
  // QR error-correction level L uses format level bits 01 => numeric value 1.
  const bits = bchTypeInfo((1 << 3) | maskPattern);
  const size = modules.length;
  for (let i = 0; i < 15; i += 1) {
    const dark = ((bits >>> i) & 1) === 1;
    if (i < 6) modules[i][8] = dark;
    else if (i < 8) modules[i + 1][8] = dark;
    else modules[size - 15 + i][8] = dark;
  }
  for (let i = 0; i < 15; i += 1) {
    const dark = ((bits >>> i) & 1) === 1;
    if (i < 8) modules[8][size - i - 1] = dark;
    else if (i < 9) modules[8][15 - i] = dark;
    else modules[8][15 - i - 1] = dark;
  }
  modules[size - 8][8] = true;
}

function mapData(modules: Array<Array<boolean | null>>, codewords: number[], maskPattern: number) {
  const size = modules.length;
  let row = size - 1;
  let direction = -1;
  let byteIndex = 0;
  let bitIndex = 7;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col -= 1;
    while (true) {
      for (let c = 0; c < 2; c += 1) {
        const targetCol = col - c;
        if (modules[row][targetCol] !== null) continue;
        let dark = false;
        if (byteIndex < codewords.length) dark = ((codewords[byteIndex] >>> bitIndex) & 1) === 1;
        if (maskPattern === 0 && (row + targetCol) % 2 === 0) dark = !dark;
        modules[row][targetCol] = dark;
        bitIndex -= 1;
        if (bitIndex < 0) { byteIndex += 1; bitIndex = 7; }
      }
      row += direction;
      if (row < 0 || row >= size) { row -= direction; direction = -direction; break; }
    }
  }
}

export function createLocalQrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const version = chooseVersion(bytes.length);
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => Array<boolean | null>(size).fill(null));

  setupFinder(modules, 0, 0);
  setupFinder(modules, size - 7, 0);
  setupFinder(modules, 0, size - 7);
  setupAlignment(modules, version);
  setupTiming(modules);
  setupVersionInfo(modules, version);
  setupFormatInfo(modules, 0);
  mapData(modules, createCodewords(text, version), 0);

  return modules.map(row => row.map(cell => cell === true));
}
