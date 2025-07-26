import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { Socket } from 'socket.io';
import { ConversationsService } from '../conversations/conversations.service';

interface WebsocketResponse {
  status: 'success' | 'error';
  data: any;
}
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  private userSocket: Map<string, Set<string>> = new Map();
  private userStatus: Map<string, string> = new Map();
  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessagesService,
    private readonly conversationService: ConversationsService,
  ) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinConversation')
  async joinConversation(
    @MessageBody() payload: { conversationId: string },
    @ConnectedSocket() socket: Socket,
  ): Promise<WebsocketResponse> {
    try {
      //get list message
      const listMessages = await this.messageService.getConversationMessages(
        payload.conversationId,
      );

      // update read status message
      await this.messageService.updateReadStatus(
        payload.conversationId,
        socket.data.user._id,
      );
      return { status: 'success', data: listMessages };
    } catch (e) {
      console.error(e);
    }
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() payload: { message: CreateMessageDto },
    @ConnectedSocket() socket: Socket,
  ) {
    const response = await this.messageService.create({
      ...payload.message,
      sender: socket.data.user._id,
    });

    const message = await this.messageService.findById(response._id.toString());

    this.server
      .to(payload.message.conversation)
      .emit('receivedMessage', { status: 'success', data: message });
  }

  @SubscribeMessage('focusInput')
  async handleFocusInput(
    @MessageBody() payload: { conversationId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    // update read status message
    await this.messageService.updateReadStatus(
      payload.conversationId,
      socket.data.user._id,
    );
  }

  async handleConnection(socket: Socket) {
    console.log(`Websocket connection`, socket.handshake.auth.token);
    if (socket.handshake.auth.token) {
      const user = await this.authService.validateToken(
        socket.handshake.auth.token,
      );
      if (user) {
        socket.data.user = user;
        this.userStatus.set(socket.id, user._id);
        // register conversation event
        await this.registerConversationEvent(socket, user._id);
        // broadcast online users
        this.broadcastOnlineUsers();
      } else {
        socket.disconnect();
      }
    } else {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    console.log(`Websocket disconnected`);
    // remove conversation event
    this.removeConversationEvent(socket);
    // remove user online status
    this.userStatus.delete(socket.id);
    this.broadcastOnlineUsers();
  }

  private async registerConversationEvent(socket, userId: string) {
    const listConversation =
      await this.conversationService.getConversationByUser(userId);
    listConversation.forEach((conversation) => {
      socket.join(conversation._id.toString());
      if (!this.userSocket.has(conversation._id.toString())) {
        this.userSocket.set(conversation._id.toString(), new Set());
      }
      this.userSocket.get(conversation._id.toString())?.add(socket.id);
    });
  }

  private removeConversationEvent(socket: Socket) {
    this.userSocket.forEach((sockets, conversationId) => {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        this.userSocket.delete(conversationId);
      }
    });
  }

  private broadcastOnlineUsers() {
    this.server.emit('onlineUsers', Array.from(this.userStatus.values()));
  }
}
