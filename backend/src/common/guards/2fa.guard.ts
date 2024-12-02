import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TwoFAGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.user.is2FAVerified) {
      throw new UnauthorizedException('2FA verification is required');
    }
    return true;
  }
}
