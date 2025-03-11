import { Schema, model } from 'mongoose';
import { IReservedetails } from './reservedetails.interface';

const reservedetailsSchema = new Schema<IReservedetails>({
  carId: Schema.Types.ObjectId,
  name: String,
  startDate: Date,
  endDate: Date,
  drivingLicense: [String],
  yourID: [String]
});

export const ReservedetailsModel = model<IReservedetails>('Reservedetails', reservedetailsSchema);
