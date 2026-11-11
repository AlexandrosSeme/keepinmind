import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPayment,
  deletePayment,
  fetchPayments,
  updatePayment,
} from "./api";
import type { PaymentInput } from "./types";

export const paymentKeys = {
  all: ["payments"] as const,
};

export function usePayments({ enabled = true }: { enabled?: boolean } = {}) {
  const { data = [], ...rest } = useQuery({
    queryKey: paymentKeys.all,
    queryFn: fetchPayments,
    enabled,
  });
  return { payments: data, ...rest };
}

export function usePaymentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: paymentKeys.all });

  const add = useMutation({
    mutationFn: createPayment,
    onSuccess: (result) => (result ? invalidate() : undefined),
  });
  const edit = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<PaymentInput>;
    }) => updatePayment(id, updates),
    onSuccess: (result) => (result ? invalidate() : undefined),
  });
  const remove = useMutation({
    mutationFn: deletePayment,
    onSuccess: (ok) => (ok ? invalidate() : undefined),
  });

  return {
    addPayment: add.mutateAsync,
    editPayment: (id: number, updates: Partial<PaymentInput>) =>
      edit.mutateAsync({ id, updates }),
    removePayment: remove.mutateAsync,
  };
}
