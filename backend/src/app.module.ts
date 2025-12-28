import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import envValidation from './config/env.validation';
import { EventsModule } from './events/events.module';
import { IncidentModule } from './incident/incident.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AuthModule,
    EventsModule,
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validate: envValidation,
    }),
    // MailerModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     transport: {
    //       host: configService.get('mail.host'),
    //       port: configService.get('mail.port'),
    //       secure: false,
    //       auth: {
    //         user: configService.get('mail.username'),
    //         pass: configService.get('mail.password'),
    //       },
    //     },
    //   }),
    // }),
    CacheModule.register({
      isGlobal: true,
      ttl: 30 * 1000,
      max: 100,
    }),
    IncidentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
