import { Module } from '@nestjs/common';
import { EventsModule } from 'src/events/events.module';
import { PrismaService } from 'src/prisma.service';
import { IncidentController } from './incident.controller';
import { IncidentService } from './incident.service';

@Module({
  imports: [EventsModule],
  controllers: [IncidentController],
  providers: [IncidentService, PrismaService],
})
export class IncidentModule {}
