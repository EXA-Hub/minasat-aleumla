/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Generate opacity variants for each color
        ...generateOpacityVariants({
          background: 'var(--background)',
          foreground: 'var(--foreground)',
          'muted-foreground': 'var(--muted-foreground)',
          'accent-foreground': 'var(--accent-foreground)',
          accent: 'var(--accent)',
          primary: 'var(--primary)',
          'primary-foreground': 'var(--primary-foreground)',
          secondary: 'var(--secondary)',
          'secondary-foreground': 'var(--secondary-foreground)',
          muted: 'var(--muted)',
          border: 'var(--border)',
          card: 'var(--card)',
          'muted-light': 'var(--muted-light)',
        }),
      },
    },
  },
  plugins: [],
};

// Utility function to generate opacity variants
function generateOpacityVariants(colors) {
  const variants = {};
  Object.entries(colors).forEach(([colorName, colorValue]) => {
    // Add the base color
    variants[colorName] = colorValue;
    // Generate opacity variants (5% to 95% in steps of 5)
    for (let opacity = 5; opacity <= 95; opacity += 5)
      variants[`${opacity}${colorName}`] = `var(--${opacity}${colorName})`;
  });
  return variants;
}
