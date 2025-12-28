import { UserType } from '@prisma/client';

export class UpdateUserDto {
  userType?: UserType;
  trustScore?: number;
  city?: string;
  state?: string;
}
