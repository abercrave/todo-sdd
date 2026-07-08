import { z } from 'zod';
import { TITLE_MAX_LENGTH } from '../constants/titleMaxLength';

export const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(TITLE_MAX_LENGTH, `Title must be ${TITLE_MAX_LENGTH} characters or fewer`);
