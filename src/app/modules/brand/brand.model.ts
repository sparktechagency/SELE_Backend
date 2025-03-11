import { Schema, model } from 'mongoose';
import { IBrand } from './brand.interface';

const brandSchema = new Schema<IBrand>({
  carType: {
    type: String,
    required: true
  },
  fuelCategory: {
    type: String,
    required: true
  },
  interiorColor: {
    type: String,
    required: true
  },
  pricePerDay: {
    type: String,
    required: true
  },
  transmission: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  }
});

export const BrandModel = model<IBrand>('Brand', brandSchema);
