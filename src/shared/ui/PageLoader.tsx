import React from "react";
import "./PageLoader.scss";

const PageLoader: React.FC = () => (
  <div className="km-page-loader" role="status" aria-live="polite">
    <div className="spinner-border text-warning" />
    <span className="visually-hidden">Φορτωση...</span>
  </div>
);

export default PageLoader;
