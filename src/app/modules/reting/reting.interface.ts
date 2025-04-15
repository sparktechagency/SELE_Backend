import { Model, Types } from 'mongoose';

export type IRating = {
  _id?: Types.ObjectId;
  carId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: Number;
  review: String;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RatingModel = Model<IRating>;
