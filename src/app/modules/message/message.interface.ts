import { Model, Types } from 'mongoose';

export type IMessage = {
  chatId: Types.ObjectId,
  sender: Types.ObjectId,
  text?: string,
  messageImage?: string[];
  type: "text" | "messageImage" | "both",
};

export type MessageModel = Model<IMessage>;
