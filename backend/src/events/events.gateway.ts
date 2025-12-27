import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
} from '@nestjs/websockets';
import * as cookie from 'cookie';
import { Server, Socket } from 'socket.io';
import authConfig from 'src/config/auth.config';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayDisconnect, OnGatewayConnection, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwt: JwtService,
    @Inject(authConfig.KEY)
    private readonly auth: ConfigType<typeof authConfig>,
  ) {}

  afterInit(server: Server) {
    server.use(async (socket: Socket, next) => {
      try {
        const cookies = socket.handshake.headers.cookie;

        if (!cookies) throw new UnauthorizedException('Noo cookies found');

        const parsedCookies = cookie.parse(cookies);

        const token = parsedCookies['access_token'];

        if (!token) throw new UnauthorizedException('No token found');

        const payload = await this.jwt.verifyAsync(token, {
          secret: this.auth.secret,
        });

        socket['user'] = payload;
        next();
      } catch (error) {
        this.logger.warn(`Connection Blocked: ${error.message}`);
        next(new Error('Unauthorized'));
      }
    });
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(
      `Client Connected: ${client.id} (User: ${client.user.username})`,
    );
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
  }

  async notifyIncidentCreation(city: string, state: string) {
    this.logger.log(
      `Notifying responders in ${city}, ${state} about new incident`,
    );
    this.server.emit(`${city}-${state}`, { message: 'new' });
  }
}
