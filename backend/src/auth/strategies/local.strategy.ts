import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { safeUser } from '../auth.service';
export interface safeUserWOTP extends safeUser {
  otp?: string
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    username: string,
    password: string,
  ): Promise<safeUserWOTP> {
    const user = await this.authService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const otp = req.body.otp as string | undefined;

    return {
      ...user,
      otp,
    };
  }
}
