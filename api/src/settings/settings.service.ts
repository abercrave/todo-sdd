import { Injectable } from '@nestjs/common';
import { updateSettingsSchema } from 'shared';
import type { Settings, UpdateSettingsInput } from 'shared';
import { parseWithZod } from '../common/zod-validation.pipe.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { settings as SettingsRow } from '../generated/prisma/client.js';

const SETTINGS_ID = 1;

const DEFAULT_SORT_FIELD: Settings['sortField'] = 'createdAt';
const DEFAULT_SORT_DIRECTION: Settings['sortDirection'] = 'desc';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<Settings> {
    const row = await this.prisma.settings.findUnique({
      where: { id: SETTINGS_ID },
    });

    if (!row) {
      return {
        sortField: DEFAULT_SORT_FIELD,
        sortDirection: DEFAULT_SORT_DIRECTION,
        updatedAt: new Date(),
      };
    }

    return this.toApiSettings(row);
  }

  async updateSettings(input: UpdateSettingsInput): Promise<Settings> {
    const data = parseWithZod(updateSettingsSchema, input);

    const row = await this.prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        sort_field: data.sortField,
        sort_direction: data.sortDirection,
      },
      update: {
        sort_field: data.sortField,
        sort_direction: data.sortDirection,
      },
    });

    return this.toApiSettings(row);
  }

  private toApiSettings(row: SettingsRow): Settings {
    return {
      sortField: row.sort_field as Settings['sortField'],
      sortDirection: row.sort_direction as Settings['sortDirection'],
      updatedAt: row.updated_at,
    };
  }
}
