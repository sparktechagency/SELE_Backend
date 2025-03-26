import { Schema, Types, model } from 'mongoose';
import { IChat, ChatModel } from './chat.interface';

const chatSchema = new Schema<IChat, ChatModel>({
  participants: {
    type: [Types.ObjectId],
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export const Chat = model<IChat, ChatModel>('Chat', chatSchema);
