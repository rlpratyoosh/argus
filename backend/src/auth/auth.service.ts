import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import validateOrThrow from 'src/common/helper/zod-validation.helper';
import authConfig from 'src/config/auth.config';
import { PrismaService } from 'src/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { HashingProvider } from './providers/hashing.provider';
import { RegisterUserSchema } from './schema/register-user.schema';
import { User } from '.prisma/client';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/client';
import type { validatedUser } from './strategies/jwt.strategy';
export type safeUser = Omit<User, 'password'>;
export type accessTokenPayload = {
  sub: string;
  username: string;
  email: string;
  userType: string;
  isVerified: boolean;
  payloadType: string;
};
export type refreshTokenPayload = {
  sub: string;
  payloadType: string;
  tokenId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingProvider: HashingProvider,
    @Inject(authConfig.KEY)
    private readonly auth: ConfigType<typeof authConfig>,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<safeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user) {
      const isMatch = await this.hashingProvider.compare(
        password,
        user.password,
      );
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }

    return null;
  }

  async login(user: safeUser) {
    // if (!user.otp || !user.hashedOtp)
    //   throw new ForbiddenException('Invalid OTP');

    // const isMatch = await this.hashingProvider.compare(
    //   user.otp,
    //   user.hashedOtp,
    // );

    // if (!isMatch) throw new ForbiddenException('Invalid OTP');

    // await this.prisma.user.update({
    //   where: { id: user.id },
    //   data: { hashedOtp: null, otpExpiry: null, otpCreatedAt: null },
    // });

    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: randomUUID(),
      },
    });

    const tokens = await this.generateTokens(user, refreshToken.id);
    const hashedRefreshToken = await this.hashingProvider.hash(
      tokens.refreshToken,
    );

    await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: { token: hashedRefreshToken },
    });

    return tokens;
  }

  async register(registerUserDto: RegisterUserDto) {
    const validatedData = validateOrThrow(RegisterUserSchema, registerUserDto);
    const data = {
      ...validatedData,
      password: await this.hashingProvider.hash(validatedData.password),
    };

    let user: User;

    try {
      user = await this.prisma.user.create({ data });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new BadRequestException('User already exists');
      }
      // console.log(error); // For Debugging
      if (error instanceof PrismaClientInitializationError)
        throw new InternalServerErrorException(
          'Problem while connecting to database',
        );
      throw new InternalServerErrorException('Something went wrong');
    }

    // const verificationToken = await this.generateVerificationToken(user);

    // await this.prisma.user.update({
    //   where: { id: user.id },
    //   data: { verificationToken },
    // });

    // const message = `Click here to verify: ${this.auth.issuer}/auth/verify/${verificationToken}`;

    // await this.sendMail(message, user.email);

    return { message: 'Registration Successful'};
  }

  async refresh(userId: string, refreshToken: string, tokenId: string) {
    const [user, hashedRefreshToken] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.refreshToken.findUnique({ where: { id: tokenId } }),
    ]);

    if (!user) throw new ForbiddenException('Access Denied!');

    if (!hashedRefreshToken || !(hashedRefreshToken.userId === userId))
      throw new ForbiddenException('Access Denied!');

    const isMatch = await this.hashingProvider.compare(
      refreshToken,
      hashedRefreshToken.token,
    );
    if (!isMatch) throw new ForbiddenException('Access Denied!');

    const tokens = await this.generateTokens(user, tokenId);
    const newHashedToken = await this.hashingProvider.hash(tokens.refreshToken);

    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { token: newHashedToken },
    });

    return tokens;
  }

  // async verifyUser(token: string) {
  //   let payload: { sub: string };

  //   try {
  //     payload = await this.jwt.verifyAsync(token, {
  //       secret: this.auth.verificationSecret,
  //     });
  //   } catch (er) {
  //     console.log(er);
  //     throw new UnauthorizedException('Token is invalid or expired!');
  //   }

  //   const userId = payload.sub;

  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //   });

  //   if (!user) throw new UnauthorizedException('Invalid token!');

  //   await this.prisma.user.update({
  //     where: { id: userId },
  //     data: { verificationToken: null, isVerified: true },
  //   });

  //   const refreshToken = await this.prisma.refreshToken.create({
  //     data: {
  //       userId: user.id,
  //       token: randomUUID(),
  //     },
  //   });

  //   const tokens = await this.generateTokens(user, refreshToken.id);
  //   const hashedRefreshToken = await this.hashingProvider.hash(
  //     tokens.refreshToken,
  //   );

  //   await this.prisma.refreshToken.update({
  //     where: { id: refreshToken.id },
  //     data: { token: hashedRefreshToken },
  //   });

  //   return tokens;
  // }

  // async reverify(user: safeUser) {
  //   const verificationToken = await this.generateVerificationToken(user);

  //   await this.prisma.user.update({
  //     where: { id: user.id },
  //     data: { verificationToken },
  //   });

  //   const message = `Click here to verify: ${this.auth.issuer}/auth/verify/${verificationToken}`;

  //   await this.sendMail(message, user.email);
  // }

  async logout(refreshToken: string) {
    const decodedToken = this.jwt.decode(refreshToken);
    const tokenId = decodedToken.tokenId;
    if (tokenId)
      await this.prisma.refreshToken.delete({
        where: { id: tokenId },
      });
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async signTokens<T>(
    userId: string,
    expiresIn: number,
    secret: string,
    payload?: T,
  ) {
    return await this.jwt.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret,
        expiresIn,
        issuer: this.auth.issuer,
        audience: this.auth.audience,
      },
    );
  }

  async generateTokens(user: safeUser, tokenId: string) {
    const accessToken = await this.signTokens(
      user.id,
      this.auth.expiresIn,
      this.auth.secret,
      {
        username: user.username,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
        payloadType: 'ACCESS',
      },
    );

    const refreshToken = await this.signTokens(
      user.id,
      this.auth.refreshExpiresIn,
      this.auth.secret,
      {
        payloadType: 'REFRESH',
        tokenId: tokenId,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateVerificationToken(user: safeUser) {
    return await this.signTokens(
      user.id,
      this.auth.verificationExpiresIn,
      this.auth.verificationSecret,
      {
        payloadType: 'VERIFICATION',
      },
    );
  }

  // async sendMail(message: string, email: string) {
  //   await this.mailService.sendMail({
  //     from: 'Alofy <noreply@alofy.com>',
  //     to: email,
  //     subject: 'Verification',
  //     text: message,
  //   });
  // }

  // async sendOtp(user: safeUser) {
  //   const existingUser = await this.prisma.user.findUnique({
  //     where: { id: user.id },
  //   });

  //   if (!existingUser) throw new UnauthorizedException('User does not exist');

  //   const oneMinuteAgo = new Date(Date.now() - 60 * 1000).getTime();
  //   if (existingUser?.otpCreatedAt) {
  //     const createdAt = existingUser.otpCreatedAt.getTime();
  //     if (createdAt > oneMinuteAgo) {
  //       const remainingTime = createdAt - oneMinuteAgo;
  //       throw new BadRequestException(
  //         `Wait for ${Math.ceil(remainingTime / 1000)}s more before trying again!`,
  //       );
  //     }
  //   }

  //   const otp = Math.floor(1000 + Math.random() * 9000).toString();

  //   const hashedOtp = await this.hashingProvider.hash(otp);
  //   const otpExpiry = new Date(Date.now() + 10 * 60 * 10000);
  //   const now = new Date();

  //   await this.prisma.user.update({
  //     where: { id: existingUser.id },
  //     data: { hashedOtp, otpExpiry, otpCreatedAt: now },
  //   });

  //   const message = `Your OTP is: ${otp}`;

  //   await this.sendMail(message, existingUser.email);
  // }
}
