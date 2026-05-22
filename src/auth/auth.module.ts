import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './apiKey.strategy';
import { AuthService } from './auth.service';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { PublicApiKeyGuard } from './guards/public-api-key.guard';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [AuthService, ApiKeyStrategy, AdminApiKeyGuard, PublicApiKeyGuard],
  exports: [AuthService, AdminApiKeyGuard, PublicApiKeyGuard],
})
export class AuthModule {}
