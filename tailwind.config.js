/** @type {import('tailwindcss').Config} */

const gray = {
   50: "hsl(220deg, 20%, 98%)",
  100: "hsl(230deg, 14%, 96%)",
  200: "hsl(230deg, 13%, 91%)",
  300: "hsl(226deg, 12%, 84%)",
  400: "hsl(228deg, 11%, 65%)",
  500: "hsl(230deg,  9%, 46%)",
  600: "hsl(225deg, 14%, 34%)",
  700: "hsl(227deg, 19%, 27%)",
  800: "hsl(225deg, 28%, 17%)",
  900: "hsl(231deg, 39%, 11%)"
};


module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { gray },
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
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
