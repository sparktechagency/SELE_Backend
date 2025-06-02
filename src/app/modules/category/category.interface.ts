import { Model } from 'mongoose';
import { category } from '../../../enums/category';

export type ICategory = {
  category: string;
};

export type CategoryModel = Model<ICategory>;
