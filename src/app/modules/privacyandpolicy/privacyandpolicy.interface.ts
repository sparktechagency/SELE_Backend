import { Model } from 'mongoose';

export type IPrivacyAndPolicy = {
  description: string;
};

export type PrivacyAndPolicyModel = Model<IPrivacyAndPolicy>;
