import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SetPublic } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @SetPublic()
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}
