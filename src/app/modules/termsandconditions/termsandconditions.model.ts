import { Schema, model } from 'mongoose';
import { ITermsAndConditions, termsAndConditionsModel } from './termsandconditions.interface';

const termsAndConditionsSchema = new Schema<ITermsAndConditions, termsAndConditionsModel>({
  description: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const termsAndConditions = model<ITermsAndConditions, termsAndConditionsModel>('termsAndConditions', termsAndConditionsSchema);
