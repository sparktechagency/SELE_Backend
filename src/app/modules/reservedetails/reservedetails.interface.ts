import { Types } from 'mongoose';
import { progressStatus } from '../../../enums/progressStatus';

export type IReserveDetails = {
  carId: Types.ObjectId;
  startDate: string;
  endDate: string;
  drivingLicense: string[];
  yourID: string[];
  progressStatus: progressStatus;
  userId?: Types.ObjectId;
  orderId?: String;
  createdAt?: Date;
  category?:Types.ObjectId;
  brandName?:Types.ObjectId;
  agencyId?:Types.ObjectId;
  trxId?:string;
  appCharge?:number;
};
