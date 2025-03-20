import { Schema, model } from 'mongoose';
import { IReserveDetails } from './reservedetails.interface';

const reservedetailsSchema = new Schema<IReserveDetails>({
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
    enum: ["In Progress", "Assigned", "Delivered", "Cancelled"],
    required: true,
    default: "In Progress"
  }
});

export const ReserveDetailsModel = model<IReserveDetails>('Reservedetails', reservedetailsSchema);
