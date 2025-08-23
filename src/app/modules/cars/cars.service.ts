import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICars } from './cars.interface';
import { CarsModel } from './cars.model';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
// create car
const createCarIntoDB = async (payload: ICars, agencyId: string) => {
  const agency = await User.findById(agencyId)
    .select('latitude longitude')
    .exec();

  if (!agency?.latitude || !agency?.longitude) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please update your profile information'
    );
  }

  const car = new CarsModel({ ...payload, agencyId });
  return car.save();
};

//
const getAllCarsFromDB = async (filters: any) => {
  const page = filters.page ? Number(filters.page) : 1;
  const limit = filters.limit ? Number(filters.limit) : 10;
  const skip = (page - 1) * limit;

  const match: any = {};

  // Price filter - IMPROVED IMPLEMENTATION
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    match.price = {};

    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      const minPriceValue = String(filters.minPrice).replace(/[^0-9.]/g, '');
      const minPrice = Number(minPriceValue);
      if (!isNaN(minPrice)) {
        match.price.$gte = minPrice;
      }
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      const maxPriceValue = String(filters.maxPrice).replace(/[^0-9.]/g, '');
      const maxPrice = Number(maxPriceValue);
      if (!isNaN(maxPrice)) {
        match.price.$lte = maxPrice;
      }
    }

    if (Object.keys(match.price).length === 0) {
      delete match.price;
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
    // Get car owner details (userDetails)
    {
      $lookup: {
        from: 'users',
        localField: 'agencyId',
        foreignField: '_id',
        as: 'userDetails',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              location: 1,
              image: 1,
              description: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$userDetails',
    },
    // Get reviews (with reviewer details)
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
              as: 'reviewerDetails',
              pipeline: [
                {
                  $project: {
                    name: 1,
                    location: 1,
                    image: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: '$reviewerDetails',
          },
          {
            $project: {
              rating: 1,
              review: 1,
              'reviewerDetails.name': 1,
              'reviewerDetails.location': 1,
              'reviewerDetails.image': 1,
            },
          },
        ],
      },
    },
    // Get brand details
    {
      $lookup: {
        from: 'brands',
        localField: 'brandName',
        foreignField: '_id',
        as: 'brandName',
      },
    },
    {
      $unwind: '$brandName',
    },
    // Get category details
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: '$category',
    },
    // Calculate average rating and total reviews
    {
      $addFields: {
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: '$reviews' }, 0] },
            then: { $avg: '$reviews.rating' },
            else: 0,
          },
        },
        totalReviews: { $size: '$reviews' },
      },
    },
    { $sort: { [sortBy]: sortOrder } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await CarsModel.countDocuments(match);

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data: cars,
  };
};

// get car by id
const getSingleCarFromDB = async (id: string) => {
  const car = await CarsModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: 'ratings',
        localField: '_id',
        foreignField: 'carId',
        as: 'reviews',
        pipeline: [
          {
            $project: {
              rating: 1,
              review: 1,
            },
          },
        ],
      },
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
              description: 1,
            },
          },
        ],
      },
    },
    // Get brand details
    {
      $lookup: {
        from: 'brands',
        localField: 'brandName',
        foreignField: '_id',
        as: 'brandName',
      },
    },
    {
      $unwind: '$brandName',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: '$category',
    },

    // { $match:  },
    // Get car owner details (userDetails)
    {
      $lookup: {
        from: 'users',
        localField: 'agencyId',
        foreignField: '_id',
        as: 'userDetails',
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              location: 1,
              image: 1,
              description: 1,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: '$reviews' }, 0] },
            then: { $avg: '$reviews.rating' },
            else: 0,
          },
        },
        totalReviews: {
          $size: '$reviews',
        },
      },
    },
  ]);
  if (!car.length) {
    return [];
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

const getCarBaseOnAgencyIdFromDB = async (
  agencyId: string,
  query: Record<string, unknown>
) => {
  const modelQuery = CarsModel.find({ agencyId }).populate([
    { path: 'brandName' },
    { path: 'category' },
    { path: 'agencyId' },
  ]);

  const queryBuilder = new QueryBuilder(modelQuery, query);

  queryBuilder.paginate(); // apply pagination

  const cars = await queryBuilder.modelQuery;

  if (!cars.length) {
    return [];
  }

  const paginationInfo = await queryBuilder.getPaginationInfo();

  return {
    meta: paginationInfo,
    data: cars,
  };
};

export const CarsServices = {
  createCarIntoDB,
  getAllCarsFromDB,
  getSingleCarFromDB,
  updateCarIntoDB,
  deleteCarFromDB,
  getCarBaseOnAgencyIdFromDB,
};
