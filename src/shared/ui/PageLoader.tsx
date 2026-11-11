import React from "react";
import { useTranslation } from "react-i18next";
import "./PageLoader.scss";

const PageLoader: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="km-page-loader" role="status" aria-live="polite">
      <div className="spinner-border text-warning" />
      <span className="visually-hidden">{t("loading")}</span>
    </div>
  );
};

export default PageLoader;
