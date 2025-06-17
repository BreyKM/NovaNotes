/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,svelte,js,ts}",
    "./electron/**/*.{html,svelte,js,ts}",
  ],
  theme: {
    extend: {
      keyframes: {
        // NEW: Animates width from 0 to full size
        'expand-in': {
          '0%': { 
            'max-width': '0', 
            'opacity': '0',
            'margin-right': '0' // Start with no margin
          },
          '100%': { 
            'max-width': '12rem', // Target width (basis-48)
            'opacity': '1',
            'margin-right': '-11px' // End with the desired negative margin
          },
        },
        // NEW: Reverses the animation for closing a tab
        'shrink-out': {
          '0%': { 
            'max-width': '12rem',
            'opacity': '1',
           'margin-right': '-11px'
          },
          '100%': { 
            'max-width': '0',
            'opacity': '0',
            'margin-right': '0'
          },
        }
      },
      animation: {
        // Create utilities for the new animations
        'expand-in': 'expand-in 0.15s ease-out forwards',
        'shrink-out': 'shrink-out 0.15s ease-in forwards',
      },
    },
  },
  plugins: [],
};
