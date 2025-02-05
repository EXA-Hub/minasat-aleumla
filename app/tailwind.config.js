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
          'accent-foreground': 'var(--accent-foreground)',
          accent: 'var(--accent)',
          primary: 'var(--primary)',
          'primary-foreground': 'var(--primary-foreground)',
          secondary: 'var(--secondary)',
          'secondary-foreground': 'var(--secondary-foreground)',
          muted: 'var(--muted)',
          'muted-foreground': 'var(--muted-foreground)',
          border: 'var(--border)',
          card: 'var(--card)',
          'card-foreground': 'var(--card-foreground)',
          'muted-light': 'var(--muted-light)',
        }),
      },
    },
  },
  plugins: [],
};

/**
 * Given an object of colors, generate a new object with opacity variants of the
 * given colors. The opacity variants are named with the opacity value followed
 * by the color name (e.g. "50primary" for 50% opacity of the "primary" color).
 * The opacity values range from 5% to 95% in steps of 5.
 * @param {Object<string, string>} colors - An object of colors where the key is
 * the color name and the value is the color value.
 * @returns {Object<string, string>} An object with the opacity variants of the
 * given colors.
 */
function generateOpacityVariants(colors) {
  const variants = {};
  Object.entries(colors).forEach(([colorName, colorValue]) => {
    // Add the base color
    variants[colorName] = colorValue;
    // Generate opacity variants (5% to 95% in steps of 5)
    for (let opacity = 5; opacity <= 95; opacity += 5)
      variants[`${opacity}${colorName.replace(/-/g, '')}`] =
        `var(--${opacity}${colorName.replace(/-/g, '')})`;
  });
  return variants;
}
