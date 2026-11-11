import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import moment from "moment";
import "moment/locale/el";
import "moment/locale/en-gb";
import { resources } from "./resources";

export const LANGUAGES = ["el", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

const INTL_LOCALES: Record<Language, string> = { el: "el-GR", en: "en-GB" };

/** BCP-47 locale for `Intl` / `toLocale*String` matching the active language. */
export const intlLocale = (): string =>
  INTL_LOCALES[(i18n.resolvedLanguage as Language) ?? "el"] ?? "el-GR";

const syncDocument = (lng: string) => {
  document.documentElement.lang = lng;
  moment.locale(lng === "el" ? "el" : "en-gb");
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "el",
    supportedLngs: LANGUAGES,
    nonExplicitSupportedLngs: true,
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "km-lang",
      caches: ["localStorage"],
    },
  });

syncDocument(i18n.resolvedLanguage ?? "el");
i18n.on("languageChanged", syncDocument);

export default i18n;
