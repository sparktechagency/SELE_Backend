import { Model } from 'mongoose';
import { category } from '../../../enums/category';

export type ICategory = {
category: category;
};

export type CategoryModel = Model<ICategory>;
