/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'barn-primary': '#007559', // Primary green
        'barn-secondary': '#FFFFFF', // White
        'barn-tertiary': '#333333', // Dark grey
        'barn-accent': '#E6F4F1', // Light teal
        'barn-green': {
          50: '#E6F4F1',
          100: '#E6F4F1',
          200: '#B3D9CC',
          300: '#80BFA6',
          400: '#4DA581',
          500: '#007559', // Primary
          600: '#005E47',
          700: '#004635',
          800: '#002F24',
          900: '#001712',
        }
      },
      fontFamily: {
        'headline': ['Red Rose', 'serif'], // Headline font
        'body': ['Raleway', 'sans-serif'], // Body font
        'sans': ['Raleway', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'barn': '8px', // 8-10px radius for content boxes
      },
      spacing: {
        'barn-content': '24px', // Padding inside content sections
        'barn-section': '40px', // Margins between major sections
      }
    },
  },
  plugins: [],
}
