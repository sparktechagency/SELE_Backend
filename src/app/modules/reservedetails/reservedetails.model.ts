import { Schema, model } from 'mongoose';
import { IReserveDetails } from './reservedetails.interface';

const reserveDetailsSchema = new Schema<IReserveDetails>(
  {
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Cars',
    },
    brandName: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    drivingLicense: {
      type: [String],
      required: true,
    },
    yourID: {
      type: [String],
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      enum: ['Request', 'InProgress', 'Assigned', 'Delivered', 'Cancelled'],
      required: true,
      default: 'Request',
    },
    orderId: {
      type: String,
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    trxId: {
      type: String,
      default: null,
      required: false,
    },
    appCharge: {
      type: Number,
      default: 10,
    },
    ageFirstLicense: {
      type: String,
    },
    insuranceAmount: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    addressOne: {
      type: String,
    },
    addressTwo: {
      type: String,
    },
    residenceCountry: {
      type: String,
    },
    primaryEmail: {
      type: String,
    },
    alternativeEmail: {
      type: String,
    },
    driverLicense: {
      type: String,
    },
    licenseNumber: {
      type: String,
    },
    agencyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isInsured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ReserveDetailsModel = model<IReserveDetails>(
  'Reservedetails',
  reserveDetailsSchema
);
