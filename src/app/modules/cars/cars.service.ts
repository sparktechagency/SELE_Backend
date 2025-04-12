import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICars } from './cars.interface';
import { CarsModel } from './cars.model';
import mongoose from 'mongoose';
import { paginationHelper } from '../../../helpers/paginationHelper';
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
  const page = filters.page ? Number(filters.page) : 1;
  const limit = filters.limit ? Number(filters.limit) : 10;
  const skip = (page - 1) * limit;

  const match: any = {};

  // Price filter
  if (filters.minPrice || filters.maxPrice) {
    const minPrice = Number(filters.minPrice) || 0;
    const maxPrice = Number(filters.maxPrice);
    if (!isNaN(maxPrice)) {
      match.price = {
        $gte: Math.min(minPrice, maxPrice),
        $lte: Math.max(minPrice, maxPrice),
      };
    }
  }

  // Kilometres
  if (filters.kilometresData) {
    const kmValue = Number(filters.kilometresData);
    if (!isNaN(kmValue)) {
      match.kilometresData = kmValue;
    }
  }

  // Brand
  if (filters.brandName) {
    match.brandName = new mongoose.Types.ObjectId(filters.brandName);
  }

  // Transmission
  if (filters.transmission) {
    match.transmission = filters.transmission;
  }

  // Category
  if (filters.category) {
    match.category = new mongoose.Types.ObjectId(filters.category);
  }

  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;

  const cars = await CarsModel.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'carId',
        as: 'reviews',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          {
            $unwind: '$userDetails'
          },
          {
            $project: {
              rating: 1,
              review: 1,
              'userDetails.name': 1,
              'userDetails.location': 1,
              'userDetails.image': 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'brands',
        localField: 'brandName',
        foreignField: '_id',
        as: 'brandName'
      }
    },
    {
      $unwind: '$brandName'
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $addFields: {
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: '$reviews' }, 0] },
            then: { $avg: '$reviews.rating' },
            else: 0
          }
        },
        totalReviews: { $size: '$reviews' }
      }
    },
    { $sort: { [sortBy]: sortOrder } },
    { $skip: skip },
    { $limit: limit }
  ]);

  const total = await CarsModel.countDocuments(match);

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit)
    },
    data: cars
  };
};


// get car by id
const getSingleCarFromDB = async (id: string) => {
  const car = await CarsModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id)
      }
    },
    {
      $lookup: {
        from: 'ratings', 
        localField: '_id',
        foreignField: 'carId',
        as: 'reviews',
        pipeline:[
          {
            $project:{
              rating:1,
              review:1,
            }
          }
        ]
      }
    },
    
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              location: 1,
              image: 1,
              description: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: '$reviews' }, 0] },
            then: { $avg: '$reviews.rating' },
            else: 0
          }
        },
        totalReviews: {
          $size: '$reviews'
        }
      }
    }
    
  ]);
  if (!car.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Car not found');
  }

  return car[0];
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
