import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import authConfig from 'src/config/auth.config';
import { PrismaService } from 'src/prisma.service';
import { accessTokenPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authConfig.KEY)
    private readonly auth: ConfigType<typeof authConfig>,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: auth.secret,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (
      req.cookies &&
      'access_token' in req.cookies &&
      req.cookies.access_token.length > 0
    )
      return req.cookies.access_token;
    return null;
  }

  async validate(payload: accessTokenPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException();

    if (!user.isVerified) throw new ForbiddenException('User is not verified');

    return {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
      userType: payload.userType,
    };
  }
}

export type validatedUser = {
  userId: string;
  username: string;
  email: string;
  userType: string;
};
