const announcements = {
  page: {
    title: "Ανακοινώσεις",
    new: "Νέα Ανακοίνωση",
    create: "Δημιουργία Ανακοίνωσης",
    recipients: "Αποδέκτες",
    channel: "Κανάλι",
    message: "Μήνυμα",
    loadChristmas: "Φόρτωση Χριστουγεννιάτικου Template",
    messagePlaceholder: "Γράψτε το μήνυμά σας εδώ...",
    characters: "Χαρακτήρες: {{length}}",
    free: "Δωρεάν (Maileroo)",
    estimatedCost: "Εκτιμώμενο κόστος: €{{cost}}",
    recipientCount: "Αποδέκτες: {{total}}",
    withEmail: "({{total}} με email)",
    manualEmails: "Manual Emails: {{total}}",
    manualPhones: "Manual Τηλέφωνα (SMS): {{total}}",
    totalEmail: "Σύνολο Email Recipients: {{total}}",
    totalSms: "Σύνολο SMS Recipients: {{total}}",
    saveDraft: "Αποθήκευση Προχείρου",
    sendHint: "Κάντε κλικ για αποστολή",
    sending: "Αποστολή...",
    sendNow: "Αποστολή Τώρα",
  },
  groups: {
    all: "Όλα τα μέλη",
    active: "Ενεργά μέλη",
    expiring: "Λήξη εντός 7 ημερών",
    overdue: "Ληξιπρόθεσμα",
    monthly: "Μηνιαία συνδρομή",
    yearly: "Ετήσια συνδρομή",
  },
  manual: {
    remove: "Αφαίρεση",
    emailLabel: "Προσθήκη Email Addresses (Manual)",
    emailsAdded_one: "Προστέθηκε {{count}} email:",
    emailsAdded_other: "Προστέθηκαν {{count}} emails:",
    emailHint: "Προσθέστε email addresses για αποστολή εκτός από τα μέλη",
    phoneLabel: "Προσθήκη Αριθμών Κινητού (SMS Manual)",
    phonePlaceholder: "69..., 3069..., ή +3069...",
    phonesAdded_one: "Προστέθηκε {{count}} αριθμός:",
    phonesAdded_other: "Προστέθηκαν {{count}} αριθμοί:",
    phoneHint:
      "Προσθέστε αριθμούς κινητού που δεν ανήκουν στα μέλη (μπορείτε να γράψετε 69..., 3069..., ή +3069..., θα κανονικοποιηθούν αυτόματα).",
  },
  recent: {
    title: "Πρόσφατες Ανακοινώσεις",
    sentTo_one: "Στάλθηκε σε {{count}} παραλήπτη | {{channel}}",
    sentTo_other: "Στάλθηκε σε {{count}} παραλήπτες | {{channel}}",
    successful_one: "{{count}} επιτυχημένο",
    successful_other: "{{count}} επιτυχημένα",
    emptyTitle: "Δεν υπάρχουν ανακοινώσεις",
    emptyText: "Δημιουργήστε την πρώτη ανακοίνωση για να ξεκινήσετε",
  },
  result: {
    success:
      "Η αποστολή ολοκληρώθηκε! Επιτυχημένα: {{success}}, Αποτυχημένα: {{failed}}",
    failed: "Η αποστολή απέτυχε: {{errors}}",
  },
  errors: {
    messageRequired: "Παρακαλώ εισάγετε μήνυμα",
    unknown: "Άγνωστο σφάλμα",
    emailRequired: "Παρακαλώ εισάγετε email",
    invalidEmail: "Μη έγκυρο email address",
    emailExists: "Το email υπάρχει ήδη στη λίστα",
    phoneRequired: "Παρακαλώ εισάγετε αριθμό κινητού",
    invalidPhone:
      "Μη έγκυρος αριθμός κινητού. Χρησιμοποιήστε μορφή 69..., 3069... ή +3069...",
    phoneExists: "Ο αριθμός υπάρχει ήδη στη λίστα",
    noEmails:
      'Δεν υπάρχουν email addresses. Προσθέστε manual emails (πατήστε "Προσθήκη" μετά το email) ή επιλέξτε μέλη με email.',
    noPhones:
      'Δεν υπάρχουν αριθμοί κινητού. Επιλέξτε μέλη με τηλέφωνο ή προσθέστε manual αριθμούς (πατήστε "Προσθήκη" μετά τον αριθμό).',
    noRecipients:
      "Δεν υπάρχουν αποδέκτες. Προσθέστε manual emails ή επιλέξτε μέλη με email/τηλέφωνο.",
    emailNotConfigured:
      "Η υπηρεσία email δεν έχει ρυθμιστεί. Ρυθμίστε το Maileroo API στις Ρυθμίσεις.",
    fromEmailMissing:
      'Το email address του αποστολέα δεν έχει οριστεί. Παρακαλώ:\n1. Πηγαίνετε στις Ρυθμίσεις\n2. Βάλτε ένα email address στο πεδίο "Αποστολέας Email" (π.χ. alexandros.seme@gmail.com)\n3. Κάντε κλικ στο "Αποθήκευση"\n4. Δοκιμάστε ξανά',
    noEmailRecipients:
      "Δεν υπάρχουν email addresses για αποστολή. Προσθέστε μέλη με email ή manual emails.",
    smsNotConfigured:
      "Η υπηρεσία SMS δεν έχει ρυθμιστεί. Ρυθμίστε το SMSme.gr API στις Ρυθμίσεις.",
    generic: "Σφάλμα κατά την αποστολή",
    domainNotVerified:
      "Το email domain δεν είναι verified στο Maileroo. Πηγαίνετε στις Ρυθμίσεις και χρησιμοποιήστε ένα verified email address (π.χ. Gmail) ή κάντε verify το domain σας στο Maileroo Dashboard.",
  },
} as const;

export default announcements;
