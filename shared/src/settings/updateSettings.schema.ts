import { z } from 'zod';
import { sortFieldSchema } from './sortField.schema';
import { sortDirectionSchema } from './sortDirection.schema';

export const updateSettingsSchema = z.object({
  sortField: sortFieldSchema,
  sortDirection: sortDirectionSchema,
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
