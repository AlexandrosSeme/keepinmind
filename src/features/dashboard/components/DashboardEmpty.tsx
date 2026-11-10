import React, { type ReactNode } from "react";

interface DashboardEmptyProps {
  icon: ReactNode;
  text: string;
}

const DashboardEmpty: React.FC<DashboardEmptyProps> = ({ icon, text }) => (
  <div className="km-dashboard__empty">
    {icon}
    <span>{text}</span>
  </div>
);

export default DashboardEmpty;
