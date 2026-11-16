import React from "react";
import FinanceDashboard from "../views/FinanceDashboard";
import "./DashboardPage.scss";

/** Owner/admin finance overview (route guarded by the `finance` permission). */
const FinancePage: React.FC = () => <FinanceDashboard />;

export default FinancePage;
