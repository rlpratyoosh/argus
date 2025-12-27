import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import authConfig from 'src/config/auth.config';
import type { refreshTokenPayload } from '../auth.service';
export type refreshUser = {
  refreshToken: string;
  sub: string;
  payloadType: string;
  tokenId: string;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(authConfig.KEY)
    private readonly auth: ConfigType<typeof authConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.refresh_token;
        },
      ]),
      secretOrKey: auth.secret!,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: refreshTokenPayload) {
    const refreshToken = req?.cookies?.refresh_token as string;
    return { ...payload, refreshToken };
  }
}
