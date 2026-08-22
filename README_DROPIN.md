# YuI Batch 11 — V17 + V18 Drop-in

Apply this only on top of the approved Batch 10 YuI working copy.

```bash
cd ~/Downloads
rm -rf YuI-batch11
unzip -q YuI_BATCH_11_V17_V18_DROPIN_2026-08-21.zip -d YuI-batch11
rsync -av YuI-batch11/YuI_BATCH_11_V17_V18_DROPIN_2026-08-21/ YuI/
cd YuI
npm run check:batch11-visual
npm run check:visual-certification
npm run certify
npm run dev
```

Review:
- http://localhost:5173/preview/themes
- http://localhost:5173/preview/certification
- http://localhost:5173/review
- http://localhost:5173/

The package is a visual certification candidate until Batch 11 is human-approved and local `npm run certify` passes.
