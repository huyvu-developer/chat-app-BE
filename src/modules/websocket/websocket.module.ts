import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { AuthModule } from '../auth/auth.module';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [AuthModule, MessagesModule, ConversationsModule],
  controllers: [],
  providers: [EventsGateway],
  exports: [],
})
export class WebsocketModule {}
