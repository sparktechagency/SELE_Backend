import { Schema, model } from 'mongoose';
import { IPrivacyAndPolicy } from './privacyandpolicy.interface';

const privacyAndPolicySchema = new Schema<IPrivacyAndPolicy>({
  description: {
    type: String,
    required: true,
  },
}, { timestamps: true });
// 
export const PrivacyAndPolicy = model<IPrivacyAndPolicy>('Privacyandpolicy', privacyAndPolicySchema);
