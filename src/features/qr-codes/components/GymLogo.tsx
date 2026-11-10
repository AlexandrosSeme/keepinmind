import React, { useState } from "react";
import gymLogo from "@/assets/gym.png";

/** Gym logo for printed cards, with an inline SVG fallback if the image fails to load. */
const GymLogo: React.FC = () => {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <img
        src={gymLogo}
        alt="Logo"
        className="logo-image"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="logo-g">
      <svg viewBox="0 0 100 100" width="30" height="30">
        <path
          d="M 50 20 A 30 30 0 0 1 20 50 A 30 30 0 0 1 50 80 A 30 30 0 0 1 80 50 L 80 65 L 65 65 L 65 60 L 75 60 L 75 55 A 25 25 0 0 0 50 30 A 25 25 0 0 0 25 50 A 25 25 0 0 0 50 70 A 25 25 0 0 0 75 50 L 80 50 A 30 30 0 0 1 50 80 A 30 30 0 0 1 20 50 A 30 30 0 0 1 50 20 Z"
          fill="#FFD700"
        />
        <path
          d="M 50 30 A 20 20 0 0 1 70 50 L 70 55 L 60 55 L 60 60 L 70 60 L 70 50 A 20 20 0 0 0 50 70 A 20 20 0 0 0 30 50 A 20 20 0 0 0 50 30 Z"
          fill="#FFFFFF"
        />
        <rect x="60" y="55" width="10" height="10" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

export default GymLogo;
