import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { ValidatedRequest } from 'src/auth/auth.controller';
import { SetPublic } from 'src/common/decorators/public.decorator';
import { AllowedRole } from 'src/common/decorators/roles.decorator';
import { CreateIncidentDto } from './dto/create-incident.dto';
import {
  UpdateIncidentResponderDto,
  UpdateIncidentUserDto,
} from './dto/update-incident.dto';
import { IncidentService } from './incident.service';

@Controller('incident')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  create(
    @Body() createIncidentDto: CreateIncidentDto,
    @Req() req: ValidatedRequest,
  ) {
    return this.incidentService.create(createIncidentDto, req.user?.userId);
  }

  @Get()
  @AllowedRole('RESPONDER')
  findAll(@Req() req: ValidatedRequest) {
    return this.incidentService.findAll(req.user);
  }

  @Get('nearby')
  @SetPublic()
  findNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Req() req: ValidatedRequest,
  ) {
    return this.incidentService.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      req.user?.userId,
    );
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.incidentService.findOne(id);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentUserDto,
  ) {
    return this.incidentService.update(id, updateIncidentDto);
  }

  @Patch('upvote/:id')
  upvote(@Param('id') id: string, @Req() req: ValidatedRequest) {
    return this.incidentService.upvote(id, req.user.userId);
  }

  @Patch('downvote/:id')
  downvote(@Param('id') id: string, @Req() req: ValidatedRequest) {
    return this.incidentService.downvote(id, req.user.userId);
  }

  @Patch('responder/:id')
  @AllowedRole('RESPONDER')
  updateByResponder(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentResponderDto,
  ) {
    return this.incidentService.updateByResponder(id, updateIncidentDto);
  }

  @Delete(':id')
  @AllowedRole('RESPONDER')
  remove(@Param('id') id: string) {
    return this.incidentService.remove(id);
  }
}
