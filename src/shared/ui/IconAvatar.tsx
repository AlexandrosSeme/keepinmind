import React, { type ReactNode } from "react";
import "./IconAvatar.scss";

interface IconAvatarProps {
  children: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

/** Round, brand-tinted icon holder (32px / 40px). */
const IconAvatar: React.FC<IconAvatarProps> = ({
  children,
  size = "md",
  className = "",
}) => (
  <div
    className={`km-avatar-soft km-icon-avatar km-icon-avatar--${size} ${className}`.trim()}
  >
    {children}
  </div>
);

export default IconAvatar;
