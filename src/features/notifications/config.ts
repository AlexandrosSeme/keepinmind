import { emailService } from "./emailService";
import { smsService } from "./smsService";

/** localStorage keys for messaging provider settings (edited in Settings). */
const KEYS = {
  smsUsername: "smsUsername",
  smsPassword: "smsPassword",
  smsSenderId: "smsSenderId",
  emailApiKey: "emailApiKey",
  emailFrom: "emailFrom",
  emailFromName: "emailFromName",
  sendRate: "sendRate",
} as const;

// TODO: move provider credentials server-side; anything shipped to the browser is public.
const DEFAULT_EMAIL_API_KEY =
  "2f97c1ef3c4c95f61976e3043bedf139976c6e688428e24576bc87c3ea37d530";
const DEFAULT_EMAIL_FROM = "noreply@807c33da300c12b9.maileroo.org";
const DEFAULT_FROM_NAME = "Colosseum Gym";
const DEFAULT_SENDER_ID = "ColosseumGym";
const DEFAULT_SEND_RATE = 3;

export interface SmsSettings {
  username: string;
  password: string;
  senderId: string;
}

export interface EmailSettings {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export function loadSmsSettings(): SmsSettings {
  return {
    username: localStorage.getItem(KEYS.smsUsername) || "",
    password: localStorage.getItem(KEYS.smsPassword) || "",
    senderId: localStorage.getItem(KEYS.smsSenderId) || DEFAULT_SENDER_ID,
  };
}

export function loadEmailSettings(): EmailSettings {
  return {
    apiKey: localStorage.getItem(KEYS.emailApiKey) || DEFAULT_EMAIL_API_KEY,
    fromEmail: localStorage.getItem(KEYS.emailFrom) || DEFAULT_EMAIL_FROM,
    fromName: localStorage.getItem(KEYS.emailFromName) || DEFAULT_FROM_NAME,
  };
}

/** The sender address explicitly saved by the user (no default). */
export function getSavedFromEmail(): string | null {
  return localStorage.getItem(KEYS.emailFrom);
}

export function loadSendRate(): number {
  return parseInt(
    localStorage.getItem(KEYS.sendRate) || String(DEFAULT_SEND_RATE),
    10,
  );
}

export function saveSmsSettings(settings: SmsSettings): void {
  if (settings.username && settings.password) {
    localStorage.setItem(KEYS.smsUsername, settings.username);
    localStorage.setItem(KEYS.smsPassword, settings.password);
    localStorage.setItem(KEYS.smsSenderId, settings.senderId);
  } else {
    localStorage.removeItem(KEYS.smsUsername);
    localStorage.removeItem(KEYS.smsPassword);
    localStorage.removeItem(KEYS.smsSenderId);
  }
}

export function saveEmailSettings(settings: EmailSettings): void {
  if (!settings.apiKey) return;

  localStorage.setItem(KEYS.emailApiKey, settings.apiKey);
  const fromEmail = settings.fromEmail.trim();
  if (fromEmail) {
    localStorage.setItem(KEYS.emailFrom, fromEmail);
  } else {
    localStorage.removeItem(KEYS.emailFrom);
  }
  localStorage.setItem(KEYS.emailFromName, settings.fromName);
}

export function saveSendRate(rate: number): void {
  localStorage.setItem(KEYS.sendRate, rate.toString());
}

/** Initializes the email/SMS clients from the given (or stored) settings. */
export function initNotificationServices(
  email: EmailSettings = loadEmailSettings(),
  sms: SmsSettings = loadSmsSettings(),
): void {
  if (email.apiKey) {
    const fromEmail = email.fromEmail.trim();
    if (fromEmail) {
      emailService.initialize(email.apiKey, fromEmail, email.fromName);
    } else {
      emailService.initialize(email.apiKey);
    }
  }

  if (sms.username && sms.password) {
    smsService.initialize(sms.username, sms.password, sms.senderId);
  }
}
