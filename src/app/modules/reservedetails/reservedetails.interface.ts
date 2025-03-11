import { Types } from 'mongoose';

export type IReservedetails = {
  carId: Types.ObjectId
  name: string,
  startDate: Date
  endDate: Date
  drivingLicense: string[],
  yourID: string[]
};

