import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Always return true, but try to authenticate if token is provided
    try {
      const result = super.canActivate(context);
      if (result instanceof Promise) {
        return result.then(() => true).catch(() => true);
      }
      return true;
    } catch (error) {
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    // If there's an error or no user, just return undefined (no authentication)
    // If user exists, return the user object
    return user || null;
  }
}
