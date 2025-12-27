export class CreateIncidentDto {
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  images: string[];
  longitude: number;
  latitude: number
}
