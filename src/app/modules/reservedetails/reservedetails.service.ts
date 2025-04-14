import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IReserveDetails } from './reservedetails.interface';
import { ReserveDetailsModel } from './reservedetails.model';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../types/pagination';
import { sendNotifications } from '../../../helpers/notificationSender';
import { Rating } from '../reting/reting.model';

// create reserve Data

const createReserveDetails = async (payload: IReserveDetails) => {
  const reserveData = await ReserveDetailsModel.create(payload);
  if (!reserveData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Can't create Reserve Details");
  }
  return reserveData;
};

// get all reserve data
/// agency and rating details
const getAllReserveData = async (options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const filter: any = {};
  if ((options as any).progressStatus) {
    filter.progressStatus = (options as any).progressStatus;
  }

  // 1. Fetch reserve details with carId -> category, userId populated
  const data = await ReserveDetailsModel.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .populate([
      {
        path: 'carId',
        populate: [
          {
            path: 'userId',
            select: 'name email image description location role',
          },
          { path: 'category', select: 'category' }, // ✅ full category
        ],
      },
      {
        path: 'userId',
        select: 'name email image description location role',
      },
    ]);

  // 2. Add ratings, rent days, total price etc
  const reserveDataWithRatings = await Promise.all(
    data.map(async reserve => {
      const carId = reserve.carId._id;

      // ✅ Calculate rental days
      const start = new Date(reserve.startDate);
      const end = new Date(reserve.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const Day = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // ✅ Price calculations
      const pricePerDay = (reserve.carId as any).price;
      const price = pricePerDay * Day;
      const appCharge = 10;
      const finalTotal = +(price + appCharge).toFixed(2);

      // ✅ Rating aggregation
      const [ratingAggregation] = await Rating.aggregate([
        { $match: { carId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalRatings: { $sum: 1 },
          },
        },
      ]);

      const ratingPage = 1;
      const ratingLimit = 10;
      const ratingSkip = (ratingPage - 1) * ratingLimit;

      const reviews = await Rating.find({ carId })
        .skip(ratingSkip)
        .limit(ratingLimit)
        .populate('userId', 'name email image');

      const carWithRatings = {
        ...(reserve.carId as any)._doc,
        ratings: {
          averageRating: ratingAggregation?.averageRating?.toFixed(1) || 0,
          totalRatings: ratingAggregation?.totalRatings || 0,
          reviews: {
            data: reviews.map(r => ({
              userId: r.userId,
              rating: r.rating,
              review: r.review,
            })),
            pagination: {
              page: ratingPage,
              limit: ratingLimit,
              totalPages: Math.ceil(
                (ratingAggregation?.totalRatings || 0) / ratingLimit
              ),
            },
          },
        },
      };

      return {
        ...reserve.toObject(),
        carId: carWithRatings,
        Day,
        price,
        appCharge,
        finalTotal,
      };
    })
  );

  const totalRecords = await ReserveDetailsModel.countDocuments(filter);

  return {
    data: reserveDataWithRatings,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    },
  };
};

const getSingleReserveData = async (id: string) => {
  const data = await ReserveDetailsModel.findById(id);
  if (!data) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No Reserve Data found');
  }
  return data;
};
// Update Reserve Details
const updateReserveDetails = async (id: string, progressStatus: string) => {
  const updatedData: any = await ReserveDetailsModel.findByIdAndUpdate(
    id,
    { progressStatus },
    { new: true }
  );
  if (!updatedData) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update Reserve Details'
    );
  }
  const notificationPayload = {
    userId: updatedData?._id,
    title: 'Reserve Details In Progress',
    message: `Your reserve details are in ${progressStatus}`,
    type: 'reserve_details',
  };

  await sendNotifications(notificationPayload as any);
  return updatedData;
};

// Delete Reserve Details
const deleteReserveDetails = async (id: string) => {
  const deletedData = await ReserveDetailsModel.findByIdAndDelete(id);
  if (!deletedData) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to delete Reserve Details'
    );
  }
  return deletedData;
};

export const ReserveDetailsServices = {
  createReserveDetails,
  getAllReserveData,
  getSingleReserveData,
  updateReserveDetails,
  deleteReserveDetails,
};
