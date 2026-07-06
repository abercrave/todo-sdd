import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/http-exception.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

interface TodoResponseBody {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ErrorResponseBody {
  message: string;
  errors: Array<{ path: string; message: string }>;
}

describe('Todos (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.todos.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /todos', () => {
    it('creates a todo and returns it', async () => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .send({
          title: 'Buy groceries',
          description: 'Milk',
          dueAt: '2026-07-10',
        })
        .expect(201);

      const body = response.body as TodoResponseBody;
      expect(body).toMatchObject({
        title: 'Buy groceries',
        description: 'Milk',
        isCompleted: false,
      });
      expect(body.id).toEqual(expect.any(Number));
    });

    it('rejects a blank title with 400 and does not create a todo', async () => {
      const response = await request(app.getHttpServer())
        .post('/todos')
        .send({ title: '   ' })
        .expect(400);

      const body = response.body as ErrorResponseBody;
      expect(body.message).toBeDefined();
      expect(Array.isArray(body.errors)).toBe(true);

      const list = await request(app.getHttpServer()).get('/todos').expect(200);
      expect(list.body).toEqual([]);
    });
  });

  describe('GET /todos', () => {
    it('returns an empty array when there are no todos', async () => {
      const response = await request(app.getHttpServer())
        .get('/todos')
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('returns previously created todos', async () => {
      await request(app.getHttpServer())
        .post('/todos')
        .send({ title: 'Task A' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/todos')
        .expect(200);
      const body = response.body as TodoResponseBody[];
      expect(body).toHaveLength(1);
      expect(body[0]).toMatchObject({ title: 'Task A' });
    });
  });
});
