import React, { type ReactNode } from "react";

interface LinkButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

/** Small text-style action used in card headers and table rows. */
const LinkButton: React.FC<LinkButtonProps> = ({
  onClick,
  children,
  className = "",
}) => (
  <button
    type="button"
    className={`btn btn-link btn-sm km-action-link p-0 ${className}`.trim()}
    onClick={onClick}
  >
    {children}
  </button>
);

export default LinkButton;
