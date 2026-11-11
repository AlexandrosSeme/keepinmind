import React, { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { intlLocale } from "@/shared/i18n";
import {
  fetchAnnouncements,
  type Announcement,
} from "@/features/announcements";

const MemberAnnouncements: React.FC = () => {
  const { t } = useTranslation(["memberPortal", "common"]);
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchAnnouncements();
      setItems(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="mp-page-title">{t("announcements.title")}</h1>
      <p className="mp-page-sub">{t("announcements.subtitle")}</p>

      {loading ? (
        <div className="mp-empty">{t("common:loading")}</div>
      ) : items.length === 0 ? (
        <div className="mp-empty">
          <Megaphone size={28} className="mb-2 opacity-50" />
          <div>{t("announcements.empty")}</div>
        </div>
      ) : (
        items.map((a) => (
          <article key={a.id} className="mp-card">
            <div className="mp-card-title">{a.title}</div>
            <small className="text-muted d-block mb-2">
              {new Date(a.created_at).toLocaleDateString(intlLocale(), {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </small>
            <p className="mb-0 mp-text-pre">{a.body}</p>
          </article>
        ))
      )}
    </div>
  );
};

export default MemberAnnouncements;
