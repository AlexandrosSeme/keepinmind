import type { LocaleShape } from "../../types";
import type el from "../el/settings";

const settings: LocaleShape<typeof el> = {
  page: {
    title: "Settings",
    fromEmailRequired:
      'Please enter an email address in the "Sender Email" field. The email must be verified in your Maileroo account.',
    saved: "Settings saved successfully!",
  },
  gymInfo: {
    title: "Gym Details",
    name: "Name",
    phone: "Phone",
  },
  sms: {
    usernameHint: "The email you use to log in to SMSme.gr",
    passwordPlaceholder: "Enter your password",
    createAccount: "Create an account on SMSme.gr",
    senderIdHint:
      "The name shown as the sender (up to 11 characters, alphanumeric)",
    senderIdWarning:
      '<strong>Important:</strong> Alphanumeric sender IDs (such as "ColosseumGym") must be <strong>approved</strong> by SMSme.gr support. If you get a 500 error, the sender ID is most likely not approved. Contact SMSme.gr support to approve your sender ID, or use a numeric sender (e.g. "1234567890").',
  },
  email: {
    apiKeyPlaceholder: "Enter your Maileroo API Key",
    freeTier: "Free: 3,000 emails/month - Maileroo",
    fromEmail: "Sender Email",
    important:
      "<strong>Important:</strong> Maileroo requires a verified domain. Gmail does not work in sandbox mode.",
    solution:
      "<strong>Solution:</strong> You need to verify your domain (e.g. fightingrooster.gr) in the <link>Maileroo Dashboard → Domains</link> by adding DNS records (SPF, DKIM, DMARC).",
    steps:
      "<strong>Steps:</strong> 1) Add the domain in Maileroo, 2) Add the DNS records, 3) Verify, 4) Use email@yourdomain.com",
    fromName: "Sender Name",
  },
  sendRate: {
    title: "Send Rate",
    hints: {
      verySlow: "Very slow sending (1 email/SMS per batch)",
      slow: "Slow sending (2-5 emails/SMS per batch)",
      medium: "Moderate sending (5-10 emails/SMS per batch) - Recommended",
      fast: "Fast sending (10-20 emails/SMS per batch)",
      veryFast: "Very fast sending (20-50 emails/SMS per batch)",
    },
    note: "<strong>Note:</strong> Used to control the sending rate and avoid API rate limits.",
  },
  autoNotifications: {
    title: "Automatic Notifications",
    sevenDays: "7 days before expiry",
    threeDays: "3 days before expiry",
    expiryDay: "Expiry day",
    threeDaysAfter: "3 days after expiry",
    sendTime: "Send Time",
  },
  appearance: {
    title: "Appearance",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    currency: "Currency",
  },
};

export default settings;
