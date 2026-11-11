import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  initNotificationServices,
  loadEmailSettings,
  loadSendRate,
  loadSmsSettings,
  saveEmailSettings,
  saveSendRate,
  saveSmsSettings,
} from "@/features/notifications";
import GymInfoSection, { type GymInfo } from "../components/GymInfoSection";
import SmsProviderSection from "../components/SmsProviderSection";
import EmailProviderSection from "../components/EmailProviderSection";
import SendRateSection from "../components/SendRateSection";
import AutoNotificationsSection, {
  type AutoNotifications,
} from "../components/AutoNotificationsSection";
import AppearanceSection, {
  type Appearance,
} from "../components/AppearanceSection";
import { useStaffAuth } from "@/features/auth";

const SettingsPage: React.FC = () => {
  const { t } = useTranslation(["settings", "common"]);
  const { can } = useStaffAuth();
  const canEditBusiness = can("settings.business");
  // Messaging providers, credentials and send rate are developer settings.
  const canEditDev = can("settings.dev");
  const [gymInfo, setGymInfo] = useState<GymInfo>({
    name: "Colosseum Gym",
    phone: "210 6536082",
    email: "info@colosseumgym.gr",
  });
  const [smsProvider, setSmsProvider] = useState(loadSmsSettings);
  const [emailProvider, setEmailProvider] = useState(loadEmailSettings);
  const [sendRate, setSendRate] = useState(loadSendRate);
  const [notifications, setNotifications] = useState<AutoNotifications>({
    sevenDays: true,
    threeDays: true,
    expiryDay: true,
    threeDaysAfter: false,
    sendTime: "10:00",
  });
  const [appearance, setAppearance] = useState<Appearance>({
    theme: "light",
    language: "el",
    currency: "EUR",
  });

  const handleSave = () => {
    if (canEditDev) {
      if (emailProvider.apiKey && !emailProvider.fromEmail.trim()) {
        alert(t("page.fromEmailRequired"));
        return;
      }

      saveSmsSettings(smsProvider);
      saveEmailSettings(emailProvider);
      saveSendRate(sendRate);
      initNotificationServices(emailProvider, smsProvider);
    }

    alert(t("page.saved"));
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="h4">{t("page.title")}</h2>
      </div>

      <div className="row g-4">
        {canEditBusiness && (
          <GymInfoSection value={gymInfo} onChange={setGymInfo} />
        )}
        {canEditDev && (
          <>
            <SmsProviderSection value={smsProvider} onChange={setSmsProvider} />
            <EmailProviderSection
              value={emailProvider}
              onChange={setEmailProvider}
            />
            <SendRateSection value={sendRate} onChange={setSendRate} />
          </>
        )}
        {canEditBusiness && (
          <>
            <AutoNotificationsSection
              value={notifications}
              onChange={setNotifications}
            />
            <AppearanceSection value={appearance} onChange={setAppearance} />
          </>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-outline-secondary">
          {t("common:actions.cancel")}
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          {t("common:actions.save")}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
