import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from './settings.service.js';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: {
    settings: {
      findUnique: ReturnType<typeof jest.fn>;
      upsert: ReturnType<typeof jest.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      settings: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SettingsService);
  });

  describe('getSettings', () => {
    it('returns the documented defaults when no row exists', async () => {
      prisma.settings.findUnique.mockResolvedValue(null);

      const result = await service.getSettings();

      expect(prisma.settings.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result.sortField).toBe('createdAt');
      expect(result.sortDirection).toBe('desc');
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('returns the existing row mapped to the API shape', async () => {
      const now = new Date('2026-07-06T12:00:00.000Z');
      prisma.settings.findUnique.mockResolvedValue({
        id: 1,
        sort_field: 'title',
        sort_direction: 'asc',
        updated_at: now,
      });

      const result = await service.getSettings();

      expect(result).toEqual({
        sortField: 'title',
        sortDirection: 'asc',
        updatedAt: now,
      });
    });
  });

  describe('updateSettings', () => {
    it('upserts the id:1 row with the given field and direction', async () => {
      const now = new Date('2026-07-06T12:00:00.000Z');
      prisma.settings.upsert.mockResolvedValue({
        id: 1,
        sort_field: 'title',
        sort_direction: 'asc',
        updated_at: now,
      });

      const result = await service.updateSettings({
        sortField: 'title',
        sortDirection: 'asc',
      });

      expect(prisma.settings.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        create: { id: 1, sort_field: 'title', sort_direction: 'asc' },
        update: { sort_field: 'title', sort_direction: 'asc' },
      });
      expect(result).toEqual({
        sortField: 'title',
        sortDirection: 'asc',
        updatedAt: now,
      });
    });

    it('rejects an invalid sortField without touching the database', async () => {
      await expect(
        service.updateSettings({
          // @ts-expect-error testing invalid input at the runtime boundary
          sortField: 'notAField',
          sortDirection: 'asc',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.settings.upsert).not.toHaveBeenCalled();
    });
  });
});
