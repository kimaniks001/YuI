import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const main = read('src/main.tsx');
const detail = read('src/pages/StoreOfferDetail.tsx');
const sharing = read('src/pages/StoreSharingStudio.tsx');
const endpoints = read('src/api/storeEndpoints.ts');
const qr = read('src/lib/localQr.ts');
const qrComponent = read('src/components/LocalQrCode.tsx');
const css = read('src/store-sharing.css');
const shell = read('src/components/trader/TraderShell.tsx');
const failures = [];
const check = (name, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failures.push(name); };

check('Exact public Store offer route exists', main.includes('<Route path="/ks/:ksId/offers/:offerId" element={<StoreOfferDetail />} />'));
check('Owner sharing studio is protected', main.includes('<Route path="/store/share" element={<Protected><StoreSharingStudio /></Protected>} />'));
check('Account menu exposes Store sharing', shell.includes('to="/store/share"') && shell.includes('Share Store offers'));
check('Exact offer read uses merged backend endpoint', endpoints.includes('/api/v1/stores/${encodeURIComponent(canonicalKsNumber)}/offers/${encodeURIComponent(offerId)}'));
check('Owner sharing only exposes published offers', sharing.includes('.filter(offer => offer.published)'));
check('Owner sharing forms exact KS plus offer deep link', sharing.includes('/ks/${encodeURIComponent(ks)}/offers/${encodeURIComponent(offer.id)}'));
check('Shared offer validates canonical KS and UUID', detail.includes('KS_PATTERN') && detail.includes('UUID_PATTERN'));
check('Shared offer verifies backend response matches route', detail.includes('result.data.canonicalKsNumber !== ksNumber') && detail.includes('result.data.offer.id !== id'));
check('Shared offer preserves exact backend listed money', detail.includes('detail.offer.priceMinor') && detail.includes('amount: price ??'));
check('Seller KS is proposal context, not final role authority', detail.includes('proposed seller/recipient role to confirm') && detail.includes('proposed buyer/payer role to confirm'));
check('Share/open boundary prohibits financial or sale implication', detail.includes('Scan/open ≠ reservation ≠ sale ≠ agreement ≠ payment.'));
check('Creation begins as a proposal', detail.includes('Start SecureLink proposal') && detail.includes('state={{ intent: offerIntent(detail) }}'));
check('Share page does not call payment initiation', !detail.includes('initiatePayment') && !detail.includes('Payment Ready'));
check('Copy action exists', detail.includes('navigator.clipboard.writeText(shareUrl)'));
check('WhatsApp share exists and opens only on user action', detail.includes('https://wa.me/?text=') && detail.includes('target="_blank"'));
check('Printable QR exists', detail.includes('window.print()') && css.includes('@media print'));
check('QR is generated locally', detail.includes('does not send this URL to a third-party QR service') && qrComponent.includes('createLocalQrMatrix'));
check('QR encoder has no network destination', !qr.includes('http://') && !qr.includes('https://') && !qr.includes('fetch('));
check('QR renderer has quiet zone and crisp modules', qrComponent.includes('const quiet = 4') && qrComponent.includes('shapeRendering="crispEdges"'));
check('Printed QR repeats non-reservation/payment warning', detail.includes('Scanning does not reserve, buy or pay.'));

if (failures.length) {
  console.error(`Store sharing certification failed (${failures.length}).`);
  process.exit(1);
}
console.log('Store SecureLinks, Sharing & QR guard passed.');
