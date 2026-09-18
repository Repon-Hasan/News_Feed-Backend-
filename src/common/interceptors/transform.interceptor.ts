import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();

    // Skip wrapping for Better Auth handler or swagger or health endpoints if needed
    if (req.url && (req.url.startsWith('/api/auth') || req.url.startsWith('/api/docs'))) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // If data is already structured with success flag, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        return {
          success: true,
          message: 'Operation successful',
          data: data !== undefined ? data : null,
        };
      }),
    );
  }
}
