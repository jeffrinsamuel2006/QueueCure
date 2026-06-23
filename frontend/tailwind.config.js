export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clinic: {
          50: '#eefdfb',
          100: '#d3f8f3',
          500: '#14b8a6',
          600: '#0d9488',
          900: '#134e4a'
        }
      },
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
