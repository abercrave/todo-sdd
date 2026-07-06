import { Injectable } from '@nestjs/common';
import { createTodoSchema } from 'shared';
import type { CreateTodoInput, Todo } from 'shared';
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
