import { z } from 'zod';

export const sortFieldSchema = z.enum(['createdAt', 'updatedAt', 'title']);

export type SortField = z.infer<typeof sortFieldSchema>;

export const sortDirectionSchema = z.enum(['asc', 'desc']);

export type SortDirection = z.infer<typeof sortDirectionSchema>;

export const settingsSchema = z.object({
  sortField: sortFieldSchema,
  sortDirection: sortDirectionSchema,
  updatedAt: z.coerce.date(),
});

export type Settings = z.infer<typeof settingsSchema>;

export const updateSettingsSchema = z.object({
  sortField: sortFieldSchema,
  sortDirection: sortDirectionSchema,
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
