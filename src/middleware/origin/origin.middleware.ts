import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAllowedRequestOrigin } from '../../common/allowed-origin';

@Injectable()
export class OriginMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(
    req: { method?: string; headers: Record<string, string | undefined> },
    res: unknown,
    next: () => void,
  ) {
    const isProduction = this.configService.get<boolean>('cors.isProduction');
    if (!isProduction) {
      next();
      return;
    }

    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const extraOrigins =
      this.configService.get<string[]>('cors.extraOrigins') ?? [];

    const allowed = isAllowedRequestOrigin(
      req.headers.origin,
      req.headers.referer,
      extraOrigins,
      true,
    );

    if (!allowed) {
      throw new ForbiddenException();
    }

    next();
  }
}
