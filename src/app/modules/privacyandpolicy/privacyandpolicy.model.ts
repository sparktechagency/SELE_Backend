import { Schema, model } from 'mongoose';
import { IPrivacyAndPolicy, PrivacyAndPolicyModel } from './privacyandpolicy.interface';

const privacyAndPolicySchema = new Schema<IPrivacyAndPolicy, PrivacyAndPolicyModel>({
  description: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const Privacyandpolicy = model<IPrivacyAndPolicy, PrivacyAndPolicyModel>('Privacyandpolicy', privacyAndPolicySchema);
