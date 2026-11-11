const dashboard = {
  title: "Dashboard",
  all: "Όλα",
  quickActions: {
    member: "Μέλος",
    payment: "Πληρωμή",
    qr: "QR",
    debt: "Οφειλή",
  },
  kpi: {
    members: "Μέλη",
    active: "Ενεργές",
    expiring: "Λήγουν",
    debts: "Οφειλές",
    revenue: "Έσοδα",
    pending: "Εκκρεμή",
  },
  expiries: {
    title: "Επερχόμενες Λήξεις",
    empty: "Καμία λήξη",
    days: "{{days}}η",
  },
  debts: {
    title: "Οφειλές",
    empty: "Καμία οφειλή",
    days_one: "{{count}} ημ.",
    days_other: "{{count}} ημ.",
    payment: "Πληρωμή",
  },
  distribution: {
    title: "Κατανομή Μελών",
    empty: "Χωρίς μέλη ακόμη",
    center: "ΜΕΛΗ",
    tooltip_one: "{{label}}: {{count}} μέλος",
    tooltip_other: "{{label}}: {{count}} μέλη",
    labels: {
      active: "Ενεργά",
      expiring: "Λήγουν",
      expired: "Ληγμένα",
    },
  },
  revenue: {
    title: "Έσοδα (6 μήνες)",
    dataset: "Έσοδα",
    payments: "Πληρωμές",
  },
  paymentStatus: {
    title: "Κατάσταση πληρωμών",
    details: "Λεπτομέρειες",
    completed: "Ολοκληρωμένες",
    pending: "Εκκρεμείς",
    failed: "Αποτυχίες",
  },
} as const;

export default dashboard;
