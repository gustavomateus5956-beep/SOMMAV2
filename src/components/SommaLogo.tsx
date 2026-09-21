import React from 'react';

interface SommaLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
}

/**
 * High-fidelity, transparent vector render matching the user's uploaded assets:
 * - "icon" (logo 2): Exact geometry, exact blue tones (#1371cb, #0658af, #084f9b), exact diagonal shadow and focal dot
 * - "full" (Artboard 12): Icon on the left + pure white geometric SOMMA lettering + clean lowercase 'hub'
 */
export const SommaLogo: React.FC<SommaLogoProps> = ({
  className = 'h-7 w-auto',
  variant = 'full',
}) => {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 980 820"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="SOMMA Icon"
      >
        <defs>
          <clipPath id="leftCircleClipDirect">
            <circle cx="340" cy="410" r="280" />
          </clipPath>
        </defs>

        {/* 1. Left solid blue circle */}
        <circle cx="340" cy="410" r="280" fill="#1371cb" />

        {/* 2. Darker diagonal shadow cast cleanly across bottom-left (exact angle from logo 2) */}
        <path
          d="M 175 625 L 340 410 L 515 230 L 620 410 L 530 650 L 280 690 Z"
          fill="#084f9b"
          clipPath="url(#leftCircleClipDirect)"
        />

        {/* 3. Right dark-blue open ring */}
        <circle
          cx="615"
          cy="410"
          r="238"
          fill="none"
          stroke="#0658af"
          strokeWidth="84"
        />

        {/* 4. Center white dot */}
        <circle cx="490" cy="425" r="38" fill="#ffffff" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1150 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SOMMA Hub Logo"
    >
      <defs>
        <clipPath id="fullLogoLeftClip">
          <circle cx="170" cy="180" r="120" />
        </clipPath>
      </defs>

      {/* --- ICON PORTION (EXACT "LOGO 2" PROPORTIONS) --- */}
      <g id="somma-icon-group">
        {/* Left solid blue circle */}
        <circle cx="170" cy="180" r="120" fill="#1371cb" />

        {/* Diagonal shadow inside left circle */}
        <path
          d="M 100 270 L 170 180 L 245 105 L 290 180 L 250 285 L 140 300 Z"
          fill="#084f9b"
          clipPath="url(#fullLogoLeftClip)"
        />

        {/* Right open ring */}
        <circle
          cx="288"
          cy="180"
          r="102"
          fill="none"
          stroke="#0658af"
          strokeWidth="36"
        />

        {/* Center white dot */}
        <circle cx="234" cy="186" r="16.5" fill="#ffffff" />
      </g>

      {/* --- SOMMA WORDMARK (PURE WHITE, CLEAN GEOMETRIC LOGOTYPE) --- */}
      <g id="somma-wordmark" fill="#ffffff">
        {/* S */}
        <path
          d="M 495 136 
             C 495 120 481 110 460 110 
             L 424 110 
             C 402 110 388 124 388 146 
             L 388 158 
             C 388 180 402 194 424 194 
             L 462 194 
             C 475 194 480 200 480 210 
             L 480 218 
             C 480 228 472 236 458 236 
             L 404 236 
             C 392 236 386 228 386 216 
             L 364 216 
             C 364 240 380 258 406 258 
             L 458 258 
             C 486 258 504 240 504 216 
             L 504 206 
             C 504 182 488 170 464 170 
             L 426 170 
             C 414 170 408 164 408 154 
             L 408 148 
             C 408 138 416 132 428 132 
             L 460 132 
             C 472 132 476 138 476 148 
             L 495 148 Z"
        />

        {/* O (Rounded squircle athletic shape) */}
        <path
          d="M 548 110 
             C 522 110 506 126 506 150 
             L 506 218 
             C 506 242 522 258 548 258 
             L 590 258 
             C 616 258 632 242 632 218 
             L 632 150 
             C 632 126 616 110 590 110 
             Z 
             M 549 132 
             L 589 132 
             C 604 132 611 140 611 154 
             L 611 214 
             C 611 228 604 236 589 236 
             L 549 236 
             C 534 236 527 228 527 214 
             L 527 154 
             C 527 140 534 132 549 132 Z"
        />

        {/* M1 */}
        <path
          d="M 648 258 
             L 670 258 
             L 670 152 
             L 698 234 
             L 716 234 
             L 744 152 
             L 744 258 
             L 766 258 
             L 766 110 
             L 738 110 
             L 707 200 
             L 676 110 
             L 648 110 
             Z"
        />

        {/* M2 */}
        <path
          d="M 780 258 
             L 802 258 
             L 802 152 
             L 830 234 
             L 848 234 
             L 876 152 
             L 876 258 
             L 898 258 
             L 898 110 
             L 870 110 
             L 839 200 
             L 808 110 
             L 780 110 
             Z"
        />

        {/* A (Futuristic inverted chevron) */}
        <path
          d="M 906 258 
             L 930 258 
             L 965 142 
             L 1000 258 
             L 1024 258 
             L 978 110 
             L 952 110 
             Z"
        />
      </g>

      {/* --- hub (LOWERCASE GEOMETRIC WORDMARK, PURE WHITE) --- */}
      <g id="hub-wordmark" fill="#ffffff">
        {/* h */}
        <path
          d="M 915 272 
             L 927 272 
             L 927 296 
             C 932 291 939 288 948 288 
             C 961 288 969 296 969 310 
             L 969 344 
             L 957 344 
             L 957 312 
             C 957 304 952 299 943 299 
             C 934 299 927 304 927 314 
             L 927 344 
             L 915 344 
             Z"
        />

        {/* u */}
        <path
          d="M 978 289 
             L 990 289 
             L 990 321 
             C 990 330 995 334 1004 334 
             C 1012 334 1018 329 1018 319 
             L 1018 289 
             L 1030 289 
             L 1030 344 
             L 1019 344 
             L 1019 336 
             C 1014 342 1007 345 998 345 
             C 984 345 978 335 978 320 
             Z"
        />

        {/* b */}
        <path
          d="M 1040 272 
             L 1052 272 
             L 1052 296 
             C 1057 291 1064 288 1073 288 
             C 1090 288 1102 300 1102 317 
             C 1102 334 1089 345 1073 345 
             C 1064 345 1056 342 1052 336 
             L 1052 344 
             L 1040 344 
             Z 
             M 1052 317 
             C 1052 328 1060 334 1071 334 
             C 1082 334 1090 327 1090 317 
             C 1090 306 1082 299 1071 299 
             C 1060 299 1052 306 1052 317 Z"
        />
      </g>
    </svg>
  );
};
