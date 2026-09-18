import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const responseObj = res as Record<string, any>;
        message = responseObj.message || exception.message;
        errorCode = responseObj.error || `HTTP_${status}`;
        if (Array.isArray(responseObj.message)) {
          errors = responseObj.message;
          message = responseObj.message[0] || 'Validation failed';
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error at ${request.method} ${request.url}: ${exception.message}`, exception.stack);
      message = process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : exception.message;
    }

    response.status(status).json({
      success: false,
      message,
      errorCode,
      errors: errors.length > 0 ? errors : undefined,
    });
  }
}
