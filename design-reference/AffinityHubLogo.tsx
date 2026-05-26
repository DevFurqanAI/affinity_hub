import React, { useState } from "react";
// @ts-ignore
import logoUrl from "../logo.png";

interface AffinityHubLogoProps {
  className?: string;
  isAnimated?: boolean;
}

export const AffinityHubLogo: React.FC<AffinityHubLogoProps> = ({
  className = "w-9 h-9",
  isAnimated = true,
}) => {
  const [loadError, setLoadError] = useState(false);

  // If we haven't encountered a loading error, attempt to load the real uploaded logo!
  if (!loadError) {
    return (
      <img
        src={logoUrl}
        alt="Affinity Hub"
        referrerPolicy="no-referrer"
        onError={() => {
          setLoadError(true);
        }}
        className={`${className} object-contain ${
          isAnimated ? "hover:scale-110 active:scale-95 transition-transform duration-250 cursor-pointer" : ""
        }`}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${className} overflow-visible ${isAnimated ? "hover:scale-105 transition-transform duration-300" : ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        {/* Glow & Depth Shadow Filter */}
        <filter id="logoShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#120022" floodOpacity="0.18" />
        </filter>

        <filter id="overlapShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="-1" dy="3.5" stdDeviation="3.5" floodColor="#1e003a" floodOpacity="0.4" />
        </filter>

        {/* Brand Left Pink-Magenta Gradient */}
        <linearGradient id="leftMagentaGrad" x1="15%" y1="85%" x2="55%" y2="15%">
          <stop offset="0%" stopColor="#ff00b4" />
          <stop offset="30%" stopColor="#f505cf" />
          <stop offset="70%" stopColor="#ff416c" />
          <stop offset="100%" stopColor="#ff7b39" />
        </linearGradient>

        {/* Brand Right Orange-Yellow Gradient */}
        <linearGradient id="rightYellowGrad" x1="50%" y1="15%" x2="90%" y2="85%">
          <stop offset="0%" stopColor="#ff7b39" />
          <stop offset="35%" stopColor="#ff9a2e" />
          <stop offset="70%" stopColor="#ffb923" />
          <stop offset="100%" stopColor="#ffd828" />
        </linearGradient>

        {/* Under-fold Deep Purple-Indigo Gradient (makes the A loop feel 3D) */}
        <linearGradient id="underPurpleGrad" x1="30%" y1="40%" x2="70%" y2="80%">
          <stop offset="0%" stopColor="#8d0ce6" />
          <stop offset="45%" stopColor="#5407be" />
          <stop offset="90%" stopColor="#220074" />
        </linearGradient>

        {/* Smooth Blend Highlights for realistic glossy overlay */}
        <linearGradient id="glossHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Main Container with Soft Shadows */}
      <g filter="url(#logoShadow)">
        
        {/* Background Under-Loop (The horizontal folded purple bridge of the A) */}
        <path
          d="M 50 63 C 32 63, 24 73, 22 84 C 20 95, 34 100, 48 98 C 66 94, 76 72, 86 85 C 93 94, 102 96, 100 85 C 96 73, 72 63, 50 63 Z"
          fill="url(#underPurpleGrad)"
        />

        {/* Beautiful Inner tunnel backshadow backing up of the main folds */}
        <path
          d="M 50 63 C 44 63, 33 69, 36 78 C 39 88, 64 88, 64 78 C 64 69, 56 63, 50 63 Z"
          fill="#300062"
          opacity="0.3"
        />

        {/* The Front Left Magenta Stem and Apex Crest (curving beautifully down to bottom-left) */}
        <path
          d="M 23 83 C 18 83, 15 74, 21 64 C 28 52, 43 28, 56 19 C 58 17, 62 17, 64 19 M 64 19 C 75 27, 98 64, 101 72"
          stroke="url(#leftMagentaGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#overlapShadow)"
        />

        {/* The Overlapping Arch Loop Front Right Stem (curving down to bottom-right and folding up) */}
        <path
          d="M 59 19 C 70 27, 91 64, 98 75 C 103 83, 101 90, 94 90 C 86 90, 81 83, 76 75 C 71 67, 60 58, 50 58 C 40 58, 32 66, 27 75"
          stroke="url(#rightYellowGrad)"
          strokeWidth="10.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* High-fidelity Highlights for ribbon curves */}
        <path
          d="M 23 83 C 18 83, 15 74, 21 64 C 28 52, 43 28, 56 19 C 58 17, 62 17, 64 19"
          stroke="url(#glossHighlight)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>
    </svg>
  );
};
