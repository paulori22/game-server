import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
// Bundlers (e.g. Vercel) may wrap the CJS passport export under `.default`.
import * as passportImport from 'passport';

const passport =
  (passportImport as { default?: typeof passportImport }).default ??
  passportImport;

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    passport.authenticate(
      'headerapikey',
      { session: false, failureRedirect: '/api/unauthorized' },
      (value) => {
        if (value) {
          next();
        } else {
          throw new UnauthorizedException();
        }
      },
    )(req, res, next);
  }
}
