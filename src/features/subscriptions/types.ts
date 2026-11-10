export interface Package {
  id: number;
  name: string;
  category: "subscription" | "hourly" | "kids";
  duration: string;
  price: number;
  active: number;
}

export type PackageInput = Omit<Package, "id">;
