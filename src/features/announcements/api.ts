import { createCollection } from "@/shared/api/collection";
import { logger } from "@/shared/lib/logger";
import type { Announcement } from "./types";

const announcements = createCollection<Announcement>("announcements");

const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "Καλως ηρθες στο Melos",
    body: "Η πυλη μελων ειναι ετοιμη. Δες το προγραμμα, κλεισε θεση σε ταξεις και εχε παντα το QR σου για εισοδο.",
    audience: "all",
    published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Ωραριο γυμναστηριου",
    body: "Δευτερα–Παρασκευη 06:00–23:00. Σαββατο 08:00–20:00. Κυριακη 09:00–14:00.",
    audience: "all",
    published: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Νεα ομαδικα μαθηματα",
    body: "Απο αυτη την εβδομαδα: Boxing, Hyrox Prep και Mobility. Κλεισε θεση απο το Προγραμμα.",
    audience: "active",
    published: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    const data = await announcements.list({
      published: true,
      _sort: "created_at",
      _order: "desc",
    });
    return data.length > 0 ? data : SAMPLE_ANNOUNCEMENTS;
  } catch (err) {
    logger.warn("[Announcements] API unavailable — using sample:", err);
    return SAMPLE_ANNOUNCEMENTS;
  }
}

export function createAnnouncement(
  announcement: Omit<Announcement, "id" | "created_at">,
): Promise<Announcement | null> {
  return announcements.create({
    ...announcement,
    created_at: new Date().toISOString(),
  });
}