import { Model } from 'mongoose';

export type ITermsAndConditions = {
  description: string;
};

export type termsAndConditionsModel = Model<ITermsAndConditions>;
