import { PartialType } from '@nestjs/mapped-types';
import { CreateIncidentDto } from './create-incident.dto';

export class UpdateIncidentUserDto extends PartialType(CreateIncidentDto) {}

export class UpdateIncidentResponderDto extends PartialType(CreateIncidentDto) {
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    validation?: 'PENDING' | 'VALIDATED' | 'REJECTED';
}
