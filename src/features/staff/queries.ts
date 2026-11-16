import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStaff,
  deleteStaff,
  listStaff,
  updateStaff,
  useStaffAuth,
  type NewStaffUser,
  type StaffUserUpdate,
} from "@/features/auth";

export const staffKeys = {
  all: ["staff"] as const,
};

export function useStaff() {
  const { profile } = useStaffAuth();
  const { data = [], ...rest } = useQuery({
    queryKey: staffKeys.all,
    queryFn: () => listStaff(profile!),
    enabled: Boolean(profile),
    retry: false,
  });
  return { users: data, ...rest };
}

export function useStaffMutations() {
  const { profile } = useStaffAuth();
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: staffKeys.all });

  const create = useMutation({
    mutationFn: (input: NewStaffUser) => createStaff(profile!, input),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: (input: StaffUserUpdate) => updateStaff(profile!, input),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteStaff(profile!, id),
    onSuccess: invalidate,
  });

  return {
    createUser: create.mutateAsync,
    updateUser: update.mutateAsync,
    deleteUser: remove.mutateAsync,
  };
}
