import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((result) => {
        const statusCode = response?.statusCode || 200;
        let data = result;
        let message =
          request?.customMessage ||
          request?.message ||
          (request.method === 'GET'
            ? 'Data retrieved successfully'
            : request.method === 'POST'
            ? 'Data created successfully'
            : request.method === 'PATCH'
            ? 'Data updated successfully'
            : request.method === 'DELETE'
            ? 'Data deleted successfully'
            : 'Request successful');

        // Nếu controller trả về object có cả data và message thì lấy message đó
        if (result && typeof result === 'object' && 'data' in result && 'message' in result) {
          data = result.data;
          message = result.message;
        }

        let metadata = '';
        if (result && typeof result === 'object' && 'metadata' in result) {
          metadata = result.metadata;
        }
        return {
          status: 'success',
          statusCode,
          message,
          data,
          metadata,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
} 