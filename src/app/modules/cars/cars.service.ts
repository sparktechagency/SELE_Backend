import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICars } from './cars.interface';
import { CarsModel } from './cars.model';
import { Category } from '../category/category.model';
import { BrandModel } from '../brand/brand.model';
import mongoose from 'mongoose';
import { paginationHelper } from '../../../helpers/paginationHelper';
import QueryBuilder from '../../../helpers/queryBuilder';
// create car
const createCarIntoDB = async (payload: ICars, userId: string) => {
  const car = await CarsModel.create({ ...payload, userId });
  if (!car) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create car');
  }
  return car;
};

// get all car
const getAllCarsFromDB = async (filters: any) => {
  filters.page = filters.page ? Number(filters.page) : 1; // Default to page 1
  filters.limit = filters.limit ? Number(filters.limit) : 10; // Default to limit 10
  const query: any = {};
  // Price filtering

  //   !Todo: price filtering not working
  // Handle price range filtering
  if (filters.minPrice || filters.maxPrice) {
    const minPrice = Number(filters.minPrice) || 0;
    const maxPrice = Number(filters.maxPrice);
    if (!isNaN(maxPrice)) {
      query.price = {
        $gte: Math.min(minPrice, maxPrice),
        $lte: Math.max(minPrice, maxPrice),
      };
    }
  }

  // Kilometres filtering
  if (filters.kilometresData) {
    const kmValue = Number(filters.kilometresData);
    if (!isNaN(kmValue)) {
      query.kilometresData = kmValue;
    }
  }
  // Brand Name filtering
  if (filters.brandName) {
    query.brandName = new mongoose.Types.ObjectId(filters.brandName);
  }

  // Transmission filtering
  if (filters.transmission) {
    query.transmission = filters.transmission;
  }

  // category filtering
  if (filters.category) {
    query.category = new mongoose.Types.ObjectId(filters.category);
  }
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(filters);
  const cars = await CarsModel.find(query)
    .skip(skip) // Apply skip for pagination
    .limit(limit) // Apply limit for pagination
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 }) // Sorting logic
    .populate({
      path: 'brandName',
      select: 'brandName _id',
    })
    .populate({
      path: 'category',
      select: 'category _id',
    })
    .populate({
      path: 'userId',
      select: 'name email _id location image description',
    })
    .lean();
  if (!cars) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch cars'
    );
  }

  return cars;
};


// get car by id
const getSingleCarFromDB = async (id: string) => {
  const car = await CarsModel.findById(id);
  if (!car) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Car not found');
  }
  return car;
};

// update car
const updateCarIntoDB = async (id: string, payload: Partial<ICars>) => {
  const car = await CarsModel.findByIdAndUpdate(id, payload, { new: true });
  if (!car) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Car not found');
  }
  return car;
};

// delete car
const deleteCarFromDB = async (id: string) => {
  const car = await CarsModel.findByIdAndDelete(id);
  if (!car) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Car not found');
  }
  return car;
};

export const CarsServices = {
  createCarIntoDB,
  getAllCarsFromDB,
  getSingleCarFromDB,
  updateCarIntoDB,
  deleteCarFromDB,
};
