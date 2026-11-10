import { supabase } from "@/shared/api/supabaseClient";
import type { Announcement } from "./types";

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
  if (!supabase) {
    return SAMPLE_ANNOUNCEMENTS;
  }

  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn(
        "[Announcements] Table missing or error — using sample:",
        error.message,
      );
      return SAMPLE_ANNOUNCEMENTS;
    }

    if (!data || data.length === 0) {
      return SAMPLE_ANNOUNCEMENTS;
    }

    return data as Announcement[];
  } catch (err) {
    console.error("[Announcements] Exception:", err);
    return SAMPLE_ANNOUNCEMENTS;
  }
}

export async function createAnnouncement(
  announcement: Omit<Announcement, "id" | "created_at">,
): Promise<Announcement | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("announcements")
    .insert([announcement])
    .select()
    .single();

  if (error) {
    console.error("[Announcements] Create error:", error);
    return null;
  }

  return data as Announcement;
}
