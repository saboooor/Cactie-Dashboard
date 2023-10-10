/** @type {import('tailwindcss').Config} */

const gray = {
  50: "hsl(0deg, 0%, 95%)",
 100: "hsl(0deg, 0%, 85%)",
 200: "hsl(0deg, 0%, 75%)",
 300: "hsl(0deg, 0%, 65%)",
 400: "hsl(0deg, 0%, 55%)",
 500: "hsl(0deg, 0%, 45%)",
 600: "hsl(0deg, 0%, 32%)",
 700: "hsl(0deg, 0%, 21%)",
 800: "hsl(0deg, 0%, 12%)",
 850: "hsl(0deg, 0%, 8%)",
 900: "hsl(0deg, 0%, 5%)",
};

const luminescent = {
  50: "hsl(286deg, 65%, 97%)",
 100: "hsl(286deg, 60%, 95%)",
 200: "hsl(286deg, 55%, 90%)",
 300: "hsl(286deg, 50%, 82%)",
 400: "hsl(286deg, 45%, 75%)",
 500: "hsl(286deg, 40%, 60%)",
 600: "hsl(286deg, 35%, 51%)",
 700: "hsl(286deg, 30%, 42%)",
 800: "hsl(286deg, 25%, 35%)",
 900: "hsl(286deg, 20%, 30%)",
 950: "hsl(286deg, 15%, 17%)"
};

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { gray, luminescent },
      animation: {
        bloblong: "bloblong 15s infinite",
        bloblong1: "bloblong1 15s infinite",
        bloblong2: "bloblong2 15s infinite",
        blob: "blob 15s infinite",
        blob1: "blob1 15s infinite",
        blob2: "blob2 15s infinite",
        float: "float 6s infinite"
      },
      keyframes: {
        blob: {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(1) scaleY(1.2) rotate(0deg)"
          },
          "25%": {
            transform: "translate(80%, -50%) scale(1.2) scaleY(1) scaleX(0.8) rotate(45deg)"
          },
          "50%": {
            transform: "translate(50%, -100%) scale(0.9) scaleY(1.2) scaleX(1) rotate(90deg)"
          },
          "75%": {
            transform: "translate(25%, -50%) scale(1.3) scaleX(0.9) rotate(135deg)"
          }
        },
        blob1: {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(1.2) scaleY(1) rotate(45deg)"
          },
          "25%": {
            transform: "translate(50%, -50%) scale(1) scaleY(1.2) scaleX(0.8) rotate(0deg)"
          },
          "50%": {
            transform: "translate(80%, -100%) scale(0.9) scaleY(1.2) scaleX(1) rotate(135deg)"
          },
          "75%": {
            transform: "translate(25%, -25%) scale(1.3) scaleX(0.9) rotate(90deg)"
          }
        },
        blob2: {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(0.9) scaleY(1.2) rotate(0deg)"
          },
          "25%": {
            transform: "translate(50%, -50%) scale(1.1) scaleY(1.2) scaleX(0.8) rotate(135deg)"
          },
          "50%": {
            transform: "translate(25%, -50%) scale(0.9) scaleY(1) scaleX(1) rotate(45deg)"
          },
          "75%": {
            transform: "translate(80%, -25%) scale(1.2) scaleX(1) rotate(90deg)"
          }
        },
        bloblong: {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(1) scaleY(1.2) rotate(0deg)"
          },
          "25%": {
            transform: "translate(150%, -50%) scale(1.2) scaleY(1) scaleX(0.8) rotate(45deg)"
          },
          "50%": {
            transform: "translate(100%, -100%) scale(0.9) scaleY(1.2) scaleX(1) rotate(90deg)"
          },
          "75%": {
            transform: "translate(50%, -50%) scale(1.3) scaleX(0.9) rotate(135deg)"
          }
        },
        bloblong1: {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(1.2) scaleY(1) rotate(45deg)"
          },
          "25%": {
            transform: "translate(100%, -50%) scale(1) scaleY(1.2) scaleX(0.8) rotate(0deg)"
          },
          "50%": {
            transform: "translate(150%, -100%) scale(0.9) scaleY(1.2) scaleX(1) rotate(135deg)"
          },
          "75%": {
            transform: "translate(25%, -25%) scale(1.3) scaleX(0.9) rotate(90deg)"
          }
        },
        bloblong2: {
          "0%, 100%": {
            transform: "translate(0%, 0%) scale(0.9) scaleY(1.2) rotate(0deg)"
          },
          "25%": {
            transform: "translate(100%, -100%) scale(1.1) scaleY(1.2) scaleX(0.8) rotate(135deg)"
          },
          "50%": {
            transform: "translate(25%, -25%) scale(0.9) scaleY(1) scaleX(1) rotate(45deg)"
          },
          "75%": {
            transform: "translate(150%, -50%) scale(1.2) scaleX(1) rotate(90deg)"
          }
        },
      }
    },
  },
};
