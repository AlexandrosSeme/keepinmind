const notifications = {
  page: {
    title: "Ειδοποιήσεις",
    new: "Νέα Ειδοποίηση",
    filters: {
      all: "Όλες",
      scheduled: "Προγραμματισμένες",
      sent: "Σταλμένες",
      failed: "Αποτυχημένες",
    },
    scheduledFor: "Προγραμματισμένο για {{date}}",
    sentAt: "Στάλθηκε {{date}}",
    sentBadge: "Σταλμένο",
    empty: "Δεν υπάρχουν ειδοποιήσεις",
  },
  demo: {
    sevenDaysTitle: "7 ημέρες πριν τη λήξη",
    sevenDaysMessage: "{{name}} - Η συνδρομή σας λήγει σε 7 ημέρες",
    expiryTodayTitle: "Ημέρα λήξης",
    expiryTodayMessage: "{{name}} - Η συνδρομή σας λήγει σήμερα",
  },
  errors: {
    unknown: "Άγνωστο σφάλμα",
    email: {
      notInitialized:
        "Η υπηρεσία email δεν έχει ρυθμιστεί. Ρυθμίστε το API key στις Ρυθμίσεις.",
      notInitializedShort: "Η υπηρεσία email δεν έχει ρυθμιστεί",
      fromRequired:
        "Απαιτείται email αποστολέα. Ορίστε ένα verified email address στις Ρυθμίσεις.",
      invalidResponse: "Μη έγκυρη απάντηση από τον server",
      sendFailed: "Αποτυχία αποστολής email (Status: {{status}})",
    },
    sms: {
      notInitialized:
        "Η υπηρεσία SMS δεν έχει ρυθμιστεί. Ρυθμίστε τα credentials του SMSme.gr στις Ρυθμίσεις.",
      notInitializedShort: "Η υπηρεσία SMS δεν έχει ρυθμιστεί",
      authFailed:
        "Αποτυχία authentication στο SMSme.gr. Παρακαλώ ελέγξτε τα credentials σας.",
      invalidSender:
        "Μη έγκυρο sender ID. Το sender πρέπει να περιέχει τουλάχιστον έναν αλφαριθμητικό χαρακτήρα.",
      emptyMessage: "Το μήνυμα δεν μπορεί να είναι κενό.",
      noRecipients: "Απαιτείται τουλάχιστον ένας παραλήπτης.",
      invalidPhoneFormat:
        "Μη έγκυρη μορφή αριθμού τηλεφώνου: {{phone}}. Οι αριθμοί πρέπει να έχουν 10-15 ψηφία με κωδικό χώρας.",
      viberUnsupported:
        "Το Viber δεν υποστηρίζεται από το SMSme.gr REST API. Χρησιμοποιήστε το κανάλι SMS.",
      sendFailed: "Αποτυχία αποστολής SMS ({{status}} {{statusText}})",
      outOfCredit:
        "Ο λογαριασμός σας δεν έχει διαθέσιμα credits στο REST API. Παρακαλώ:\n1. Προσθέστε balance στο SMSme.gr account (https://smsme.gr/MyAccount.aspx)\n2. Ή χρησιμοποιήστε το web interface του SMSme.gr για αποστολή (https://smsme.gr) - μπορεί να έχει διαθέσιμα δωρεάν SMS credits\n3. Ελέγξτε το balance σας στο SMSme.gr account\n\nΣημείωση: Το web interface μπορεί να έχει διαθέσιμα δωρεάν SMS credits που δεν φαίνονται στο REST API.",
      senderNotApproved:
        'Το Sender ID δεν είναι approved. Τα alphanumeric sender IDs (όπως "ColosseumGy") πρέπει να εγκριθούν από το SMSme.gr support. Επικοινωνήστε με την υποστήριξη για να γίνει approve το sender ID σας.',
      invalidRecipient:
        "Μη έγκυρος αριθμός παραλήπτη. Παρακαλώ ελέγξτε τη μορφή του αριθμού τηλεφώνου.",
      authCredentials:
        "Αποτυχία authentication. Παρακαλώ ελέγξτε τα credentials σας στις Ρυθμίσεις.",
      badRequest:
        "Μη έγκυρο αίτημα. Παρακαλώ ελέγξτε το sender ID, τους παραλήπτες και τη μορφή του μηνύματος.",
      unauthorized:
        "Αποτυχία authentication. Παρακαλώ ελέγξτε τα SMSme.gr credentials σας στις Ρυθμίσεις.",
      forbidden:
        "Απαγορευμένη πρόσβαση. Ο λογαριασμός σας μπορεί να μην έχει άδεια αποστολής SMS ή το sender ID δεν είναι approved.",
      serverError:
        "Σφάλμα SMSme.gr server. Αυτό μπορεί να οφείλεται σε:\n1. Sender ID που δεν είναι approved (τα alphanumeric sender IDs πρέπει να εγκριθούν από το SMSme.gr support)\n2. Ανεπαρκές balance/credits\n3. Μη έγκυρη μορφή παραλήπτη\nΠαρακαλώ ελέγξτε τις ρυθμίσεις του SMSme.gr account σας ή επικοινωνήστε με την υποστήριξη.",
      testNotInitialized:
        "Η υπηρεσία SMS δεν έχει ρυθμιστεί. Ρυθμίστε τα credentials στις Ρυθμίσεις.",
      testAuthFailed:
        "Αποτυχία authentication. Παρακαλώ ελέγξτε το username και τον κωδικό σας.",
      testBalanceFailed:
        "Το token είναι έγκυρο αλλά απέτυχε η ανάκτηση του balance. Ελέγξτε τα δικαιώματα του λογαριασμού σας.",
      testSuccess: "Επιτυχής σύνδεση! Υπόλοιπο λογαριασμού: €{{balance}}",
    },
  },
} as const;

export default notifications;
