import React from "react";
import "./QrLoading.scss";

const QrLoading: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`d-flex justify-content-center align-items-center vh-100 ${className}`.trim()}>
    <div className="text-center">
      <div className="spinner-border text-primary mb-3 km-qr-loading__spinner" role="status">
        <span className="visually-hidden">Φορτωση...</span>
      </div>
      <p className="text-muted">Φορτωση...</p>
    </div>
  </div>
);

export default QrLoading;
