import { useMemberMutations } from "../queries";
import type { Member } from "../types";

/** Confirms with the user, then flips `card_lost` and reports the outcome. */
export function useToggleCardLost() {
  const { editMember } = useMemberMutations();

  return async (member: Member): Promise<Member | null> => {
    const isCurrentlyLost = member.card_lost === true;
    const confirmMessage = isCurrentlyLost
      ? `Ειστε σιγουροι οτι θελετε να ενεργοποιησετε την καρτα του ${member.name};`
      : `Ειστε σιγουροι οτι θελετε να ακυρωσετε την καρτα του ${member.name};\n\nΑυτο θα εμποδισει τη χρηση της καρτας μεχρι να εκτυπωθει νεα.`;

    if (!window.confirm(confirmMessage)) return null;

    const updated = await editMember(member.id, {
      card_lost: !isCurrentlyLost,
    });
    if (updated) {
      alert(
        isCurrentlyLost
          ? `Η καρτα του ${member.name} ενεργοποιηθηκε επιτυχως.`
          : `Η καρτα του ${member.name} ακυρωθηκε. Μπορειτε να εκτυπωσετε νεα καρτα.`,
      );
    }
    return updated;
  };
}
