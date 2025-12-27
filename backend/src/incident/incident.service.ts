import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateIncidentDto } from './dto/create-incident.dto';
import {
  UpdateIncidentUserDto,
  UpdateIncidentResponderDto,
} from './dto/update-incident.dto';
import { PrismaService } from 'src/prisma.service';
import validateOrThrow from 'src/common/helper/zod-validation.helper';
import createIncidentSchema from './schema/create-incident.schema';
import type { validatedUser } from 'src/auth/strategies/jwt.strategy';
import type { Incident } from '@prisma/client';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class IncidentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, userId: string) {
    const validatedData = validateOrThrow(
      createIncidentSchema,
      createIncidentDto,
    );

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${validatedData.latitude}&lon=${validatedData.longitude}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const data = await response.json();

      const city = (data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        'Unknown') as string;
      const state = (data.address.state || 'Unknown') as string;

      const incident = await this.prismaService.incident.create({
        data: {
          ...validatedData,
          city,
          state,
          reporterId: userId,
        },
      });

      await this.eventsGateway.notifyIncidentCreation(city, state);

      return incident;
    } catch (error) {
      console.log('Error fetching location data or creating incident:', error); // For debugging
      throw new Error('Failed to fetch location data or create incident');
    }
  }

  async findAll(user: validatedUser) {
    if (!user.city || !user.state) {
      throw new BadRequestException(
        "Responder's location information is incomplete",
      );
    }

    return await this.prismaService.incident.findMany({
      where: {
        city: user.city,
        state: user.state,
      },
    });
  }

  async findNearby(latitude: number, longitude: number) {
    const radiusInKm = 2;

    type IncidentWithDistance = Incident & { distance: number };

    const nearbyIncidents = await this.prismaService.$queryRaw<
      IncidentWithDistance[]
    >`
    SELECT 
      *, 
      ( 6371 * acos( 
          LEAST(1.0, GREATEST(-1.0, 
            cos( radians(${latitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( latitude ) ) 
          ))
      ) ) AS distance 
    FROM "Incident" 
    WHERE ( 
      6371 * acos( 
          LEAST(1.0, GREATEST(-1.0, 
            cos( radians(${latitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( latitude ) ) 
          ))
      ) 
    ) <= ${radiusInKm}
    ORDER BY distance ASC
  `;

    return nearbyIncidents;
  }

  // findOne(id: string) {
  //   return `This action returns a #${id} incident`;
  // }

  async update(id: string, updateIncidentDto: UpdateIncidentUserDto) {
    try {
      await this.prismaService.incident.update({
        where: { id },
        data: { ...updateIncidentDto },
      });
      return { message: `Incident updated successfully` };
    } catch (error) {
      throw new BadRequestException(`Failed to update incident`);
    }
  }

  async updateByResponder(
    id: string,
    updateIncidentDto: UpdateIncidentResponderDto,
  ) {
    try {
      await this.prismaService.incident.update({
        where: { id },
        data: { ...updateIncidentDto },
      });
      return { message: `Incident updated successfully` };
    } catch (error) {
      throw new BadRequestException(`Failed to update incident`);
    }
  }

  async remove(id: string) {
    try {
      await this.prismaService.incident.delete({
        where: { id },
      });
      return { message: `Incident removed successfully` };
    } catch (error) {
      throw new BadRequestException(`Failed to remove incident`);
    }
  }
}
