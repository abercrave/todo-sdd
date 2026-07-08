import 'dotenv/config';
import type { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/http-exception.filter.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

interface SettingsResponseBody {
  sortField: string;
  sortDirection: string;
  updatedAt: string;
}

interface ErrorResponseBody {
  message: string;
  errors: Array<{ path: string; message: string }>;
}

describe('Settings (e2e)', () => {
  let app: INestApplication<Server>;
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
    await prisma.settings.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /settings', () => {
    it('returns the documented defaults when no preference has been saved', async () => {
      const response = await request(app.getHttpServer())
        .get('/settings')
        .expect(200);

      const body = response.body as SettingsResponseBody;
      expect(body).toMatchObject({
        sortField: 'createdAt',
        sortDirection: 'desc',
      });
      expect(body.updatedAt).toBeDefined();
    });
  });

  describe('PUT /settings', () => {
    it('saves a valid preference and reflects it on a subsequent GET', async () => {
      const putResponse = await request(app.getHttpServer())
        .put('/settings')
        .send({ sortField: 'title', sortDirection: 'asc' })
        .expect(200);

      expect(putResponse.body).toMatchObject({
        sortField: 'title',
        sortDirection: 'asc',
      });

      const getResponse = await request(app.getHttpServer())
        .get('/settings')
        .expect(200);

      expect(getResponse.body).toMatchObject({
        sortField: 'title',
        sortDirection: 'asc',
      });
    });

    it('upserts rather than creating a second row when called twice', async () => {
      await request(app.getHttpServer())
        .put('/settings')
        .send({ sortField: 'title', sortDirection: 'asc' })
        .expect(200);

      await request(app.getHttpServer())
        .put('/settings')
        .send({ sortField: 'updatedAt', sortDirection: 'desc' })
        .expect(200);

      const rows = await prisma.settings.findMany();
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        sort_field: 'updatedAt',
        sort_direction: 'desc',
      });
    });

    it('rejects an invalid sortField with 400 and does not persist a row', async () => {
      const response = await request(app.getHttpServer())
        .put('/settings')
        .send({ sortField: 'notAField', sortDirection: 'asc' })
        .expect(400);

      const body = response.body as ErrorResponseBody;
      expect(body.message).toBeDefined();
      expect(Array.isArray(body.errors)).toBe(true);

      const rows = await prisma.settings.findMany();
      expect(rows).toHaveLength(0);
    });

    it('rejects an invalid sortDirection with 400 and does not persist a row', async () => {
      const response = await request(app.getHttpServer())
        .put('/settings')
        .send({ sortField: 'title', sortDirection: 'sideways' })
        .expect(400);

      const body = response.body as ErrorResponseBody;
      expect(body.message).toBeDefined();
      expect(Array.isArray(body.errors)).toBe(true);

      const rows = await prisma.settings.findMany();
      expect(rows).toHaveLength(0);
    });
  });
});
