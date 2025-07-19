import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IRating } from './reting.interface';
import { Rating } from './reting.model';
import { IPaginationOptions } from '../../../types/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';

const createRatingIntoDB = async (
  payload: IRating,
  user: any
): Promise<IRating | null> => {
  if (user.role === USER_ROLES.USER && !payload.carId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Car ID is required for user reviews'
    );
  }
  const result = await Rating.create({ ...payload, userId: user.id });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Rating');
  }
  return result;
};

const getAllRatingFromDB = async (
  carId: string,
  paginationOptions: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  // Validate carId format
  if (!Types.ObjectId.isValid(carId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid car ID format');
  }

  const query = { carId: new Types.ObjectId(carId) };

  const [result, total] = await Promise.all([
    Rating.find(query)
      .populate('userId', 'name email image')
      .populate('carId', 'title carImage')
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 }),

    Rating.countDocuments(query),
  ]);

  return {
    meta: { total, page, limit },
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
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  // Combine the rating details with average and total ratings
  const response = {
    ...result.toObject(),
    averageRating: aggregateResult[0]?.averageRating || 0,
    totalRatings: aggregateResult[0]?.totalRatings || 0,
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

const getAllUserReviewFromDBBaseOnUserDetails = async (
  userId: string,
  query: Record<string, any> = {}
) => {
  if (!userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User ID not found');
  }

  // Create a filter that matches either userId or userProfile
  const filter = {
    $or: [{ userId: userId }, { userProfile: userId }],
  };

  // Use the filter directly in the find method
  const queryBuilder = new QueryBuilder(Rating.find(filter), query);
  const result = await queryBuilder
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(['userProfile'], {
      userProfile: 'name email image createdAt updatedAt',
    }).modelQuery;
  const pagination = await queryBuilder.getPaginationInfo();

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to get Rating');
  }
  return { result, pagination };
};

export const RatingServices = {
  createRatingIntoDB,
  getAllRatingFromDB,
  getSingleRatingFromDB,
  updateRatingIntoDB,
  deleteRatingFromDB,
  getAllUserReviewFromDBBaseOnUserDetails,
};
