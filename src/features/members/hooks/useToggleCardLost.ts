import { useTranslation } from "react-i18next";
import { useMemberMutations } from "../queries";
import type { Member } from "../types";

/** Confirms with the user, then flips `card_lost` and reports the outcome. */
export function useToggleCardLost() {
  const { t } = useTranslation("members");
  const { editMember } = useMemberMutations();

  return async (member: Member): Promise<Member | null> => {
    const isCurrentlyLost = member.card_lost === true;
    const confirmMessage = isCurrentlyLost
      ? t("cardLost.confirmActivate", { name: member.name })
      : t("cardLost.confirmCancel", { name: member.name });

    if (!window.confirm(confirmMessage)) return null;

    const updated = await editMember(member.id, {
      card_lost: !isCurrentlyLost,
    });
    if (updated) {
      alert(
        isCurrentlyLost
          ? t("cardLost.activated", { name: member.name })
          : t("cardLost.cancelled", { name: member.name }),
      );
    }
    return updated;
  };
}
