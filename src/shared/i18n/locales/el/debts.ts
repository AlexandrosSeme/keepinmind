const debts = {
  page: {
    title: "Οφειλές",
    subtitle: "Προβολή και διαχείριση ληξιπρόθεσμων οφειλών",
    newDebt: "Νέα Οφειλή",
    confirmDelete: "Διαγραφή οφειλής του/της {{name}} (€{{amount}});",
    deleteError: "Αποτυχία διαγραφής. Ελέγξτε τη σύνδεση με τη βάση.",
    updateError: "Αποτυχία ενημέρωσης οφειλής.",
    createError: "Αποτυχία δημιουργίας οφειλής. Ελέγξτε τη σύνδεση με τη βάση.",
  },
  fields: {
    member: "Μέλος",
    amount: "Ποσό",
    amountEuro: "Ποσό (€)",
    daysOverdue: "Ημέρες καθυστέρησης",
    status: "Κατάσταση",
    lastContact: "Τελευταία επαφή",
    fullName: "Ονοματεπώνυμο",
    phone: "Τηλέφωνο",
    email: "Email",
  },
  table: {
    actions: "Ενέργειες",
    empty: "Δεν υπάρχουν οφειλές. Προσθέστε την πρώτη με «Νέα Οφειλή».",
    days_one: "{{count}} ημέρα",
    days_other: "{{count}} ημέρες",
    call: "Κλήση",
    noPhone: "Δεν υπάρχει τηλέφωνο.",
    noEmail: "Δεν υπάρχει email.",
  },
  form: {
    editTitle: "Επεξεργασία Οφειλής",
    pickMember: "Επιλογή μέλους",
    manualEntry: "— Χειροκίνητη εισαγωγή —",
  },
} as const;

export default debts;
