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

        // Nếu object đã có data và metadata, giữ nguyên không lồng thêm
        if (
          result &&
          typeof result === 'object' &&
          'data' in result &&
          'metadata' in result
        ) {
          return {
            status: 'success',
            statusCode,
            message: result.message || message,
            data: result.data,
            metadata: result.metadata,
            timestamp: new Date().toISOString(),
          };
        }

        // Nếu object có message và các field khác, gom các field khác vào data
        if (
          result &&
          typeof result === 'object' &&
          'message' in result &&
          Object.keys(result).length > 1
        ) {
          const { message: msg, ...rest } = result;
          message = msg;
          data = rest;
        } else if (result && typeof result === 'object' && 'data' in result && 'message' in result) {
          data = result.data;
          message = result.message;
        } else if (result && typeof result === 'object' && 'message' in result && Object.keys(result).length === 1) {
          data = undefined;
          message = result.message;
        } else {
          data = result;
        }

        let metadata = '';
        if (result && typeof result === 'object' && 'metadata' in result) {
          metadata = result.metadata;
        }
        return {
          status: 'success',
          statusCode,
          message,
          data: data !== undefined ? data : null,
          metadata,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
} 