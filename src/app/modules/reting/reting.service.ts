import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IRating } from './reting.interface';
import { Rating } from './reting.model';
import { IPaginationOptions } from '../../../types/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';

const createRatingIntoDB = async (
  payload: IRating,
  user: any
): Promise<IRating | null> => {
  const result = await Rating.create({ ...payload, userId: user.id });
  console.log(result);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Rating');
  }
  return result;
};

const getAllRatingFromDB = async (
    paginationOptions: IPaginationOptions
  ): Promise<{ meta: { total: number; page: number; limit: number }; data: IRating[] }> => {
    const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

    const result = await Rating.find()
    .populate({
      path: 'userId',
      select: 'name email',
    })
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

  const total = await Rating.countDocuments();

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};


const getSingleRatingFromDB = async (id: string): Promise<IRating | null> => {
  const result = await Rating.findById(id).populate({
    path: 'userId',
    select: 'name email',
  });

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get Rating');
  }

  // Get average rating and total ratings for this car
  const aggregateResult = await Rating.aggregate([
    { $match: { carId: result.carId } },
    {
      $group: {
        _id: '$carId',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  // Combine the rating details with average and total ratings
  const response = {
    ...result.toObject(),
    averageRating: aggregateResult[0]?.averageRating || 0,
    totalRatings: aggregateResult[0]?.totalRatings || 0
  };

  return response;
};

const updateRatingIntoDB = async (
  id: string,
  payload: Partial<IRating>
): Promise<IRating | null> => {
  const result = await Rating.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update Rating');
  }
  return result;
};
const deleteRatingFromDB = async (id: string): Promise<IRating | null> => {
  const result = await Rating.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete Rating');
  }
  return result;
};

export const RatingServices = {
  createRatingIntoDB,
  getAllRatingFromDB,
  getSingleRatingFromDB,
  updateRatingIntoDB,
  deleteRatingFromDB,
};
