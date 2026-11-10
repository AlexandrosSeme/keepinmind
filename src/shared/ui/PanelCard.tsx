import React, { type ReactNode } from "react";

export interface PanelCardProps {
  title: ReactNode;
  /** Shown next to the title, e.g. a count badge. */
  badge?: ReactNode;
  /** Right-aligned header content, e.g. a link button. */
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** Card with a compact header (title + optional badge/action) and a body. */
const PanelCard: React.FC<PanelCardProps> = ({
  title,
  badge,
  action,
  className = "",
  bodyClassName = "",
  children,
}) => (
  <div className={`card border-0 shadow-sm ${className}`.trim()}>
    <div className="card-header border-0 py-2 px-3 d-flex align-items-center justify-content-between gap-2">
      <div className="d-flex align-items-center gap-2 min-w-0">
        <h6 className="card-title mb-0">{title}</h6>
        {badge}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
    <div className={`card-body ${bodyClassName}`.trim()}>{children}</div>
  </div>
);

export default PanelCard;
