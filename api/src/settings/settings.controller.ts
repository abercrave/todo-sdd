import { Body, Controller, Get, Put } from '@nestjs/common';
import { updateSettingsSchema } from 'shared';
import type { Settings, UpdateSettingsInput } from 'shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { SettingsService } from './settings.service.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findOne(): Promise<Settings> {
    return this.settingsService.getSettings();
  }

  @Put()
  update(
    @Body(new ZodValidationPipe(updateSettingsSchema))
    body: UpdateSettingsInput,
  ): Promise<Settings> {
    return this.settingsService.updateSettings(body);
  }
}
