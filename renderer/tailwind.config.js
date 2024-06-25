module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/react-daisyui/dist/**/*.js",
    './src/**/*.{html,jsx,tsx}',
    // you can either add all styles
    './node_modules/@rewind-ui/core/dist/theme/styles/*.js',
    // OR you can add only the styles you need
    './node_modules/@rewind-ui/core/dist/theme/styles/Button.styles.js',
    './node_modules/@rewind-ui/core/dist/theme/styles/Text.styles.js'
  ],
  darkMode: "class",
  theme: {
    extend: {
      sans: ["Century Gothic", "sans-serif"],
      "futura-bkbt": ["Futura Bk BT", "sans-serif"], // Agrega tu nueva fuente aquí
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('@tailwindcss/forms')({
      strategy: 'class' // only generate classes
    })
  ]
}
