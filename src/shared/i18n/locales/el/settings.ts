const settings = {
  page: {
    title: "Ρυθμίσεις",
    fromEmailRequired:
      'Παρακαλώ εισάγετε ένα email address στο πεδίο "Αποστολέας Email". Το email πρέπει να είναι verified στο Maileroo account σας.',
    saved: "Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!",
  },
  gymInfo: {
    title: "Στοιχεία Γυμναστηρίου",
    name: "Όνομα",
    phone: "Τηλέφωνο",
  },
  sms: {
    usernameHint: "Το email που χρησιμοποιείτε για login στο SMSme.gr",
    passwordPlaceholder: "Εισάγετε τον κωδικό πρόσβασης",
    createAccount: "Δημιουργήστε λογαριασμό στο SMSme.gr",
    senderIdHint:
      "Το όνομα που θα εμφανίζεται ως αποστολέας (μέχρι 11 χαρακτήρες, αλφαριθμητικό)",
    senderIdWarning:
      '<strong>Σημαντικό:</strong> Τα alphanumeric sender IDs (όπως "ColosseumGym") πρέπει να είναι <strong>approved</strong> από το SMSme.gr support. Εάν λαμβάνετε 500 error, πιθανότατα το sender ID δεν είναι approved. Επικοινωνήστε με το SMSme.gr support για να γίνει approve το sender ID σας ή χρησιμοποιήστε numeric sender (π.χ. "1234567890").',
  },
  email: {
    apiKeyPlaceholder: "Εισάγετε το API Key από το Maileroo",
    freeTier: "Δωρεάν: 3.000 emails/μήνα - Maileroo",
    fromEmail: "Αποστολέας Email",
    important:
      "<strong>Σημαντικό:</strong> Το Maileroo απαιτεί verified domain. Το Gmail δεν λειτουργεί σε sandbox mode.",
    solution:
      "<strong>Λύση:</strong> Πρέπει να κάνετε verify το domain σας (π.χ. fightingrooster.gr) στο <link>Maileroo Dashboard → Domains</link> προσθέτοντας DNS records (SPF, DKIM, DMARC).",
    steps:
      "<strong>Βήματα:</strong> 1) Προσθέστε domain στο Maileroo, 2) Προσθέστε DNS records, 3) Verify, 4) Χρησιμοποιήστε email@yourdomain.com",
    fromName: "Όνομα Αποστολέα",
  },
  sendRate: {
    title: "Ρυθμός Αποστολής",
    hints: {
      verySlow: "Πολύ αργή αποστολή (1 email/SMS ανά batch)",
      slow: "Αργή αποστολή (2-5 emails/SMS ανά batch)",
      medium: "Μέτρια αποστολή (5-10 emails/SMS ανά batch) - Προτεινόμενη",
      fast: "Γρήγορη αποστολή (10-20 emails/SMS ανά batch)",
      veryFast: "Πολύ γρήγορη αποστολή (20-50 emails/SMS ανά batch)",
    },
    note: "<strong>Σημείωση:</strong> Χρησιμοποιείται για να ελέγξετε τον ρυθμό αποστολής και να αποφύγετε rate limits από τα APIs.",
  },
  autoNotifications: {
    title: "Αυτόματες Ειδοποιήσεις",
    sevenDays: "7 ημέρες πριν τη λήξη",
    threeDays: "3 ημέρες πριν τη λήξη",
    expiryDay: "Ημέρα λήξης",
    threeDaysAfter: "3 ημέρες μετά τη λήξη",
    sendTime: "Ώρα Αποστολής",
  },
  appearance: {
    title: "Εμφάνιση",
    theme: "Θέμα",
    light: "Ανοιχτό",
    dark: "Σκούρο",
    currency: "Νόμισμα",
  },
} as const;

export default settings;
