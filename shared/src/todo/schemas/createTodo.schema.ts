import { z } from 'zod';
import { titleSchema } from './titleField.schema';
import { descriptionSchema } from './descriptionField.schema';
import { dueAtSchema } from './dueAtField.schema';

export const createTodoSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  dueAt: dueAtSchema.optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
