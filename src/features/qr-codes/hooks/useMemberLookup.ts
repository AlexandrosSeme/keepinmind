import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/shared/api/supabaseClient";
import type { Member } from "@/features/members";

type LookupError =
  | "noIdOrPhone"
  | "noId"
  | "connection"
  | "notFound"
  | "notFoundById"
  | "loadError";

interface LookupParams {
  id: string | null;
  /** Pass (even as null) to enable phone lookup as a fallback. */
  phone?: string | null;
}

/** Loads a single member by id (or phone as fallback) for the standalone QR pages. */
export function useMemberLookup({ id, phone }: LookupParams) {
  const { t } = useTranslation("qrCodes");
  const supportsPhone = phone !== undefined;
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LookupError | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id && !phone) {
        setError(supportsPhone ? "noIdOrPhone" : "noId");
        setLoading(false);
        return;
      }

      if (!supabase) {
        setError("connection");
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from("members").select("*");
        query = id ? query.eq("id", id) : query.eq("phone", phone!);
        const { data, error: fetchError } = await query.single();

        if (fetchError || !data) {
          setError(supportsPhone ? "notFound" : "notFoundById");
        } else {
          setMember(data as Member);
        }
      } catch {
        setError("loadError");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, phone, supportsPhone]);

  return { member, loading, error: error ? t(`lookup.${error}`) : null };
}
