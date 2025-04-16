import { Schema, model } from 'mongoose';
import { ICars } from './cars.interface';
import { fuelType } from '../../../enums/fuel';

const carsSchema = new Schema<ICars>({
  title: { type: String, required: true },
  carImage: { type: String, required: true },
  brandName: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  outDoorColor: { type: String, required: true },
  interiorColor: { type: String, required: true },
  // @ts-ignore
  fuelType: { type: String, enum: Object.values(fuelType), required: true },
  fuelCapacity: { type: String, required: true },
  // @ts-ignore
  category: { type: Schema.Types.ObjectId,ref:"Category",  required: true },
  transmission: { type: String, enum: ["Manual", "Automatic"], required: true },
  kilometresData: { type: String, required: true },
  carSeatsNumber: { type: Number, required: true },
  protection: { type: [String], required: true },
  agencyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  carModel: { type: String, required: true },
},
{
  timestamps: true,
});

export const CarsModel = model<ICars>('Cars', carsSchema);
