import { z } from 'zod';

export const sortFieldSchema = z.enum(['createdAt', 'updatedAt', 'title']);

export type SortField = z.infer<typeof sortFieldSchema>;
