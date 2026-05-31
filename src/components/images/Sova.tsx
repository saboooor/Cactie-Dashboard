import { component$, useStyles$ } from '@qwik.dev/core';

export default component$<any>(({ size = 24, animated = false, noblur = false, ...props }) => {
  
  if (animated) {
    useStyles$(`
      #sPath {
        stroke-dasharray: 1400;
        stroke-dashoffset: 1400;
        animation: draw 3s ease-in-out forwards;
      }
      @keyframes draw {
        to {
          stroke-dashoffset: 0;
        }
      }
    `);
  }

  return (
    <svg width={size} height={size} {...props} viewBox="0 0 600 600" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;">
      <defs>
          <mask id="eMask" x="415" y="0" width="100%" height="100%" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
            <rect x="415" y="0" width="100%" height="100%" fill="white" />
            <path id="sPath" d="M950,80C650,40 520,180 720,260C920,340 820,460 480,520"
              style="fill:none;fill-rule:nonzero;stroke:black;stroke-width:20px;"/>
          </mask>
          <linearGradient id="_Linear1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(470,447.039045,-447.039045,470,480,72.960955)"><stop offset="0" style="stop-color:rgb(96,165,250);stop-opacity:1"/><stop offset="1" style="stop-color:rgb(167,139,250);stop-opacity:1"/></linearGradient>
          {!noblur && (
            <filter id="blurGlow">
                <feGaussianBlur stdDeviation="10" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
          )}
      </defs>
      <g id="sPath" transform="matrix(1,0,0,1,-415,0)" mask="url(#eMask)">
        <path d="M950,80C650,40 520,180 720,260C920,340 820,460 480,520" style="fill:none;fill-rule:nonzero;stroke:url(#_Linear1);stroke-width:50px;"
          filter={noblur ? undefined : "url(#blurGlow)"}/>
      </g>
    </svg>
  );
});