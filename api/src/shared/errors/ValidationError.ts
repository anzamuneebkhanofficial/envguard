import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  public readonly errors: unknown;

  constructor(message = 'Validation failed', errors?: unknown) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}
