import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/shared/ui";
import { useMemberSession } from "../session/useMemberSession";
import "../styles/memberPortal.scss";

const MemberLogin: React.FC = () => {
  const { t } = useTranslation("memberPortal");
  const { session, login, loading } = useMemberSession();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    return <Navigate to="/member/app" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const err = await login(phone);
    setSubmitting(false);
    if (err) setError(err);
  };

  return (
    <div className="mp-login">
      <div className="mp-login-card">
        <LanguageSwitcher className="mp-lang mp-login-lang" />
        <div className="mp-login-hero">
          <div className="mp-brand-mark">
            <span>M</span>
          </div>
          <h1 className="mp-page-title mb-1">Melos Member</h1>
          <p className="mp-page-sub mb-0">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="mp-error">{error}</div>}
          <div className="mp-field">
            <label htmlFor="member-phone">{t("login.phone")}</label>
            <input
              id="member-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="69xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="mp-btn mp-btn-primary"
            disabled={submitting}
          >
            {submitting ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <p className="text-muted text-center mt-3 mb-0 mp-text-xs">
          {t("login.help")}
        </p>
      </div>
    </div>
  );
};

export default MemberLogin;
