import { z } from 'zod';

export const dueAtSchema = z.union([z.null(), z.coerce.date()]);
