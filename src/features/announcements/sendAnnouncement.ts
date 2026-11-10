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
    return 'Δεν υπαρχουν email addresses. Προσθεστε manual emails (πατηστε "Προσθηκη" μετα το email) η επιλεξτε μελη με email.';
  }
  if (
    (channel === "sms" || channel === "viber") &&
    !hasMemberPhones &&
    manualPhones.length === 0
  ) {
    return 'Δεν υπαρχουν αριθμοι κινητου. Επιλεξτε μελη με τηλεφωνο η προσθεστε manual αριθμους (πατηστε "Προσθηκη" μετα τον αριθμο).';
  }
  if (
    channel === "both" &&
    !hasMemberEmails &&
    manualEmails.length === 0 &&
    !hasMemberPhones &&
    manualPhones.length === 0
  ) {
    return "Δεν υπαρχουν αποδεκτες. Προσθεστε manual emails η επιλεξτε μελη με email/phone.";
  }
  return null;
}

async function sendEmails({
  message,
  members,
  manualEmails,
}: SendInput): Promise<BulkResult | null> {
  if (!emailService.isInitialized()) {
    throw new Error(
      "Email service not configured. Please set up Maileroo API in Settings.",
    );
  }

  const fromEmail = getSavedFromEmail();
  if (!fromEmail || fromEmail.trim() === "") {
    throw new Error(
      "Το email address δεν ειναι set. Παρακαλω:\n" +
        "1. Πηγαινετε στο Settings (Ρυθμισεις)\n" +
        '2. Βαλτε ενα email address στο πεδιο "Αποστολεας Email" (π.χ. alexandros.seme@gmail.com)\n' +
        '3. Καντε κλικ στο "Αποθηκευση" (Save)\n' +
        "4. Δοκιμαστε ξανα",
    );
  }

  const recipients = [
    ...members
      .filter((m) => m.email)
      .map((m) => ({ email: m.email!, name: m.name })),
    ...manualEmails.map((email) => ({ email, name: email.split("@")[0] })),
  ];

  if (recipients.length === 0) {
    throw new Error(
      "Δεν υπαρχουν email addresses για αποστολη. Προσθεστε μελη με email η manual emails.",
    );
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
    throw new Error(
      "SMS service not configured. Please set up SMSme.gr API in Settings.",
    );
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
  if (!(error instanceof Error)) return "Σφαλμα κατα την αποστολη";

  const isDomainError =
    error.message.includes("not associated") ||
    error.message.includes("domain") ||
    error.message.includes("Domain verification");

  return isDomainError
    ? "Το email domain δεν ειναι verified στο Maileroo. " +
        "Πηγαινετε στο Settings και χρησιμοποιηστε ενα verified email address " +
        "(π.χ. Gmail) η verify το domain σας στο Maileroo Dashboard."
    : error.message;
}
