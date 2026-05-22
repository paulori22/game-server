import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AdminApiKeyGuard } from './admin-api-key.guard';

describe('AdminApiKeyGuard', () => {
  const authService = {
    isAdminKey: jest.fn(),
  } as unknown as AuthService;

  const guard = new AdminApiKeyGuard(authService);

  function contextWithKey(key: string | undefined): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-api-key': key } }),
      }),
    } as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows admin key', () => {
    (authService.isAdminKey as jest.Mock).mockReturnValue(true);
    expect(guard.canActivate(contextWithKey('admin-key'))).toBe(true);
  });

  it('rejects public-only key', () => {
    (authService.isAdminKey as jest.Mock).mockReturnValue(false);
    expect(() => guard.canActivate(contextWithKey('public-key'))).toThrow(
      ForbiddenException,
    );
  });
});
