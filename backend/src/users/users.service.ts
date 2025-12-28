import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        userType: true,
        trustScore: true,
        city: true,
        state: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            incidentsReported: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        userType: true,
        trustScore: true,
        city: true,
        state: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        incidentsReported: {
          select: {
            id: true,
            title: true,
            status: true,
            validation: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            incidentsReported: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          username: true,
          email: true,
          userType: true,
          trustScore: true,
          city: true,
          state: true,
          isVerified: true,
        },
      });

      return { message: 'User updated successfully', user };
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  async getStats() {
    const [totalUsers, responders, admins, shadowBanned, totalIncidents] =
      await Promise.all([
        this.prismaService.user.count(),
        this.prismaService.user.count({ where: { userType: 'RESPONDER' } }),
        this.prismaService.user.count({ where: { userType: 'ADMIN' } }),
        this.prismaService.user.count({ where: { trustScore: { lt: 0 } } }),
        this.prismaService.incident.count(),
      ]);

    return {
      totalUsers,
      responders,
      admins,
      regularUsers: totalUsers - responders - admins,
      shadowBanned,
      totalIncidents,
    };
  }
}
