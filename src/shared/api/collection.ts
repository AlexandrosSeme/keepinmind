import { logger } from "@/shared/lib/logger";
import { api, getOrNull, query } from "./httpClient";

/**
 * CRUD helpers for one json-server collection. Lists throw on failure (so
 * react-query can surface the error); writes log and resolve to null/false,
 * matching how the feature APIs report failures to their pages.
 */
export function createCollection<T extends { id: number }, TInput = Omit<T, "id">>(
  name: string,
) {
  const path = `/${name}`;

  return {
    list: (params: Record<string, string | number | boolean | undefined> = {}) =>
      api.get<T[]>(`${path}${query(params)}`),

    get: (id: number) => getOrNull<T>(`${path}/${id}`),

    async create(input: TInput): Promise<T | null> {
      try {
        return await api.post<T>(path, input);
      } catch (error) {
        logger.error(`[API] Error creating ${name}:`, error);
        return null;
      }
    },

    async update(id: number, updates: Partial<TInput>): Promise<T | null> {
      try {
        return await api.patch<T>(`${path}/${id}`, updates);
      } catch (error) {
        logger.error(`[API] Error updating ${name}:`, error);
        return null;
      }
    },

    async remove(id: number): Promise<boolean> {
      try {
        await api.delete(`${path}/${id}`);
        return true;
      } catch (error) {
        logger.error(`[API] Error deleting ${name}:`, error);
        return false;
      }
    },
  };
}
