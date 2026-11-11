import React from "react";
import { useTranslation } from "react-i18next";
import { Bell, Clock, CheckCircle } from "lucide-react";
import { PageHeader, StatusBadge } from "@/shared/ui";

const Notifications: React.FC = () => {
  const { t } = useTranslation(["notifications", "common"]);
  const notifications = [
    {
      id: 1,
      type: "expiry_warning",
      title: t("demo.sevenDaysTitle"),
      message: t("demo.sevenDaysMessage", { name: "Μαρία Γεωργίου" }),
      channel: "SMS",
      status: "scheduled",
      scheduledFor: "13/10/2025 10:00",
      icon: Clock,
      iconColor: "text-warning",
      iconBg: "bg-warning bg-opacity-10",
    },
    {
      id: 2,
      type: "expiry_today",
      title: t("demo.expiryTodayTitle"),
      message: t("demo.expiryTodayMessage", { name: "Νίκος Παπαδόπουλος" }),
      channel: "SMS",
      status: "sent",
      sentAt: "13/10/2025 10:05",
      icon: CheckCircle,
      iconColor: "text-success",
      iconBg: "bg-success bg-opacity-10",
    },
  ];

  return (
    <div>
      <PageHeader
        title={t("page.title")}
        actions={
          <button className="btn btn-primary">
            <Bell size={16} className="me-2" />
            {t("page.new")}
          </button>
        }
      />

      <div className="card border-0 shadow-sm mb-4 km-toolbar-card">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary btn-sm">
              {t("page.filters.all")}
            </button>
            <button className="btn btn-outline-secondary btn-sm">
              {t("page.filters.scheduled")}
            </button>
            <button className="btn btn-outline-secondary btn-sm">
              {t("page.filters.sent")}
            </button>
            <button className="btn btn-outline-secondary btn-sm">
              {t("page.filters.failed")}
            </button>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <div key={notification.id} className="km-list-row">
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className={`p-2 rounded-2 d-inline-flex align-items-center justify-content-center ${notification.iconBg}`}
                    >
                      <IconComponent
                        size={20}
                        className={notification.iconColor}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 text-dark">{notification.title}</h6>
                      <p className="text-muted mb-2 small">
                        {notification.message}
                      </p>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <StatusBadge tone="info" label={notification.channel} />
                        <small className="text-muted">
                          {notification.status === "scheduled"
                            ? t("page.scheduledFor", {
                                date: notification.scheduledFor ?? "",
                              })
                            : t("page.sentAt", {
                                date: notification.sentAt ?? "",
                              })}
                        </small>
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    status={notification.status}
                    label={
                      notification.status === "scheduled"
                        ? t("common:status.pending")
                        : notification.status === "sent"
                          ? t("page.sentBadge")
                          : undefined
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-5">
          <Bell size={48} className="text-muted mb-3" />
          <h5 className="text-muted">{t("page.empty")}</h5>
        </div>
      )}
    </div>
  );
};

export default Notifications;
