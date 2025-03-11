import { Schema, model } from 'mongoose';
import { IAboutus } from './aboutus.interface';

const aboutusSchema = new Schema<IAboutus>({
  text: {
    type: String,
    required: true
  }
});

export const AboutusModel = model<IAboutus>('Aboutus', aboutusSchema);
