import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import authConfig from 'src/config/auth.config';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
  ],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
