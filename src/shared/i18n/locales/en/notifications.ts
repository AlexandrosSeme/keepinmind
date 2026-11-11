import type { LocaleShape } from "../../types";
import type el from "../el/notifications";

const notifications: LocaleShape<typeof el> = {
  page: {
    title: "Notifications",
    new: "New Notification",
    filters: {
      all: "All",
      scheduled: "Scheduled",
      sent: "Sent",
      failed: "Failed",
    },
    scheduledFor: "Scheduled for {{date}}",
    sentAt: "Sent {{date}}",
    sentBadge: "Sent",
    empty: "No notifications",
  },
  demo: {
    sevenDaysTitle: "7 days before expiry",
    sevenDaysMessage: "{{name}} - Your membership expires in 7 days",
    expiryTodayTitle: "Expiry day",
    expiryTodayMessage: "{{name}} - Your membership expires today",
  },
  errors: {
    unknown: "Unknown error",
    email: {
      notInitialized:
        "Email service not initialized. Please configure the API key in Settings.",
      notInitializedShort: "Email service not initialized",
      fromRequired:
        "Sender email address is required. Please set a verified email address in Settings.",
      invalidResponse: "Invalid response from server",
      sendFailed: "Failed to send email (Status: {{status}})",
    },
    sms: {
      notInitialized:
        "SMS service not initialized. Please configure SMSme.gr credentials in Settings.",
      notInitializedShort: "SMS service not initialized",
      authFailed:
        "Failed to authenticate with SMSme.gr. Please check your credentials.",
      invalidSender:
        "Invalid sender ID. Sender must contain at least one alphanumeric character.",
      emptyMessage: "Message cannot be empty.",
      noRecipients: "At least one recipient is required.",
      invalidPhoneFormat:
        "Invalid phone number format: {{phone}}. Phone numbers must be 10-15 digits with country code.",
      viberUnsupported:
        "Viber is not supported by the SMSme.gr REST API. Please use the SMS channel.",
      sendFailed: "Failed to send SMS ({{status}} {{statusText}})",
      outOfCredit:
        "Your account has no available credits on the REST API. Please:\n1. Add balance to your SMSme.gr account (https://smsme.gr/MyAccount.aspx)\n2. Or use the SMSme.gr web interface to send (https://smsme.gr) - it may have free SMS credits available\n3. Check your balance in your SMSme.gr account\n\nNote: The web interface may have free SMS credits that do not show in the REST API.",
      senderNotApproved:
        'The Sender ID is not approved. Alphanumeric sender IDs (such as "ColosseumGy") must be approved by SMSme.gr support. Contact support to approve your sender ID.',
      invalidRecipient:
        "Invalid recipient number. Please check the phone number format.",
      authCredentials:
        "Authentication failed. Please check your credentials in Settings.",
      badRequest:
        "Invalid request. Please check the sender ID, the recipients and the message format.",
      unauthorized:
        "Authentication failed. Please check your SMSme.gr credentials in Settings.",
      forbidden:
        "Access forbidden. Your account may not have permission to send SMS, or the sender ID is not approved.",
      serverError:
        "SMSme.gr server error. This may be due to:\n1. Sender ID not approved (alphanumeric sender IDs must be approved by SMSme.gr support)\n2. Insufficient balance/credits\n3. Invalid recipient format\nPlease check your SMSme.gr account settings or contact support.",
      testNotInitialized:
        "SMS service not initialized. Please configure credentials in Settings.",
      testAuthFailed:
        "Failed to authenticate. Please check your username and password.",
      testBalanceFailed:
        "Token is valid but failed to retrieve balance. Please check your account permissions.",
      testSuccess: "Connection successful! Account balance: €{{balance}}",
    },
  },
};

export default notifications;
