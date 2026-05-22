import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'apiKey.keys') {
                return ['public-key', 'admin-key'];
              }
              if (key === 'apiKey.publicKeys') {
                return ['public-key'];
              }
              if (key === 'apiKey.adminKeys') {
                return ['admin-key'];
              }
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('validates any configured key', () => {
    expect(service.validateApiKey('public-key')).toBe('public-key');
    expect(service.validateApiKey('admin-key')).toBe('admin-key');
    expect(service.validateApiKey('invalid')).toBeUndefined();
  });

  it('scopes public and admin keys', () => {
    expect(service.isPublicKey('public-key')).toBe(true);
    expect(service.isPublicKey('admin-key')).toBe(false);
    expect(service.isAdminKey('admin-key')).toBe(true);
    expect(service.canAccessPublicRoutes('public-key')).toBe(true);
    expect(service.canAccessPublicRoutes('admin-key')).toBe(true);
    expect(service.canAccessPublicRoutes('invalid')).toBe(false);
  });
});
