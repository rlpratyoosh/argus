import { Logger,} from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


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


  async handleConnection(client: Socket) {
    this.logger.log(
      `Client Connected: ${client.id})`,
    );
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
  }

  async notifyIncidentCreation(city: string, state: string) {
    this.logger.log(
      `Notifying responders in ${city}, ${state} about new incident`,
    );
    this.server.emit(`${city}-${state}`, { message: 'new' });
  }
}
