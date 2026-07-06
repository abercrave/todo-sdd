import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorBody {
  message: string;
  errors: Array<{ path: string; message: string }>;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, body } = this.toErrorBody(exception);
    response.status(status).json(body);
  }

  private toErrorBody(exception: unknown): { status: number; body: ErrorBody } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (this.isErrorBody(payload)) {
        return { status, body: payload };
      }

      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string }).message ?? exception.message);

      return { status, body: { message, errors: [] } };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { message: 'Internal server error', errors: [] },
    };
  }

  private isErrorBody(value: unknown): value is ErrorBody {
    return (
      typeof value === 'object' &&
      value !== null &&
      'message' in value &&
      'errors' in value &&
      Array.isArray((value as ErrorBody).errors)
    );
  }
}
