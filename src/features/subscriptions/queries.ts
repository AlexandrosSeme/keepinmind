import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPackage,
  deletePackage,
  fetchPackages,
  updatePackage,
} from "./api";
import type { PackageInput } from "./types";

export const packageKeys = {
  all: ["packages"] as const,
};

export function usePackages() {
  const { data = [], ...rest } = useQuery({
    queryKey: packageKeys.all,
    queryFn: fetchPackages,
  });
  return { packages: data, ...rest };
}

export function usePackageMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: packageKeys.all });

  const add = useMutation({
    mutationFn: createPackage,
    onSuccess: (result) => (result ? invalidate() : undefined),
  });
  const edit = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<PackageInput>;
    }) => updatePackage(id, updates),
    onSuccess: (result) => (result ? invalidate() : undefined),
  });
  const remove = useMutation({
    mutationFn: deletePackage,
    onSuccess: (ok) => (ok ? invalidate() : undefined),
  });

  return {
    addPackage: add.mutateAsync,
    editPackage: (id: number, updates: Partial<PackageInput>) =>
      edit.mutateAsync({ id, updates }),
    removePackage: remove.mutateAsync,
  };
}
