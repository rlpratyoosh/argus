import { SetMetadata } from '@nestjs/common';

export const AllowedRole = (...roles: string[]) => SetMetadata('roles', roles);
