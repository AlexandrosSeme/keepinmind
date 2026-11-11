import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation("layout");
  return (
    <div className="text-center py-5">
      <h1 className="h3 mb-3">{t("notFound.title")}</h1>
      <Link to="/dashboard" className="btn btn-warning">
        {t("notFound.back")}
      </Link>
    </div>
  );
};

export default NotFoundPage;
