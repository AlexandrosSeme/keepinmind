import type { LocaleShape } from "../../types";
import type el from "../el/announcements";

const announcements: LocaleShape<typeof el> = {
  page: {
    title: "Announcements",
    new: "New Announcement",
    create: "Create Announcement",
    recipients: "Recipients",
    channel: "Channel",
    message: "Message",
    loadChristmas: "Load Christmas Template",
    messagePlaceholder: "Write your message here...",
    characters: "Characters: {{length}}",
    free: "Free (Maileroo)",
    estimatedCost: "Estimated cost: €{{cost}}",
    recipientCount: "Recipients: {{total}}",
    withEmail: "({{total}} with email)",
    manualEmails: "Manual Emails: {{total}}",
    manualPhones: "Manual Phones (SMS): {{total}}",
    totalEmail: "Total Email Recipients: {{total}}",
    totalSms: "Total SMS Recipients: {{total}}",
    saveDraft: "Save Draft",
    sendHint: "Click to send",
    sending: "Sending...",
    sendNow: "Send Now",
  },
  groups: {
    all: "All members",
    active: "Active members",
    expiring: "Expiring within 7 days",
    overdue: "Overdue",
    monthly: "Monthly membership",
    yearly: "Yearly membership",
  },
  manual: {
    remove: "Remove",
    emailLabel: "Add Email Addresses (Manual)",
    emailsAdded_one: "Added {{count}} email:",
    emailsAdded_other: "Added {{count}} emails:",
    emailHint: "Add email addresses to send to in addition to members",
    phoneLabel: "Add Mobile Numbers (SMS Manual)",
    phonePlaceholder: "69..., 3069..., or +3069...",
    phonesAdded_one: "Added {{count}} number:",
    phonesAdded_other: "Added {{count}} numbers:",
    phoneHint:
      "Add mobile numbers that do not belong to members (you can type 69..., 3069..., or +3069..., they will be normalized automatically).",
  },
  recent: {
    title: "Recent Announcements",
    sentTo_one: "Sent to {{count}} recipient | {{channel}}",
    sentTo_other: "Sent to {{count}} recipients | {{channel}}",
    successful_one: "{{count}} successful",
    successful_other: "{{count}} successful",
    emptyTitle: "No announcements",
    emptyText: "Create your first announcement to get started",
  },
  result: {
    success: "Sending completed! Successful: {{success}}, Failed: {{failed}}",
    failed: "Sending failed: {{errors}}",
  },
  errors: {
    messageRequired: "Please enter a message",
    unknown: "Unknown error",
    emailRequired: "Please enter an email",
    invalidEmail: "Invalid email address",
    emailExists: "This email is already in the list",
    phoneRequired: "Please enter a mobile number",
    invalidPhone:
      "Invalid mobile number. Use the format 69..., 3069... or +3069...",
    phoneExists: "This number is already in the list",
    noEmails:
      'There are no email addresses. Add manual emails (press "Add" after the email) or select members with an email.',
    noPhones:
      'There are no mobile numbers. Select members with a phone or add manual numbers (press "Add" after the number).',
    noRecipients:
      "There are no recipients. Add manual emails or select members with email/phone.",
    emailNotConfigured:
      "Email service not configured. Please set up the Maileroo API in Settings.",
    fromEmailMissing:
      'The sender email address is not set. Please:\n1. Go to Settings\n2. Enter an email address in the "Sender Email" field (e.g. alexandros.seme@gmail.com)\n3. Click "Save"\n4. Try again',
    noEmailRecipients:
      "There are no email addresses to send to. Add members with an email or manual emails.",
    smsNotConfigured:
      "SMS service not configured. Please set up the SMSme.gr API in Settings.",
    generic: "Error while sending",
    domainNotVerified:
      "The email domain is not verified in Maileroo. Go to Settings and use a verified email address (e.g. Gmail) or verify your domain in the Maileroo Dashboard.",
  },
};

export default announcements;
