const subscriptions = {
  page: {
    title: "Πακέτα Συνδρομών",
    newPackage: "Νέο Πακέτο",
    emptyTitle: "Δεν υπάρχουν πακέτα συνδρομών",
    emptyText: "Δημιουργήστε το πρώτο πακέτο συνδρομής για να ξεκινήσετε",
    createPackage: "Δημιουργία Πακέτου",
  },
  confirmDelete:
    "Είστε σίγουροι ότι θέλετε να διαγράψετε το πακέτο «{{name}}»;",
  errors: {
    delete: "Αποτυχία διαγραφής. Ελέγξτε τη σύνδεση με τη βάση.",
    update: "Αποτυχία ενημέρωσης πακέτου.",
    create: "Αποτυχία δημιουργίας πακέτου. Ελέγξτε τη σύνδεση με τη βάση.",
  },
  fields: {
    name: "Όνομα πακέτου",
    namePlaceholder: "π.χ. Μηνιαία Unlimited",
    category: "Κατηγορία",
    duration: "Διάρκεια",
    durationPlaceholder: "π.χ. 30 ημέρες / 10 επισκέψεις",
    price: "Τιμή (€)",
    activeMembers: "Ενεργά μέλη",
  },
  form: {
    newTitle: "Νέο Πακέτο",
    editTitle: "Επεξεργασία Πακέτου",
  },
} as const;

export default subscriptions;
