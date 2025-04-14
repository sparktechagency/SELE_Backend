import { Schema, model } from 'mongoose';
import { IReserveDetails } from './reservedetails.interface';

const reserveDetailsSchema = new Schema<IReserveDetails>({
  carId: {
    type: Schema.Types.ObjectId,
    ref: "Cars"
  },
  name: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  drivingLicense: {
    type: [String],
    required: true
  },
  yourID: {
    type: [String],
    required: true
  },
  progressStatus: {
    type: Schema.Types.Mixed,
    enum: ["InProgress", "Assigned", "Delivered", "Cancelled"],
    required: true,
    default: "InProgress"
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

export const ReserveDetailsModel = model<IReserveDetails>('Reservedetails', reserveDetailsSchema);
