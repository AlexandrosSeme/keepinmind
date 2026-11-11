import i18n from "@/shared/i18n";
import type { Member } from "@/features/members";
import {
  emailService,
  getSavedFromEmail,
  loadSendRate,
  smsService,
} from "@/features/notifications";
import type { MessageChannel } from "./types";
import {
  ANNOUNCEMENT_EMAIL_SUBJECT,
  createEmailHTML,
} from "./lib/emailTemplate";

export interface SendInput {
  message: string;
  channel: MessageChannel;
  members: Member[];
  manualEmails: string[];
  manualPhones: string[];
}

export interface BulkResult {
  success: number;
  failed: number;
  errors: string[];
}

const usesEmail = (channel: MessageChannel) =>
  channel === "email" || channel === "both";
const usesSms = (channel: MessageChannel) => channel !== "email";

/** Returns a user-facing error when there is nobody to send to, otherwise null. */
export function validateRecipients({
  channel,
  members,
  manualEmails,
  manualPhones,
}: SendInput): string | null {
  const hasMemberEmails = members.some((m) => m.email);
  const hasMemberPhones = members.some((m) => m.phone);

  if (channel === "email" && !hasMemberEmails && manualEmails.length === 0) {
    return i18n.t("announcements:errors.noEmails");
  }
  if (
    (channel === "sms" || channel === "viber") &&
    !hasMemberPhones &&
    manualPhones.length === 0
  ) {
    return i18n.t("announcements:errors.noPhones");
  }
  if (
    channel === "both" &&
    !hasMemberEmails &&
    manualEmails.length === 0 &&
    !hasMemberPhones &&
    manualPhones.length === 0
  ) {
    return i18n.t("announcements:errors.noRecipients");
  }
  return null;
}

async function sendEmails({
  message,
  members,
  manualEmails,
}: SendInput): Promise<BulkResult | null> {
  if (!emailService.isInitialized()) {
    throw new Error(i18n.t("announcements:errors.emailNotConfigured"));
  }

  const fromEmail = getSavedFromEmail();
  if (!fromEmail || fromEmail.trim() === "") {
    throw new Error(i18n.t("announcements:errors.fromEmailMissing"));
  }

  const recipients = [
    ...members
      .filter((m) => m.email)
      .map((m) => ({ email: m.email!, name: m.name })),
    ...manualEmails.map((email) => ({ email, name: email.split("@")[0] })),
  ];

  if (recipients.length === 0) {
    throw new Error(i18n.t("announcements:errors.noEmailRecipients"));
  }

  return emailService.sendBulkEmails(
    recipients,
    ANNOUNCEMENT_EMAIL_SUBJECT,
    message,
    createEmailHTML(message),
    loadSendRate(),
  );
}

async function sendSms({
  message,
  channel,
  members,
  manualPhones,
}: SendInput): Promise<BulkResult | null> {
  if (!smsService.isInitialized()) {
    throw new Error(i18n.t("announcements:errors.smsNotConfigured"));
  }

  const recipients = [
    ...members
      .filter((m) => m.phone)
      .map((m) => ({ phone: m.phone, name: m.name })),
    ...manualPhones.map((phone) => ({ phone, name: phone })),
  ];
  if (recipients.length === 0) return null;

  const smsChannel = channel === "viber" ? "viber" : "sms";
  return smsService.sendBulkSMS(
    recipients,
    message,
    smsChannel,
    loadSendRate(),
  );
}

/**
 * Sends the announcement over the selected channel(s).
 * When both are used, the returned result is the SMS one (matches previous behaviour).
 */
export async function sendAnnouncement(
  input: SendInput,
): Promise<{ result: BulkResult | null; channels: string[] }> {
  let result: BulkResult | null = null;
  const channels: string[] = [];

  if (usesEmail(input.channel)) {
    result = await sendEmails(input);
    channels.push("Email");
  }

  if (usesSms(input.channel)) {
    const smsResult = await sendSms(input);
    if (smsResult) {
      result = smsResult;
      channels.push(input.channel === "viber" ? "Viber" : "SMS");
    }
  }

  return { result, channels };
}

/** Maps a send error to a user-facing message. */
export function describeSendError(error: unknown): string {
  if (!(error instanceof Error)) return i18n.t("announcements:errors.generic");

  const isDomainError =
    error.message.includes("not associated") ||
    error.message.includes("domain") ||
    error.message.includes("Domain verification");

  return isDomainError
    ? i18n.t("announcements:errors.domainNotVerified")
    : error.message;
}
