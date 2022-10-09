/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        blob: "blob 16s infinite",
        float: "float 6s infinite"
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)"
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.2)"
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.8)"
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)"
          }
        },
        float: {
          "0%": {
            transform: "translatey(0px);"
          },
          "50%": {
            transform: "translatey(-20px);"
          },
          "100%": {
            transform: "translatey(0px);"
          }
        }
      }
    },
  },
  plugins: [],
};
