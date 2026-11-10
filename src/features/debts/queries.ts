import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDebt, deleteDebt, fetchDebts, updateDebt } from "./api";
import type { DebtInput } from "./types";

export const debtKeys = {
  all: ["debts"] as const,
};

export function useDebts() {
  const { data = [], ...rest } = useQuery({
    queryKey: debtKeys.all,
    queryFn: fetchDebts,
  });
  return { debts: data, ...rest };
}

export function useDebtMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: debtKeys.all });

  const add = useMutation({
    mutationFn: createDebt,
    onSuccess: (result) => (result ? invalidate() : undefined),
  });
  const edit = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<DebtInput>;
    }) => updateDebt(id, updates),
    onSuccess: (result) => (result ? invalidate() : undefined),
  });
  const remove = useMutation({
    mutationFn: deleteDebt,
    onSuccess: (ok) => (ok ? invalidate() : undefined),
  });

  return {
    addDebt: add.mutateAsync,
    editDebt: (id: number, updates: Partial<DebtInput>) =>
      edit.mutateAsync({ id, updates }),
    removeDebt: remove.mutateAsync,
  };
}
