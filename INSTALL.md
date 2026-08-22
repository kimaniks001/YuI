# SecurePay YUI v1 — Explorer / Play the Market repair

This repair is for the local errors reported on 22 Aug 2026.

It fixes the missing `src/lib/explorerMode.ts`, the unsupported Lucide `CircleAlert`, strict TypeScript cleanup, Lucide icon typing, ES2020 `replaceAll`, the Evening Market id, and the release helper result type.

## Apply

Stop Vite first (`Ctrl+C`). Then:

```bash
cd ~/Downloads
rm -rf YuI-v1-fix
unzip -q YuI_V1_PLAY_MARKET_FIX_2026-08-22.zip -d YuI-v1-fix
rsync -av YuI-v1-fix/YuI_V1_PLAY_MARKET_FIX_2026-08-22/ YuI/
cd YuI
rm -rf node_modules/.vite
npm run typecheck
npm run build
npm run certify:v1
npm run dev
```

Then open `http://localhost:5173/play`.
