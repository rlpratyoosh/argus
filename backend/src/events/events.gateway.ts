import { Logger,} from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface AuthenticatedSocket extends Socket {
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);


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
