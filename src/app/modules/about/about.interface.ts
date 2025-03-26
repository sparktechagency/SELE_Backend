import { Model } from 'mongoose';

export type IAbout = {
  description: string;
};

export type AboutModel = Model<IAbout>;
