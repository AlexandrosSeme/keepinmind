import React, { type ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rendered before the title, e.g. a back button. */
  leading?: ReactNode;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  leading,
  actions,
}) => {
  const heading = (
    <div className="min-w-0">
      <h2 className="km-page-title">{title}</h2>
      {subtitle && <p className="km-page-subtitle">{subtitle}</p>}
    </div>
  );

  return (
    <div className="km-page-header">
      {leading ? (
        <div className="d-flex align-items-center gap-3 min-w-0">
          {leading}
          {heading}
        </div>
      ) : (
        heading
      )}
      {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
