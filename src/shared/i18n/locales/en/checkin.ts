import type { LocaleShape } from "../../types";
import type el from "../el/checkin";

const checkin: LocaleShape<typeof el> = {
  page: {
    title: "QR Code Scan",
    usbTitle: "Plug & Play QR Scanner (USB) or manual entry:",
    usbHelpTitle: "Plug & Play Scanner:",
    usbHelp:
      "Connect the USB QR scanner and scan directly. The scanner works automatically - just scan the QR code!",
    manualPlaceholder: "Member ID (or scan with USB scanner)",
    validate: "Validate",
  },
  validation: {
    connectionError: "Connection error",
    connectionUnavailable: "The database connection is not available",
    invalidCode: "Invalid QR Code",
    memberNotFound: "No member found with this ID",
    cardLost: "Card Cancelled",
    cardLostReason:
      "The card has been marked as lost/cancelled. Please contact the administrator.",
    expired: "Expired Subscription",
    expiredReason: "The subscription expired on {{date}}",
    expiringSoon: "Active Subscription (Expiring Soon)",
    expiringSoonReason: "The subscription expires on {{date}}",
    active: "Active Subscription",
    invalidStatus: "Invalid Status",
    invalidStatusReason: "The subscription status is not valid",
    validationError: "Validation Error",
    dbError: "Error communicating with the database",
  },
  scan: {
    noMemberId: "No valid Member ID found. Data: {{data}}",
    processingError: "Processing Error",
    processingErrorReason: "Error processing the QR code",
    invalidData: "The QR code does not contain valid data",
    readError: "Could not read the QR code",
    invalidMemberId: "Please enter a valid member ID",
  },
  camera: {
    label: "Select Camera",
    loading: "Loading cameras...",
    noneAvailable: "No available cameras found",
    quality: "Scan Quality",
    qualityOptions: {
      fast: "⚡ Fast (30 FPS, Large QR Box)",
      balanced: "⚖️ Balanced (20 FPS, Medium QR Box)",
      accurate: "🎯 Accurate (15 FPS, Small QR Box)",
    },
    qualityHints: {
      fast: "Fast scanning with a large scanning area - Recommended",
      balanced: "Balanced speed and accuracy",
      accurate: "More accurate but slower scanning",
    },
    scan: "Scan",
    start: "Start Scanning",
    stop: "Stop Scanning",
    defaultLabel: "Camera {{index}}",
    notFound: "No cameras found",
    loadError: "Error loading cameras",
    selectCamera: "Please select a camera",
    startError: "Error starting the scan",
  },
  result: {
    title: "Validation Result",
    empty: "Scan a QR code to see the result",
    memberDetails: "Member Details:",
    name: "Name:",
    phone: "Phone:",
    package: "Package:",
    expiry: "Expiry:",
    newScan: "New Scan",
  },
};

export default checkin;
