import { SetMetadata } from '@nestjs/common';

export const SetPublic = () => SetMetadata('isPublic', true);
