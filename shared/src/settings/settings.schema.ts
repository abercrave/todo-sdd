import { z } from 'zod';
import { sortFieldSchema } from './sortField.schema';
import { sortDirectionSchema } from './sortDirection.schema';

export const settingsSchema = z.object({
  sortField: sortFieldSchema,
  sortDirection: sortDirectionSchema,
  updatedAt: z.coerce.date(),
});

export type Settings = z.infer<typeof settingsSchema>;
