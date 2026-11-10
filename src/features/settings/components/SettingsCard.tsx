import React, { type ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  children: ReactNode;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ title, children }) => (
  <div className="col-12 col-lg-6">
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header border-0 py-3">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  </div>
);

export default SettingsCard;
