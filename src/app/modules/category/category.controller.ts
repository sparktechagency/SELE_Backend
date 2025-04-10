import { Request, Response, NextFunction } from 'express';
import { CategoryServices } from './category.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

const createCategory = catchAsync(async(req:Request, res:Response)=>{
  const { ...categoryData } = req.body;
  const result = await CategoryServices.createCategory(categoryData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category created successfully',
    data: result
  })
})

const getAllCategories = catchAsync(async(req:Request, res:Response)=>{
  const result = await CategoryServices.getAllCategories();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Categories fetched successfully',
    data: result
  })
})
const getSingleCategory = catchAsync(async(req:Request, res:Response)=>{
  const {id} = req.params;
  const result = await CategoryServices.getSingleCategory(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category fetched successfully',
    data: result
  })    
})

const updateCategory = catchAsync(async(req:Request, res:Response)=>{
  const {id} = req.params;
  const updatedData = req.body;
  const result = await CategoryServices.updateCategory(id, updatedData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category updated successfully',
    data: result    
  })
})

const deleteCategory = catchAsync(async(req:Request, res:Response)=>{
  const {id} = req.params;
  const result = await CategoryServices.deleteCategory(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category deleted successfully',
    data: result
  })
})


export const CategoryController = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory
 };
