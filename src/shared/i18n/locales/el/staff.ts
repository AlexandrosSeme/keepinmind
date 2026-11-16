const staff = {
  page: {
    title: "Χρήστες",
    subtitle: "Λογαριασμοί προσωπικού και ρόλοι",
    add: "Νέος χρήστης",
  },
  fields: {
    email: "Email",
    fullName: "Ονοματεπώνυμο",
    role: "Ρόλος",
    lastSignIn: "Τελευταία σύνδεση",
    password: "Κωδικός",
    newPassword: "Νέος κωδικός",
  },
  table: {
    actions: "Ενέργειες",
    empty: "Δεν υπάρχουν χρήστες",
    you: "εσείς",
  },
  form: {
    createTitle: "Νέος χρήστης",
    editTitle: "Επεξεργασία χρήστη",
    passwordHint:
      "Αρχικός κωδικός (τουλάχιστον {{min}} χαρακτήρες). Ο χρήστης μπορεί να τον αλλάξει από το «Αλλαγή κωδικού».",
    resetPasswordHint:
      "Αφήστε κενό για να μείνει ο ίδιος κωδικός.",
  },
  confirmDelete:
    "Διαγραφή του χρήστη {{email}}; Δεν θα μπορεί πλέον να συνδεθεί.",
} as const;

export default staff;
