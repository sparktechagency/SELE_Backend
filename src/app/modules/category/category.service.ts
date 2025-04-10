import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { CategoryModel, ICategory } from './category.interface';
import { Category } from './category.model';

const createCategory = async (payload: ICategory) => {
  const result = await Category.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Failed to create category');
  }
  return result;
};
const getAllCategories = async () => {
  const result = await Category.find();
  if (!result) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Failed to get categories');
  }
  return result;
};
const getSingleCategory = async (id: string) => {
  const result = await Category.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Failed to get category');
  }
  return result;    
}
const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  const result = await Category.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Failed to update category');
  }
  return result;
};
const deleteCategory = async (id: string) => {
  const result = await Category.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, 'Failed to delete category');
  }
  return result;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,   
};
