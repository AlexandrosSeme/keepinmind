const members = {
  page: {
    title: "Μέλη Γυμναστηρίου",
    newMember: "Νέο Μέλος",
    searchPlaceholder: "Αναζήτηση μέλους (όνομα, τηλέφωνο)...",
    filters: "Φίλτρα",
    export: "Export",
    addTitle: "Προσθήκη Νέου Μέλους",
    editTitle: "Επεξεργασία Μέλους",
  },
  confirmDelete: "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το μέλος;",
  fields: {
    name: "Ονοματεπώνυμο",
    phone: "Τηλέφωνο",
    email: "Email",
    status: "Κατάσταση",
    package: "Πακέτο",
    expiry: "Λήξη",
    expiryDate: "Ημερομηνία Λήξης",
    photo: "Φωτογραφία Προφίλ",
    actions: "Ενέργειες",
    yearAttendance: "Έτος προσελεύσεων",
    notSet: "Δεν έχει οριστεί",
  },
  actions: {
    view: "Προβολή",
    activateCard: "Ενεργοποίηση Κάρτας",
    printNewCard: "Εκτύπωση Νέας Κάρτας",
    cancelCard: "Ακύρωση Κάρτας",
    cancelCardLost: "Ακύρωση Κάρτας (Χαμένη)",
  },
  cardLost: {
    confirmActivate:
      "Είστε σίγουροι ότι θέλετε να ενεργοποιήσετε την κάρτα του {{name}};",
    confirmCancel:
      "Είστε σίγουροι ότι θέλετε να ακυρώσετε την κάρτα του {{name}};\n\nΑυτό θα εμποδίσει τη χρήση της κάρτας μέχρι να εκτυπωθεί νέα.",
    activated: "Η κάρτα του {{name}} ενεργοποιήθηκε επιτυχώς.",
    cancelled:
      "Η κάρτα του {{name}} ακυρώθηκε. Μπορείτε να εκτυπώσετε νέα κάρτα.",
  },
  details: {
    title: "Στοιχεία Μέλους",
    backToList: "Επιστροφή στη Λίστα",
    errors: {
      noId: "Δεν βρέθηκε ID μέλους",
      noDb: "Η σύνδεση με τη βάση δεδομένων δεν είναι διαθέσιμη",
      notFoundById: "Δεν βρέθηκε μέλος με αυτό το ID",
      load: "Σφάλμα κατά τη φόρτωση των δεδομένων",
      notFound: "Δεν βρέθηκε μέλος",
    },
  },
  attendance: {
    title: "Προσελεύσεις",
    chartTitle: "Προσελεύσεις ανά μήνα",
    tooltip_one: "{{count}} προσέλευση",
    tooltip_other: "{{count}} προσελεύσεις",
    week: "Εβδομάδα",
    month: "Μήνας",
    year: "Έτος",
  },
  logs: {
    empty: "Δεν υπάρχουν καταγραφές",
    date: "Ημ/νία",
    method: "Τρόπος",
    status: "Κατάσταση",
    message: "Μήνυμα",
  },
} as const;

export default members;
