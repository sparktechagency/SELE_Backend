import { Schema, model } from 'mongoose';
import { IRating, RatingModel } from './reting.interface';

const RatingSchema = new Schema<IRating, RatingModel>(
  {
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Cars',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    userProfile: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
    },
    review: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Rating = model<IRating, RatingModel>('Rating', RatingSchema);