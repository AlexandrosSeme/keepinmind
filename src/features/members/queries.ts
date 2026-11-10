import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMember, deleteMember, fetchMembers, updateMember } from "./api";
import type { MemberInput } from "./types";

export const memberKeys = {
  all: ["members"] as const,
};

export function useMembers() {
  const { data = [], ...rest } = useQuery({
    queryKey: memberKeys.all,
    queryFn: fetchMembers,
  });
  return { members: data, ...rest };
}

export function useMemberMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: memberKeys.all });

  const add = useMutation({
    mutationFn: createMember,
    onSuccess: (result) => (result ? invalidate() : undefined),
  });
  const edit = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<MemberInput>;
    }) => updateMember(id, updates),
    onSuccess: (result) => (result ? invalidate() : undefined),
  });
  const remove = useMutation({
    mutationFn: deleteMember,
    onSuccess: (ok) => (ok ? invalidate() : undefined),
  });

  return {
    addMember: add.mutateAsync,
    editMember: (id: number, updates: Partial<MemberInput>) =>
      edit.mutateAsync({ id, updates }),
    removeMember: remove.mutateAsync,
  };
}
