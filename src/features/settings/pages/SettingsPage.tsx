import React, { useState } from "react";
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

const SettingsPage: React.FC = () => {
  const [gymInfo, setGymInfo] = useState<GymInfo>({
    name: "Colosseum Gym",
    phone: "210 1234567",
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
    if (emailProvider.apiKey && !emailProvider.fromEmail.trim()) {
      alert(
        'Παρακαλω εισαγετε ενα email address στο πεδιο "Αποστολεας Email". Το email πρεπει να ειναι verified στο Maileroo account σας.',
      );
      return;
    }

    saveSmsSettings(smsProvider);
    saveEmailSettings(emailProvider);
    saveSendRate(sendRate);
    initNotificationServices(emailProvider, smsProvider);

    alert("Οι ρυθμισεις αποθηκευτηκαν επιτυχως!");
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="h4">Ρυθμισεις</h2>
      </div>

      <div className="row g-4">
        <GymInfoSection value={gymInfo} onChange={setGymInfo} />
        <SmsProviderSection value={smsProvider} onChange={setSmsProvider} />
        <EmailProviderSection
          value={emailProvider}
          onChange={setEmailProvider}
        />
        <SendRateSection value={sendRate} onChange={setSendRate} />
        <AutoNotificationsSection
          value={notifications}
          onChange={setNotifications}
        />
        <AppearanceSection value={appearance} onChange={setAppearance} />
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-outline-secondary">Ακυρωση</button>
        <button className="btn btn-primary" onClick={handleSave}>
          Αποθηκευση
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
