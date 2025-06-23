import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        data,
        message: context.switchToHttp().getResponse().locals?.message || 'Success',
        statusCode: context.switchToHttp().getResponse().statusCode || 200,
      })),
    );
  }
} 