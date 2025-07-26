import { MessagesService } from './../messages/messages.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import {
  Conversation,
  ConversationDocument,
} from './schema/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ConversationsService extends BaseService<
  Conversation,
  CreateConversationDto,
  UpdateConversationDto
> {
  constructor(
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {
    super(conversationModel);
  }

  async getConversationByUser(
    userId: string,
  ): Promise<(Partial<Conversation> & { unreadCount: number })[]> {
    const conversations = await this.conversationModel
      .find({
        members: { $elemMatch: { user: userId } },
      })
      .lean()
      .exec();
    const conversationWithUnreadCount = await Promise.all(
      (await conversations).map(async (conversation) => {
        const unreadCount = await this.messagesService.getUnreadMessages(
          conversation._id.toString(),
          userId,
        );
        return { ...conversation, unreadCount };
      }),
    );
    return conversationWithUnreadCount;
  }
}
