import i18n from "@/shared/i18n";

// Keys are the values stored in the DB; values are locale keys.
const METHOD_KEYS = {
  Μετρητα: "cash",
  Καρτα: "card",
  "Τραπεζικη Μεταφορα": "bankTransfer",
  IRIS: "iris",
  Αλλο: "other",
} as const;

type StoredMethod = keyof typeof METHOD_KEYS;

export const METHOD_OPTIONS = Object.keys(METHOD_KEYS) as StoredMethod[];

export const DEFAULT_METHOD: StoredMethod = "Μετρητα";

export const paymentMethodLabel = (method: string): string =>
  method in METHOD_KEYS
    ? i18n.t(`payments:methods.${METHOD_KEYS[method as StoredMethod]}`)
    : method;
