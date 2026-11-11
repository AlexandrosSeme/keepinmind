const payments = {
  page: {
    title: "Πληρωμές",
    newPayment: "Νέα Πληρωμή",
    confirmDelete: "Διαγραφή πληρωμής €{{amount}} από {{name}};",
    deleteError:
      "Αποτυχία διαγραφής. Βεβαιωθείτε ότι τρέχει το API (npm run api).",
    updateError:
      "Αποτυχία ενημέρωσης. Βεβαιωθείτε ότι τρέχει το API (npm run api).",
    createError:
      "Αποτυχία δημιουργίας πληρωμής. Βεβαιωθείτε ότι τρέχει το API (npm run api).",
  },
  fields: {
    member: "Μέλος",
    amount: "Ποσό",
    amountEuro: "Ποσό (€)",
    date: "Ημερομηνία",
    method: "Μέθοδος",
    status: "Κατάσταση",
    fullName: "Ονοματεπώνυμο",
  },
  table: {
    actions: "Ενέργειες",
    empty: "Δεν υπάρχουν πληρωμές. Προσθέστε την πρώτη με «Νέα Πληρωμή».",
    view: "Προβολή",
  },
  form: {
    editTitle: "Επεξεργασία Πληρωμής",
    pickMember: "Επιλογή μέλους",
    manualEntry: "— Χειροκίνητη εισαγωγή —",
  },
  details: {
    title: "Λεπτομέρειες Πληρωμής",
  },
  methods: {
    cash: "Μετρητά",
    card: "Κάρτα",
    bankTransfer: "Τραπεζική Μεταφορά",
    iris: "IRIS",
    other: "Άλλο",
  },
} as const;

export default payments;
