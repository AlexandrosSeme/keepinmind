import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle } from "lucide-react";
import { Modal } from "@/shared/ui";
import { normalizePhone } from "@/shared/lib/phone";
import { comparePersonNames, personNameMatches, surnameFirst } from "@/shared/lib/personName";
import { useMembers, type Member } from "@/features/members";
import { recordEntrance, validateMemberEntry } from "../api";
import type { ValidationResult } from "../types";

const ManualCheckInModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation(["attendance", "common"]);
  const { members } = useMembers();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Member | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const matches = useMemo(() => {
    const text = query.trim().toLowerCase();
    const digits = normalizePhone(query);
    if (text.length < 2 && digits.length < 3) return [];
    return members
      .filter((member) => {
        const byName = text.length >= 2 && personNameMatches(member.name, text);
        const byPhone = digits.length >= 3 && normalizePhone(member.phone).includes(digits);
        return byName || byPhone;
      })
      .sort((a, b) => comparePersonNames(a.name, b.name))
      .slice(0, 8);
  }, [members, query]);

  const checkIn = async () => {
    if (!picked) return;
    setBusy(true);
    const validation = await validateMemberEntry(picked.id);
    await recordEntrance(validation, "manual");
    setResult(validation);
    setPicked(null);
    setQuery("");
    setBusy(false);
  };

  return (
    <Modal
      title={t("manual.title")}
      onClose={onClose}
      closeDisabled={busy}
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={busy}>
            {t("common:actions.cancel")}
          </button>
          <button type="button" className="btn btn-primary" onClick={checkIn} disabled={!picked || busy}>
            {busy ? t("manual.checking") : t("manual.confirm")}
          </button>
        </>
      }
    >
      <p className="text-muted mb-3">{t("manual.hint")}</p>
      {result && (
        <div
          className={`alert ${result.valid ? "alert-success" : "alert-danger"} d-flex align-items-start`}
          role="status"
        >
          {result.valid ? (
            <CheckCircle className="me-2 flex-shrink-0" size={20} />
          ) : (
            <XCircle className="me-2 flex-shrink-0" size={20} />
          )}
          <div>
            <strong>
              {result.member?.name ? `${surnameFirst(result.member.name)}: ` : ""}
              {result.message}
            </strong>
            {result.reason && <div className="small mt-1">{result.reason}</div>}
          </div>
        </div>
      )}
      <label className="form-label" htmlFor="manual-checkin-search">
        {t("manual.search")}
      </label>
      <input
        id="manual-checkin-search"
        type="search"
        className="form-control"
        value={query}
        autoFocus
        placeholder={t("manual.search")}
        onChange={(event) => {
          setQuery(event.target.value);
          setPicked(null);
        }}
      />
      {query.trim().length > 0 && matches.length === 0 && (
        <p className="text-muted small mt-3 mb-0">{t("manual.none")}</p>
      )}
      {matches.length > 0 && (
        <div className="list-group mt-3">
          {matches.map((member) => {
            const selected = picked?.id === member.id;
            return (
              <button
                key={member.id}
                type="button"
                className={`list-group-item list-group-item-action km-manual-pick${selected ? " is-selected" : ""}`}
                onClick={() => setPicked(member)}
              >
                <span className="fw-semibold">{surnameFirst(member.name)}</span>
                <span className="d-block small text-muted">
                  {member.phone}
                  {member.package ? ` · ${member.package}` : ""}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default ManualCheckInModal;
