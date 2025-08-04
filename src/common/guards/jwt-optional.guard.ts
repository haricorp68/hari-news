import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override canActivate to make authentication optional
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Always return true to allow the request to proceed
    return super.canActivate(context);
  }

  // Override handleRequest to handle cases where authentication fails
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, we still allow the request to proceed
    // but user will be null/undefined
    if (err || !user) {
      return null; // No user authenticated, but request continues
    }

    // User is authenticated successfully
    return user;
  }
}

// Alternative implementation with more explicit control
@Injectable()
export class OptionalJwtAuthGuardV2 extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // If no authorization header, skip authentication
    if (!authHeader) {
      return true;
    }

    // If authorization header exists, try to authenticate
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Don't throw error if authentication fails
    // Just return null for user
    if (err || !user) {
      return null;
    }

    return user;
  }
}
