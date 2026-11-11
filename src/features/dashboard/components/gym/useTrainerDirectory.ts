import { useMemo } from "react";
import { useStaff } from "@/features/staff";
import type { ClassSlot } from "../../lib/analytics";

export interface TrainerOption {
  /** Name used as `instructor` on bookings (the trainer's first name). */
  key: string;
  label: string;
}

/**
 * Trainers known to the schedule, labelled with their full staff name.
 * Manager views only (listing staff needs the `staff.manage` permission).
 */
export function useTrainerDirectory(slots: ClassSlot[]) {
  const { users } = useStaff();
  return useMemo(() => {
    const labels = new Map<string, string>();
    users
      .filter((u) => u.role === "trainer")
      .forEach((u) => {
        const key = (u.fullName ?? u.email).split(" ")[0];
        labels.set(key, u.fullName ?? u.email);
      });
    slots.forEach((s) => {
      if (s.instructor && !labels.has(s.instructor)) labels.set(s.instructor, s.instructor);
    });
    const options: TrainerOption[] = [...labels.entries()]
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return { options, labelOf: (key: string) => labels.get(key) ?? key };
  }, [users, slots]);
}
