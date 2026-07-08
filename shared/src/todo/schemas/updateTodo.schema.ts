import { z } from 'zod';
import { titleSchema } from './titleField.schema';
import { descriptionSchema } from './descriptionField.schema';
import { dueAtSchema } from './dueAtField.schema';

export const updateTodoSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.nullable().optional(),
    dueAt: dueAtSchema.optional(),
    isCompleted: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
