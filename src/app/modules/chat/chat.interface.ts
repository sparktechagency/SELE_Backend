import { Model, Types } from 'mongoose';

export type IChat = {
  _id?: string;
  participants: [Types.ObjectId];
};

export type ChatModel = Model<IChat>;
