import { BadRequestException, Injectable } from '@nestjs/common';
import type { Incident } from '@prisma/client';
import type { validatedUser } from 'src/auth/strategies/jwt.strategy';
import validateOrThrow from 'src/common/helper/zod-validation.helper';
import { EventsGateway } from 'src/events/events.gateway';
import { PrismaService } from 'src/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import {
  UpdateIncidentResponderDto,
  UpdateIncidentUserDto,
} from './dto/update-incident.dto';
import createIncidentSchema from './schema/create-incident.schema';

@Injectable()
export class IncidentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, userId?: string) {
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
          reporterId: userId as string,
        },
      });

      await this.eventsGateway.notifyIncidentCreation(city, state);

      return incident;
    } catch (error) {
      console.log('Error fetching location data or creating incident:', error); // For debugging
      throw new BadRequestException(
        'Failed to fetch location data or create incident',
      );
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

  async findNearby(latitude: number, longitude: number, userId?: string) {
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

    // If user is logged in, fetch their vote status for each incident
    if (userId && nearbyIncidents.length > 0) {
      const incidentIds = nearbyIncidents.map((i) => i.id);
      const userVotes = await this.prismaService.votedIncident.findMany({
        where: {
          userId,
          incidentId: { in: incidentIds },
        },
      });

      const voteMap = new Map(
        userVotes.map((v) => [
          v.incidentId,
          { upVoted: v.upVoted, downVoted: v.downVoted },
        ]),
      );

      return nearbyIncidents.map((incident) => ({
        ...incident,
        userVote: voteMap.get(incident.id) || {
          upVoted: false,
          downVoted: false,
        },
      }));
    }

    return nearbyIncidents.map((incident) => ({
      ...incident,
      userVote: { upVoted: false, downVoted: false },
    }));
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

  async upvote(id: string, userId: string) {
    try {
      const existingVote = await this.prismaService.votedIncident.findUnique({
        where: { userId_incidentId: { userId, incidentId: id } },
      });

      if (existingVote?.upVoted) {
        await this.prismaService.votedIncident.delete({
          where: { userId_incidentId: { userId, incidentId: id } },
        });
        await this.prismaService.incident.update({
          where: { id },
          data: { votes: { decrement: 1 } },
        });
        return { message: 'Upvote removed', upVoted: false, downVoted: false };
      }

      let voteChange = 1;
      if (existingVote?.downVoted) {
        voteChange = 2;
      }

      await this.prismaService.votedIncident.upsert({
        where: { userId_incidentId: { userId, incidentId: id } },
        create: { userId, incidentId: id, upVoted: true, downVoted: false },
        update: { upVoted: true, downVoted: false },
      });

      await this.prismaService.incident.update({
        where: { id },
        data: { votes: { increment: voteChange } },
      });

      return {
        message: 'Upvoted successfully',
        upVoted: true,
        downVoted: false,
      };
    } catch (error) {
      throw new BadRequestException('Failed to upvote incident');
    }
  }

  async downvote(id: string, userId: string) {
    try {
      const existingVote = await this.prismaService.votedIncident.findUnique({
        where: { userId_incidentId: { userId, incidentId: id } },
      });

      if (existingVote?.downVoted) {
        await this.prismaService.votedIncident.delete({
          where: { userId_incidentId: { userId, incidentId: id } },
        });
        await this.prismaService.incident.update({
          where: { id },
          data: { votes: { increment: 1 } },
        });
        return {
          message: 'Downvote removed',
          upVoted: false,
          downVoted: false,
        };
      }

      let voteChange = 1;
      if (existingVote?.upVoted) {
        voteChange = 2;
      }

      await this.prismaService.votedIncident.upsert({
        where: { userId_incidentId: { userId, incidentId: id } },
        create: { userId, incidentId: id, upVoted: false, downVoted: true },
        update: { upVoted: false, downVoted: true },
      });

      await this.prismaService.incident.update({
        where: { id },
        data: { votes: { decrement: voteChange } },
      });

      return {
        message: 'Downvoted successfully',
        upVoted: false,
        downVoted: true,
      };
    } catch (error) {
      throw new BadRequestException('Failed to downvote incident');
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
