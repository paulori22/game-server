import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly apiKeys: string[];
  private readonly publicKeys: string[];
  private readonly adminKeys: string[];

  constructor(private configService: ConfigService) {
    this.apiKeys = this.configService.get<string[]>('apiKey.keys') ?? [];
    this.publicKeys =
      this.configService.get<string[]>('apiKey.publicKeys') ?? [];
    this.adminKeys = this.configService.get<string[]>('apiKey.adminKeys') ?? [];
  }

  validateApiKey(apiKey: string) {
    return this.apiKeys.find((apiK) => apiKey === apiK);
  }

  isPublicKey(apiKey: string): boolean {
    return this.publicKeys.includes(apiKey);
  }

  isAdminKey(apiKey: string): boolean {
    return this.adminKeys.includes(apiKey);
  }

  canAccessPublicRoutes(apiKey: string): boolean {
    return this.isPublicKey(apiKey) || this.isAdminKey(apiKey);
  }
}
