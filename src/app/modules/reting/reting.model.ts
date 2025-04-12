import { Schema, model } from 'mongoose';
import { IRating, RatingModel } from './reting.interface';

const RatingSchema = new Schema<IRating, RatingModel>({
carId: {
    type: Schema.Types.ObjectId,
    ref: "Cars"
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  rating: {
    type: Number,
    required: true
  },
  review: {
    type: String,
    required: true
  },
},
{
  timestamps: true,
});

export const Rating = model<IRating, RatingModel>('Rating', RatingSchema);
