const layout = {
  nav: {
    dashboard: "Dashboard",
    members: "Μέλη",
    subscriptions: "Συνδρομές",
    payments: "Πληρωμές",
    debts: "Οφειλές",
    calendar: "Ημερολόγιο",
    attendance: "Προσέλευση",
    "qr-scanner": "Σάρωση QR Code",
    "view-qr": "Προβολή QR Code",
    "print-qr-codes": "Κάρτες",
    notifications: "Ειδοποιήσεις",
    announcements: "Ανακοινώσεις",
    settings: "Ρυθμίσεις",
    "member-portal": "Πύλη μέλους",
  },
  topbar: {
    welcome: "Καλώς ήρθατε στο σύστημα διαχείρισης",
    role: "Διαχειριστής",
    openMenu: "Άνοιγμα μενού",
    closeMenu: "Κλείσιμο μενού",
    notifications: "Ειδοποιήσεις",
  },
  notFound: {
    title: "Η σελίδα δεν βρέθηκε",
    back: "Επιστροφή στο Dashboard",
  },
} as const;

export default layout;
