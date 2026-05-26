/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Grim, metallic palette inspired by the concept.
        ink: {
          900: '#0b0a09',
          800: '#141210',
          700: '#1c1916',
          600: '#272320',
        },
        bone: {
          100: '#efe6d6',
          200: '#d9cdb6',
          300: '#b9a98a',
          400: '#9a8866',
        },
        rust: {
          400: '#c0533a',
          500: '#a13a25',
          600: '#7d2818',
          700: '#561810',
        },
        brass: {
          300: '#e7c98a',
          400: '#caa35a',
          500: '#a7822f',
          600: '#7a5d1d',
        },
      },
      fontFamily: {
        gothic: ['"Cinzel"', '"Trajan Pro"', 'Georgia', 'serif'],
        sans: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Faux "etched metal" frame.
        plate:
          'inset 0 0 0 1px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(231,201,138,0.15), 0 2px 6px rgba(0,0,0,0.6)',
        rivet: 'inset 0 0 0 1px rgba(0,0,0,0.8), 0 1px 1px rgba(231,201,138,0.2)',
      },
      backgroundImage: {
        'metal-plate':
          'linear-gradient(180deg, #2a2522 0%, #1b1815 45%, #131110 100%)',
        'rust-button':
          'linear-gradient(180deg, #b14a30 0%, #7d2818 55%, #4f1810 100%)',
        'grit':
          'radial-gradient(ellipse at top, rgba(125,40,24,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(0,0,0,0.55), transparent 70%)',
      },
    },
  },
  plugins: [],
};
