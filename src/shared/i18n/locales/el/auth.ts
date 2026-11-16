const auth = {
  roles: {
    admin: "Διαχειριστής (Dev)",
    owner: "Ιδιοκτήτης",
    trainer: "Γυμναστής",
  },
  logout: "Αποσύνδεση",
  fields: {
    email: "Email",
    password: "Κωδικός",
    confirmPassword: "Επιβεβαίωση κωδικού",
    passwordHint: "Τουλάχιστον {{min}} χαρακτήρες.",
  },
  login: {
    subtitle: "Σύνδεση προσωπικού",
    submit: "Σύνδεση",
    submitting: "Σύνδεση...",
    forgotHint:
      "Ξεχάσατε τον κωδικό; Ζητήστε από τον διαχειριστή ή τον ιδιοκτήτη να τον αλλάξει.",
    memberHint: "Είστε μέλος;",
    memberLink: "Μεταβείτε στην πύλη μέλους",
  },
  changePassword: {
    title: "Αλλαγή κωδικού",
    current: "Τρέχων κωδικός",
    new: "Νέος κωδικός",
    success: "Ο κωδικός άλλαξε.",
  },
  errors: {
    invalid_credentials: "Λάθος email ή κωδικός.",
    not_signed_in: "Η σύνδεσή σας έληξε. Συνδεθείτε ξανά.",
    forbidden: "Δεν έχετε δικαίωμα για αυτή την ενέργεια.",
    not_found: "Ο χρήστης δεν βρέθηκε.",
    invalid_email: "Μη έγκυρο email.",
    weak_password: "Ο κωδικός πρέπει να έχει τουλάχιστον {{min}} χαρακτήρες.",
    wrong_password: "Ο τρέχων κωδικός είναι λάθος.",
    password_mismatch: "Οι κωδικοί δεν ταιριάζουν.",
    already_exists: "Υπάρχει ήδη χρήστης με αυτό το email.",
    cannot_change_own_role: "Δεν μπορείτε να αλλάξετε τον δικό σας ρόλο.",
    cannot_delete_self: "Δεν μπορείτε να διαγράψετε τον εαυτό σας.",
    api_unavailable:
      "Δεν υπάρχει σύνδεση με το API. Βεβαιωθείτε ότι τρέχει το «npm run api».",
    generic: "Σφάλμα: {{message}}",
  },
  forbidden: {
    title: "Δεν έχετε πρόσβαση",
    text: "Ο ρόλος σας δεν επιτρέπει την προβολή αυτής της σελίδας.",
    back: "Επιστροφή στο Dashboard",
  },
} as const;

export default auth;
