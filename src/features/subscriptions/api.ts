import { createCollection } from "@/shared/api/collection";
import type { Package, PackageInput } from "./types";

const packages = createCollection<Package, PackageInput>("packages");

export const fetchPackages = (): Promise<Package[]> =>
  packages.list({ _sort: "id", _order: "asc" });

export const createPackage = (pkg: PackageInput): Promise<Package | null> =>
  packages.create(pkg);

export const updatePackage = (
  id: number,
  updates: Partial<PackageInput>,
): Promise<Package | null> => packages.update(id, updates);

export const deletePackage = (id: number): Promise<boolean> =>
  packages.remove(id);
