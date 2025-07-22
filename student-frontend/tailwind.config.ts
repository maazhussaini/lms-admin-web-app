import type { Config } from 'tailwindcss';

export default {
  // Configure paths to all of your template files
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Adjust this glob pattern if needed
  ],

  // Theme customizations
  theme: {
    screens: {
      'xs': '475px',    // Custom extra small breakpoint for mobile-first design
      'sm': '640px',    // Default small breakpoint
      'md': '768px',    // Default medium breakpoint
      'lg': '1024px',   // Default large breakpoint
      'xl': '1280px',   // Default extra large breakpoint
      '2xl': '1536px',  // Default 2x large breakpoint
    },
    extend: {
      // Additional theme extensions go here
    },
  },

  plugins: [
    // Add any Tailwind plugins here
  ],

} satisfies Config;