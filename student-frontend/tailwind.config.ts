import type { Config } from 'tailwindcss';

export default {
  // Configure paths to all of your template files
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Adjust this glob pattern if needed
  ],

  // Theme customizations are now defined in index.css using @theme
  // Keep this file primarily for content paths and plugins

  plugins: [
    // Add any Tailwind plugins here
  ],

} satisfies Config;