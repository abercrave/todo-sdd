import { z } from 'zod';
import { DESCRIPTION_MAX_LENGTH } from '../constants/descriptionMaxLength';

export const descriptionSchema = z
  .string()
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer`);
