# Drop image assets here

Place the hero artwork at:

    src/renderer/assets/ubba-hero.png

The launcher's `TopBanner` component automatically picks it up.
If the file is missing the launcher falls back to the stylized "UBBA" text.

Supported formats: png, jpg, webp. If you use a different extension, edit
`HERO_URL` in `src/renderer/components/TopBanner.jsx`.
