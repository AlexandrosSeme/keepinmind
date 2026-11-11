import { intlLocale } from "@/shared/i18n";

export const formatEuro = (value: number) =>
  new Intl.NumberFormat(intlLocale(), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 1 }).format(value);

export const formatTime = (date: Date) =>
  date.toLocaleTimeString(intlLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

export const weekdayShort = (date: Date) =>
  date.toLocaleDateString(intlLocale(), { weekday: "short" });

export const dayMonth = (date: Date) =>
  date.toLocaleDateString(intlLocale(), { day: "numeric", month: "short" });

export const longDate = (date: Date) =>
  date.toLocaleDateString(intlLocale(), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const monthLabel = (month: number, year: number) =>
  new Date(year, month, 1).toLocaleDateString(intlLocale(), { month: "short" });
