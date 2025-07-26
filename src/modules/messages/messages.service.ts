import { InjectModel } from '@nestjs/mongoose';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { Message, MessageDocument } from './schema/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { Model, Types } from 'mongoose';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class MessagesService extends BaseService<
  Message,
  CreateMessageDto,
  any
> {
  constructor(
    @Inject(forwardRef(() => ConversationsService))
    private readonly conversationsService: ConversationsService,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {
    super(messageModel);
  }

  async create(data: CreateMessageDto): Promise<Message> {
    const message = await this.messageModel.create({
      ...data,
      sender: new Types.ObjectId(data.sender),
      reply: data.reply ? new Types.ObjectId(data.reply) : undefined,
      readStatus: [
        {
          userId: new Types.ObjectId(data.sender),
          readAt: new Date(),
        },
      ],
    });
    if (message) {
      await this.conversationsService.update(data.conversation, {
        lastMessage: message._id as string,
      });
    }
    return message;
  }

  async getUnreadMessages(
    conversationId: string,
    userId: string,
  ): Promise<number> {
    return await this.messageModel
      .countDocuments({
        conversation: conversationId,
        'readStatus.userId': { $ne: userId },
        sender: { $ne: userId },
      })
      .exec();
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await this.messageModel
      .find({ conversation: conversationId })
      .sort({ order: 1 })
      .exec();
  }

  async updateReadStatus(conversationId: string, userId: string) {
    const filter = {
      conversation: { $eq: conversationId },
      'readStatus.userId': { $ne: userId },
    };
    const update = {
      $push: {
        readStatus: {
          userId: userId,
          readAt: new Date(),
        },
      },
    };

    const response = await this.messageModel.updateMany(filter, update).exec();
    return {
      matchedCount: response.matchedCount,
      modifiedCount: response.modifiedCount,
    };
  }
}
