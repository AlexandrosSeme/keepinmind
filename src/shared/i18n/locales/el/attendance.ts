const attendance = {
  page: {
    title: "Προσέλευση",
    subtitle: "Διαχείριση προσέλευσης σε προγράμματα και καταγραφή εισόδων",
    searchPlaceholder: "Αναζήτηση...",
  },
  tabs: {
    programs: "Προγράμματα & Ραντεβού",
    entranceLogs: "Logs Εισόδων",
  },
  filters: {
    allCategories: "Όλες οι κατηγορίες",
    group: "Ομαδικά",
    program: "Προγράμματα",
    appointment: "Ραντεβού",
    class: "Τάξεις",
    allStatuses: "Όλες οι καταστάσεις",
  },
  fields: {
    date: "Ημερομηνία",
    time: "Ώρα",
    dateTime: "Ημερομηνία/Ώρα",
    program: "Πρόγραμμα",
    category: "Κατηγορία",
    instructor: "Εκπαιδευτής",
    stats: "Στατιστικά",
    actions: "Ενέργειες",
    member: "Μέλος",
    name: "Όνομα",
    phone: "Τηλέφωνο",
    status: "Κατάσταση",
    recordedAt: "Ημερομηνία Καταγραφής",
    notes: "Σημειώσεις",
    subscriptionStatus: "Κατάσταση Συνδρομής",
    validation: "Επικύρωση",
    type: "Τύπος",
    message: "Μήνυμα",
  },
  programs: {
    count_one: "{{count}} πρόγραμμα",
    count_other: "{{count}} προγράμματα",
    empty: "Δεν βρέθηκαν προγράμματα",
    record: "Καταγραφή",
  },
  records: {
    title: "Καταγραφές Προσέλευσης",
    empty: "Δεν βρέθηκαν καταγραφές",
  },
  entrance: {
    refresh: "Ανανέωση logs",
    valid: "{{total}} Έγκυρες",
    invalid: "{{total}} Μη Έγκυρες",
    expiringSoon: "{{total}} Λήγουν Σύντομα",
    empty: "Δεν υπάρχουν logs εισόδων",
    emptyHint: "Οι είσοδοι από QR scanner θα εμφανίζονται εδώ",
  },
  modal: {
    title: "Καταγραφή Προσέλευσης - {{title}}",
    members: "Μέλη",
    noMembers: "Δεν υπάρχουν μέλη",
  },
} as const;

export default attendance;
