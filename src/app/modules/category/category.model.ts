import { Schema, model } from 'mongoose';
import { ICategory, CategoryModel } from './category.interface'; 

const categorySchema = new Schema<ICategory, CategoryModel>({
  // Define schema fields here
});

export const Category = model<ICategory, CategoryModel>('Category', categorySchema);
