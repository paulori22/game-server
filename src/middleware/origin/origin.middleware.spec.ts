import { ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OriginMiddleware } from './origin.middleware';

describe('OriginMiddleware', () => {
  const next = jest.fn();

  function createMiddleware(isProduction: boolean) {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'cors.isProduction') return isProduction;
        if (key === 'cors.extraOrigins') return [];
        return undefined;
      }),
    } as unknown as ConfigService;

    return new OriginMiddleware(configService);
  }

  beforeEach(() => {
    next.mockClear();
  });

  it('passes through in development without origin', () => {
    const middleware = createMiddleware(false);
    middleware.use({ method: 'POST', headers: {} }, {}, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks missing origin in production', () => {
    const middleware = createMiddleware(true);
    expect(() =>
      middleware.use({ method: 'POST', headers: {} }, {}, next),
    ).toThrow(ForbiddenException);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows itch.io origin in production', () => {
    const middleware = createMiddleware(true);
    middleware.use(
      {
        method: 'POST',
        headers: { origin: 'https://user.itch.io' },
      },
      {},
      next,
    );
    expect(next).toHaveBeenCalled();
  });

  it('passes OPTIONS in production without origin', () => {
    const middleware = createMiddleware(true);
    middleware.use({ method: 'OPTIONS', headers: {} }, {}, next);
    expect(next).toHaveBeenCalled();
  });
});
