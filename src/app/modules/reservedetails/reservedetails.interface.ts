import { Types } from 'mongoose';
import { progressStatus } from '../../../enums/progressStatus';

export type IReserveDetails = {
  carId: Types.ObjectId
  name: string,
  startDate: string
  endDate: string
  drivingLicense: string[],
  yourID: string[],
  progressStatus: progressStatus
  userId?: Types.ObjectId
};

