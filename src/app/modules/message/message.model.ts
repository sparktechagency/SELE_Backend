import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';

const messageSchema = new Schema<IMessage, MessageModel>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
  },
  messageImage: {
    type: [String],
  },
  type: {
    type: String,
    enum: ["text", "messageImage", "both"],
    default: "text",
  }
},
  {
    timestamps: true,
  }
);
export const Message = model<IMessage, MessageModel>('Message', messageSchema);
