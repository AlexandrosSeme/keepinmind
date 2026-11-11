import React, { useId } from "react";

interface FlagProps {
  className?: string;
}

export const GreekFlag: React.FC<FlagProps> = ({ className }) => (
  <svg viewBox="0 0 27 18" className={className} aria-hidden="true">
    <rect width="27" height="18" fill="#0D5EAF" />
    {[2, 6, 10, 14].map((y) => (
      <rect key={y} y={y} width="27" height="2" fill="#fff" />
    ))}
    <rect width="10" height="10" fill="#0D5EAF" />
    <rect x="4" width="2" height="10" fill="#fff" />
    <rect y="4" width="10" height="2" fill="#fff" />
  </svg>
);

export const UkFlag: React.FC<FlagProps> = ({ className }) => {
  const id = useId();
  const clip = `${id}-t`;
  return (
    <svg
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <clipPath id={clip}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath={`url(#${clip})`}
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
};
