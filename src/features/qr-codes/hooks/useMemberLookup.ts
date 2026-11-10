import { useEffect, useState } from "react";
import { supabase } from "@/shared/api/supabaseClient";
import type { Member } from "@/features/members";

interface LookupParams {
  id: string | null;
  /** Pass (even as null) to enable phone lookup as a fallback. */
  phone?: string | null;
}

/** Loads a single member by id (or phone as fallback) for the standalone QR pages. */
export function useMemberLookup({ id, phone }: LookupParams) {
  const supportsPhone = phone !== undefined;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id && !phone) {
        setError(
          supportsPhone
            ? "Δεν βρεθηκε ID η τηλεφωνο μελους"
            : "Δεν βρεθηκε ID μελους",
        );
        setLoading(false);
        return;
      }

      if (!supabase) {
        setError("Η συνδεση με τη βαση δεδομενων δεν ειναι διαθεσιμη");
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from("members").select("*");
        query = id ? query.eq("id", id) : query.eq("phone", phone!);
        const { data, error: fetchError } = await query.single();

        if (fetchError || !data) {
          setError(
            supportsPhone
              ? "Δεν βρεθηκε μελος"
              : "Δεν βρεθηκε μελος με αυτο το ID",
          );
        } else {
          setMember(data as Member);
        }
      } catch {
        setError("Σφαλμα κατα τη φορτωση των δεδομενων");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, phone, supportsPhone]);

  return { member, loading, error };
}
