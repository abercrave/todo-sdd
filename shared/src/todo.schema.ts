import { z } from 'zod';

const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(255, 'Title must be 255 characters or fewer');

const descriptionSchema = z
  .string()
  .trim()
  .max(2000, 'Description must be 2000 characters or fewer');

const dueAtSchema = z.union([z.null(), z.coerce.date()]);

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

export const createTodoSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  dueAt: dueAtSchema.optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

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
