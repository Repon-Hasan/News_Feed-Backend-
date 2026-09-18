import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../auth/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const session = await this.authService.getSessionFromRequest(request);

    if (session && session.user) {
      if (!session.user.isActive) {
        throw new UnauthorizedException('আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে (Account is deactivated)');
      }
      request.user = session.user;
      request.session = session.session;
      return true;
    }

    if (isPublic) {
      return true;
    }

    throw new UnauthorizedException('লগইন আবশ্যক (Authentication required)');
  }
}
