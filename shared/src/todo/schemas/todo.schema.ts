import { z } from 'zod';
import { dueAtSchema } from './dueAtField.schema';

export const todoSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  isCompleted: z.boolean(),
  dueAt: dueAtSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Todo = z.infer<typeof todoSchema>;

export const todoListSchema = todoSchema.array();
