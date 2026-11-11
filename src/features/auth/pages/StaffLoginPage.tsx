import React, { useState } from "react";
import { Navigate, useLocation, type Location } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher, PageLoader } from "@/shared/ui";
import { useStaffAuth } from "../session/useStaffAuth";

const StaffLoginPage: React.FC = () => {
  const { t } = useTranslation("auth");
  const { profile, loading, login } = useStaffAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <PageLoader />;

  if (profile) {
    const from = (location.state as { from?: Location } | null)?.from;
    const target = from && from.pathname !== "/login" ? from : "/dashboard";
    return <Navigate to={target} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await login(email, password);
    setSubmitting(false);
    if (err) setError(err);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <div className="card border-0 shadow-sm w-100" style={{ maxWidth: 420 }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h1 className="h4 mb-1">Melos Gym Manager</h1>
              <p className="text-muted mb-0">{t("login.subtitle")}</p>
            </div>
            <LanguageSwitcher />
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label htmlFor="staff-email" className="form-label">
                {t("fields.email")}
              </label>
              <input
                id="staff-email"
                type="email"
                className="form-control"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="staff-password" className="form-label">
                {t("fields.password")}
              </label>
              <input
                id="staff-password"
                type="password"
                className="form-control"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={submitting}
            >
              {submitting ? t("login.submitting") : t("login.submit")}
            </button>
          </form>

          <p className="text-muted text-center small mt-3 mb-2">
            {t("login.forgotHint")}
          </p>
          <p className="text-muted text-center small mb-0">
            {t("login.memberHint")}{" "}
            <a href="/member">{t("login.memberLink")}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;
