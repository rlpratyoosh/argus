import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { IncidentService } from './incident.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentUserDto, UpdateIncidentResponderDto } from './dto/update-incident.dto';
import { AllowedRole } from 'src/common/decorators/roles.decorator';
import type { ValidatedRequest } from 'src/auth/auth.controller';
import { SetPublic } from 'src/common/decorators/public.decorator';

@Controller('incident')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  @SetPublic()
  create(@Body() createIncidentDto: CreateIncidentDto, @Req() req: ValidatedRequest) {
    return this.incidentService.create(createIncidentDto, req.user.userId);
  }

  @Get()
  @AllowedRole('RESPONDER')
  findAll(@Req() req: ValidatedRequest) {
    return this.incidentService.findAll(req.user);
  }

  @Get()
  findNearby(@Body() location: { latitude: number; longitude: number }) {
    return this.incidentService.findNearby(location.latitude, location.longitude);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.incidentService.findOne(id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncidentDto: UpdateIncidentUserDto) {
    return this.incidentService.update(id, updateIncidentDto);
  }

  @Patch('responder/:id')
  @AllowedRole('RESPONDER')
  updateByResponder(@Param('id') id: string, @Body() updateIncidentDto: UpdateIncidentResponderDto) {
    return this.incidentService.updateByResponder(id, updateIncidentDto);
  }

  @Delete(':id')
  @AllowedRole('RESPONDER')
  remove(@Param('id') id: string) {
    return this.incidentService.remove(id);
  }
}
