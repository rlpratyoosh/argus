import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService, type safeUser } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { SetPublic } from 'src/common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
interface RequestWUser extends Request {
  user: safeUser;
}
import { validatedUser } from './strategies/jwt.strategy';
export interface ValidatedRequest extends Request {
  user: validatedUser;
}

import { refreshUser } from './strategies/refresh-token.strategy';
interface RequestWRefreshUser extends Request {
  user: refreshUser;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SetPublic()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestWUser,
  ) {
    if (!req.user) throw new UnauthorizedException('User not found!');

    if (!req.user.isVerified)
      throw new ForbiddenException('User is not verified!');

    // if (
    //   !req.user.otp ||
    //   !req.user.otpExpiry ||
    //   req.user.otpExpiry.getTime() < Date.now()
    // )
    //   throw new ForbiddenException('Invalid or Expired OTP');

    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { message: 'Login successful' };
  }

  @SetPublic()
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @SetPublic()
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: RequestWRefreshUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    const tokenId = req.user.tokenId;

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(userId, refreshToken, tokenId);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Refresh Rotation Succesfull' };
  }

  // @SetPublic()
  // @Get('verify/:token')
  // async verifyUser(
  //   @Param('token') token: string,
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   const { accessToken, refreshToken } =
  //     await this.authService.verifyUser(token);

  //   res.cookie('access_token', accessToken, {
  //     httpOnly: true,
  //     sameSite: 'lax',
  //     maxAge: 15 * 60 * 1000,
  //   });
  //   res.cookie('refresh_token', refreshToken, {
  //     httpOnly: true,
  //     sameSite: 'lax',
  //     maxAge: 7 * 24 * 60 * 60 * 1000,
  //   });

  //   return { message: 'User verified succesfully' };
  // }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async signOut(
    @Req() req: ValidatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh-token'];

    if (refreshToken) await this.authService.logout(refreshToken);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged Out Succesfully' };
  }

  @Post('logoutall')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Req() req: ValidatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.userId;
    if (userId) await this.authService.logoutAll(userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged Out From All Devices' };
  }

  // @SetPublic()
  // @UseGuards(AuthGuard('local'))
  // @Post('reverify')
  // @HttpCode(HttpStatus.OK)
  // async reverify(
  //   @Req() req: RequestWUser,
  //   @Res({ passthrough: true }) res: Response,
  // ) {
  //   if (req.user.isVerified)
  //     throw new BadRequestException('User is already verified!');

  //   await this.authService.reverify(req.user);

  //   return { message: 'Email sent successfully' };
  // }

  // @SetPublic()
  // @UseGuards(AuthGuard('local'))
  // @Post('sendotp')
  // @HttpCode(HttpStatus.OK)
  // async sendOtp(@Req() req: RequestWUser) {
  //   await this.authService.sendOtp(req.user);

  //   return { message: 'OTP successfully sent!' };
  // }

  @Get('me')
  getMe(@Req() req: ValidatedRequest) {
    return req.user;
  }
}
