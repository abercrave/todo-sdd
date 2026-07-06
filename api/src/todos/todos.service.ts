import { Injectable, NotFoundException } from '@nestjs/common';
import { createTodoSchema, updateTodoSchema } from 'shared';
import type { CreateTodoInput, Todo, UpdateTodoInput } from 'shared';
import { parseWithZod } from '../common/zod-validation.pipe.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { todos as TodoRow } from '../generated/prisma/client.js';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateTodoInput): Promise<Todo> {
    const data = parseWithZod(createTodoSchema, input);

    const row = await this.prisma.todos.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        due_at: data.dueAt ?? null,
      },
    });

    return this.toApiTodo(row);
  }

  async findAll(): Promise<Todo[]> {
    const rows = await this.prisma.todos.findMany({
      orderBy: { due_at: 'asc' },
    });
    return rows.map((row) => this.toApiTodo(row));
  }

  async update(id: number, input: UpdateTodoInput): Promise<Todo> {
    const data = parseWithZod(updateTodoSchema, input);

    const existing = await this.prisma.todos.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Todo ${id} not found`);
    }

    const row = await this.prisma.todos.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.dueAt !== undefined && { due_at: data.dueAt }),
        ...(data.isCompleted !== undefined && {
          is_completed: data.isCompleted,
        }),
      },
    });

    return this.toApiTodo(row);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.prisma.todos.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Todo ${id} not found`);
    }

    await this.prisma.todos.delete({ where: { id } });
  }

  private toApiTodo(row: TodoRow): Todo {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      isCompleted: row.is_completed,
      dueAt: row.due_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
