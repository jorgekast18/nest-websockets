import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  public server: Server;
  constructor(private readonly chatService: ChatService) {}

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      const { name, token } = socket.handshake.auth;

      if (!name) {
        socket.disconnect();
      }

      // Add client to list
      this.chatService.onClientConnected({ id: socket.id, name: name });

      // Say hello
      socket.emit('welcome-message', 'Bienvenido al servidor');

      // Send list clients connected
      this.server.emit('on-clients-changed', this.chatService.getClients());

      socket.on('disconnect', () => {
        this.chatService.onClientDisconnected(socket.id);
        this.server.emit('on-clients-changed', this.chatService.getClients());
      });
    });
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    const { name, token } = client.handshake.auth;

    if (!message) {
      return;
    }

    this.server.emit('on-message', {
      userId: client.id,
      message,
      name,
    });
  }
}
