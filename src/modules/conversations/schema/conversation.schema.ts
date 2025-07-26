import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
export type ConversationDocument = Conversation & Document;
@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop()
  name: string;

  @Prop({ required: true, default: false })
  isGroup: boolean;

  @Prop({ required: false, index: true, type: Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;

  @Prop({
    type: [
      {
        _id: false,
        user: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    required: true,
  })
  members: { user: string; joinedAt: Date }[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.pre<ConversationDocument>(
  ['findOne', 'find', 'save'],
  async function (next) {
    try {
      this.populate({
        path: 'lastMessage',
        select: 'content type sender attachments createdAt',
      });
      this.populate({ path: 'members.user' });
      next();
    } catch (error) {
      next(error);
    }
  },
);
