import { Schema, model } from 'mongoose';
import { ICategory } from './category.interface'; 
import { category } from '../../../enums/category';

const categorySchema = new Schema<ICategory>({
  // @ts-ignore
  category: { type: String, enum: Object.values(category), required: true },
});

export const Category = model<ICategory>('Category', categorySchema);
