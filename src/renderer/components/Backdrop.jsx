import { useState } from 'react';

// Resolved at build time by Vite so the file is fingerprinted in production
// and served from the dev server in development.
const BG_URL = new URL('../assets/bg.png', import.meta.url).href;

// Full-height backdrop for the main content column.
// Renders the UBBA artwork behind whatever children are passed in, with a
// dark scrim that keeps overlaid UI legible. Falls back to a tinted gradient
// if the image asset is missing.
export default function Backdrop({ children }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="relative flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      {imgOk ? (
        <img
          src={BG_URL}
          alt=""
          aria-hidden
          onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
          draggable={false}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(125,40,24,0.55) 0%, rgba(11,10,9,1) 70%)',
          }}
        />
      )}

      {/* Dark scrim so overlaid UI stays readable. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(11,10,9,0.15) 0%, rgba(11,10,9,0.55) 55%, rgba(11,10,9,0.92) 100%)',
        }}
      />

      <div className="relative flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  );
}
