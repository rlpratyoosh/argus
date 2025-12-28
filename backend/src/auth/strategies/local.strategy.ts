import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { safeUser } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
    });
  }

  async validate(
    username: string,
    password: string,
  ): Promise<safeUser> {
    const user = await this.authService.validateUser(username, password);
    if (!user) throw new UnauthorizedException('Invalid Credentials');

    return user;
  }
}
