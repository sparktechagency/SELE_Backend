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
  // ! recent added
  residenceCountry?:string;
  primaryEmail?:string;
  alternativeEmail?:string;
  addressOne?:string;
  addressTwo?:string;
  zipCode?:string;
  licenseNumber?:string;
  driverLicense?:string;
  ageFirstLicense?:string; //TODO: need to discuss about this field also two residence country why show this field two time?
};