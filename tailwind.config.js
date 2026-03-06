/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/Home.jsx", "./src/**/*.jsx", "./navigation/**/*.jsx"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

