import { Schema, model } from 'mongoose';
import { ICars } from './cars.interface';
import { fuelType } from '../../../enums/fuel';

const carsSchema = new Schema<ICars>({
  carImage: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  brandName: { type: String, required: true },
  description: { type: String, required: true },
  outDoorColor: { type: String, required: true },
  interiorColor: { type: String, required: true },
  // @ts-ignore
  fuelType: { type: String, enum: fuelType, required: true },
  fuelCapacity: { type: String, required: true },
  kilometresData: { type: String, required: true },
  carSeatsNumber: { type: Number, required: true },
  transmission: { type: String, enum: ["Manual", "Automatic"], required: true },
  price: { type: Number, required: true },
  ProtectionPlan: { type: [String], required: true },

});

export const CarsModel = model<ICars>('Cars', carsSchema);
