import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service.js';
import { TodosService } from './todos.service.js';

describe('TodosService', () => {
  let service: TodosService;
  let prisma: {
    todos: {
      create: ReturnType<typeof jest.fn>;
      findMany: ReturnType<typeof jest.fn>;
      findUnique: ReturnType<typeof jest.fn>;
      update: ReturnType<typeof jest.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      todos: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TodosService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TodosService);
  });

  describe('create', () => {
    it('creates a todo with the given fields', async () => {
      const now = new Date('2026-07-06T12:00:00.000Z');
      const dueAt = new Date('2026-07-10T00:00:00.000Z');
      prisma.todos.create.mockResolvedValue({
        id: 1,
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        is_completed: false,
        due_at: dueAt,
        created_at: now,
        updated_at: now,
      });

      const result = await service.create({
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        dueAt,
      });

      expect(prisma.todos.create).toHaveBeenCalledWith({
        data: {
          title: 'Buy groceries',
          description: 'Milk, eggs, bread',
          due_at: dueAt,
        },
      });
      expect(result).toEqual({
        id: 1,
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        isCompleted: false,
        dueAt,
        createdAt: now,
        updatedAt: now,
      });
    });

    it('rejects a blank title without touching the database', async () => {
      await expect(service.create({ title: '   ' })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.todos.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all todos mapped to the API shape', async () => {
      const now = new Date('2026-07-06T12:00:00.000Z');
      prisma.todos.findMany.mockResolvedValue([
        {
          id: 1,
          title: 'A',
          description: null,
          is_completed: false,
          due_at: null,
          created_at: now,
          updated_at: now,
        },
      ]);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: 1,
          title: 'A',
          description: null,
          isCompleted: false,
          dueAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    });
  });

  describe('update', () => {
    const now = new Date('2026-07-06T12:00:00.000Z');
    const existingRow = {
      id: 1,
      title: 'A',
      description: null,
      is_completed: false,
      due_at: null,
      created_at: now,
      updated_at: now,
    };

    it('toggles isCompleted on an existing todo', async () => {
      prisma.todos.findUnique.mockResolvedValue(existingRow);
      prisma.todos.update.mockResolvedValue({
        ...existingRow,
        is_completed: true,
      });

      const result = await service.update(1, { isCompleted: true });

      expect(prisma.todos.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.todos.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { is_completed: true },
      });
      expect(result.isCompleted).toBe(true);
    });

    it('throws NotFoundException when the todo does not exist', async () => {
      prisma.todos.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { isCompleted: true })).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.todos.update).not.toHaveBeenCalled();
    });

    it('rejects a blank title on edit without touching the database', async () => {
      prisma.todos.findUnique.mockResolvedValue(existingRow);

      await expect(service.update(1, { title: '   ' })).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.todos.update).not.toHaveBeenCalled();
    });
  });
});
