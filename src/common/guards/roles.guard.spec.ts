import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  };

  it('should allow access if no roles are specified on route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockContext({ role: Role.USER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow ADMIN to access ADMIN routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context = createMockContext({ role: Role.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should DENY USER from accessing REPORTER routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.REPORTER]);
    const context = createMockContext({ role: Role.USER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should DENY REPORTER from accessing ADMIN routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
    const context = createMockContext({ role: Role.REPORTER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
