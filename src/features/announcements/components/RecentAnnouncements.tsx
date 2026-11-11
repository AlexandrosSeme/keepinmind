import React from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { StatusBadge } from "@/shared/ui";
import type { SentAnnouncement } from "../types";
import "./RecentAnnouncements.scss";

const RecentAnnouncements: React.FC<{ items: SentAnnouncement[] }> = ({
  items,
}) => {
  const { t } = useTranslation("announcements");
  return (
    <>
      <div className="card border-0 shadow-sm">
        <div className="card-header border-0 py-3">
          <h5 className="card-title mb-0">{t("recent.title")}</h5>
        </div>
        <div className="card-body p-0">
          {items.map((announcement) => (
            <div
              key={announcement.id}
              className="border-bottom p-4 hover-bg-light"
            >
              <div className="d-flex align-items-start justify-content-between">
                <div className="flex-grow-1">
                  <h6 className="mb-1 text-dark">{announcement.title}</h6>
                  <p className="text-muted mb-2 small">
                    {t("recent.sentTo", {
                      count: announcement.recipientCount,
                      channel: announcement.channel,
                    })}
                  </p>
                  <small className="text-muted">{announcement.date}</small>
                </div>
                <div className="text-end">
                  <StatusBadge status={announcement.status} />
                  <div className="mt-1">
                    <small className="text-muted">
                      {t("recent.successful", {
                        count: announcement.successful,
                      })}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-center py-5">
          <div className="mb-4">
            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center km-recent-announcements__empty-icon">
              <Send size={32} className="text-muted" />
            </div>
          </div>
          <h5 className="text-muted">{t("recent.emptyTitle")}</h5>
          <p className="text-muted mb-4">{t("recent.emptyText")}</p>
          <button className="btn btn-primary">
            <Send size={16} className="me-2" />
            {t("page.create")}
          </button>
        </div>
      )}
    </>
  );
};

export default RecentAnnouncements;
