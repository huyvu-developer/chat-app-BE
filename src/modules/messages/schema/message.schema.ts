import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AttachmentType, MessageType } from 'src/utils/const';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sender: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  })
  conversation: string;

  @Prop({
    required: true,
    default: MessageType.TEXT,
    enum: Object.values(MessageType),
  })
  type: MessageType;

  @Prop({ required: false, index: true })
  content: string;

  @Prop({
    type: Map,
    of: [Types.ObjectId],
    required: false,
    default: () => new Map([['love', []]]),
  })
  reacts: Map<string, Types.ObjectId[]>;

  @Prop({
    type: Types.ObjectId,
    ref: 'Message',
    required: false,
    default: null,
  })
  reply: Types.ObjectId;

  @Prop({ required: false, index: true })
  order: number;

  @Prop({ required: false })
  metadata: [];

  @Prop({ type: Date, required: false, default: null })
  deletedAt: Date | null;

  @Prop({
    type: [
      {
        type: { type: String, enum: Object.values(AttachmentType) },
        url: { type: String },
      },
    ],
    required: false,
  })
  attachments: { type: AttachmentType; url: string }[];

  @Prop({
    type: [
      {
        _id: false,
        userId: { type: Types.ObjectId, required: true, ref: 'User' },
        readAt: { type: Date, default: null },
      },
    ],
    required: false,
    default: [],
  })
  readStatus: { userId: Types.ObjectId; readAt: Date }[];
}

const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.pre<MessageDocument>('find', async function (next) {
  this.populate('sender');
  this.populate('reply');
  next();
});

MessageSchema.pre<MessageDocument>('findOne', async function (next) {
  this.populate('sender');
  this.populate('reply');
  next();
});

MessageSchema.pre<MessageDocument>('save', async function (next) {
  if (this.isNew) {
    const MessageModel = this.model('Message');
    const count = await MessageModel.countDocuments({
      conversationId: this.conversation,
    });
    this.order = count + 1;
  }
  next();
});

MessageSchema.methods.toJson = function () {
  const message = this.toObject();
  if (this.deletedAt) {
    message.content = null;
    message.metadata = null;
  }
  return message;
};

export { MessageSchema };
