import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IReserveDetails } from './reservedetails.interface';
import { ReserveDetailsModel } from './reservedetails.model';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../types/pagination';
import { sendNotifications } from '../../../helpers/notificationSender';
import { Rating } from '../reting/reting.model';
import { CarsModel } from '../cars/cars.model';
import { progressStatus } from '../../../enums/progressStatus';
import { paymentVerificationModel } from '../paymentVerification/paymentVerification.model';

// create reserve Data

const createReserveDetails = async (payload: IReserveDetails, user: string) => {
  const orderId = Math.floor(100000 + Math.random() * 900000);
  const newData = {
    ...payload,
    orderId,
  };
  const newPayload = { ...newData, userId: user };
  const reserveData = await ReserveDetailsModel.create(newPayload);
  if (!reserveData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Can't create Reserve Details");
  }

  const notificationPayload = {
    // @ts-ignore
    userId: reserveData?._id,
    title: 'Reserve Details In Progress',
    message: `Your reserve details are in InProgress`,
    type: 'reserve_details',
  };

  await sendNotifications(notificationPayload as any);
  return reserveData;
};

// get all reserve data
/// agency and rating details
const getAllReserveData = async (
  options: IPaginationOptions,
  userId: string,
  role?: string
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  let filter: any = {};

  if (role === 'AGENCY') {
    const cars = await CarsModel.find({ agencyId: userId }).select('_id');
    const carIds = cars.map(car => car._id);
    filter['carId'] = { $in: carIds };
  } else if (role === 'USER') {
    filter['userId'] = userId;
  }

  // @ts-ignore
  if (options.progressStatus) {
    // @ts-ignore
    filter['progressStatus'] = options.progressStatus;
  }

  const data = await ReserveDetailsModel.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .populate([
      {
        path: 'carId',
        populate: [
          {
            path: 'agencyId brandName',
            select:
              'name email image description location role brandName logo latitude longitude',
          },
          { path: 'category', select: 'category' },
        ],
      },
      {
        path: 'userId',
        select: 'name email image description location role ',
      },
    ]);

  // 2. Add ratings, rent days, total price etc
  const reserveDataWithRatings = await Promise.all(
    data.map(async reserve => {
      const carId = reserve.carId?._id;

      //  Calculate rental days
      const start = new Date(reserve?.startDate);
      const end = new Date(reserve?.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const Day = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // Price calculations
      const pricePerDay = (reserve?.carId as any)?.price;
      const price = pricePerDay * Day;
      const appCharge = 10;
      const finalTotal = +(price + appCharge).toFixed(2);

      // Rating aggregation
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
        ...(reserve.carId as any)?._doc,
        ratings: {
          averageRating: ratingAggregation?.averageRating?.toFixed(1) || 0,
          totalRatings: ratingAggregation?.totalRatings || 0,
          reviews: {
            data: reviews.map(r => ({
              userId: r?.userId,
              rating: r?.rating,
              review: r?.review,
              createdAt: r?.createdAt,
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

// const getReceivedAInProgressAndAssignedReserveData = async (
//   options: IPaginationOptions,
//   userId: string,
//   role?: string
// ) => {
//   const { page, limit, skip, sortBy, sortOrder } =
//     paginationHelper.calculatePagination(options);

//   const allowedStatuses = ['Request', 'InProgress', 'Assigned'];
//   const filter: any = {
//     progressStatus: { $in: allowedStatuses },
//   };

//   const data = await ReserveDetailsModel.find(filter)
//     .populate({
//       path: 'carId',
//       populate: [
//         { path: 'brandName' },
//         { path: 'category' },
//         { path: 'agencyId' },
//       ],
//     })
//     .populate('userId')
//     .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
//     .skip(skip)
//     .limit(limit)
//     .lean();
//   console.log(data);
//   const reserveDataWithRatings = await Promise.all(
//     data.map(async reserve => {
//       const carId = reserve?.carId?._id;
//       console.log(carId);

//       // Rental days calculation
//       const start = new Date(reserve?.startDate);
//       const end = new Date(reserve?.endDate);
//       const timeDiff = end.getTime() - start.getTime();
//       const Day = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

//       // Price calculation
//       const pricePerDay = (reserve?.carId as any)?.price || 0;
//       const price = pricePerDay * Day;
//       const appCharge = 10;
//       const finalTotal = +(price + appCharge).toFixed(2);

//       // Ratings aggregation
//       const [ratingAggregation] = await Rating.aggregate([
//         { $match: { carId } },
//         {
//           $group: {
//             _id: null,
//             averageRating: { $avg: '$rating' },
//             totalRatings: { $sum: 1 },
//           },
//         },
//       ]);

//       const ratingPage = 1;
//       const ratingLimit = 10;
//       const ratingSkip = (ratingPage - 1) * ratingLimit;

//       const reviews = await Rating.find({ carId })
//         .skip(ratingSkip)
//         .limit(ratingLimit)
//         .populate('userId', 'name email image')
//         .lean();
//       console.log(reviews);
//       const carWithRatings = {
//         ...(reserve.carId as any)?._doc,
//         ratings: {
//           averageRating: ratingAggregation?.averageRating?.toFixed(1) || 0,
//           totalRatings: ratingAggregation?.totalRatings || 0,
//           reviews: {
//             data: reviews.map(r => ({
//               userId: r?.userId,
//               rating: r?.rating,
//               review: r?.review,
//               createdAt: r?.createdAt,
//             })),
//             pagination: {
//               page: ratingPage,
//               limit: ratingLimit,
//               totalPages: Math.ceil(
//                 (ratingAggregation?.totalRatings || 0) / ratingLimit
//               ),
//             },
//           },
//         },
//       };

//       return {
//         ...reserve,
//         carId: carWithRatings,
//         Day,
//         price,
//         appCharge,
//         finalTotal,
//       };
//     })
//   );

//   const total = await ReserveDetailsModel.countDocuments(filter);

//   return {
//     meta: {
//       page,
//       limit,
//       total,
//     },
//     data: reserveDataWithRatings,
//   };
// };

const getReceivedAInProgressAndAssignedReserveData = async (
  options: IPaginationOptions,
  userId: string,
  role?: string
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const allowedStatuses = ['Request', 'InProgress', 'Assigned'];

  const filter: any = {
    progressStatus: { $in: allowedStatuses },
    userId: userId,
  };

  const data = await ReserveDetailsModel.find(filter)
    .populate({
      path: 'carId',
      populate: [
        { path: 'brandName' },
        { path: 'category' },
        { path: 'agencyId' },
      ],
    })
    .populate('userId')
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const reserveDataWithRatings = await Promise.all(
    data.map(async reserve => {
      const carId = reserve?.carId?._id;

      // Rental days calculation
      const start = new Date(reserve?.startDate);
      const end = new Date(reserve?.endDate);
      const timeDiff = end.getTime() - start.getTime();
      const Day = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // Price calculation
      const pricePerDay = (reserve?.carId as any)?.price || 0;
      const price = pricePerDay * Day;
      const appCharge = 10;
      const finalTotal = +(price + appCharge).toFixed(2);

      // Ratings aggregation
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
        .populate('userId', 'name email image')
        .lean();

      const carWithRatings = {
        ...reserve.carId,
        ratings: {
          averageRating: ratingAggregation?.averageRating?.toFixed(1) || 0,
          totalRatings: ratingAggregation?.totalRatings || 0,
          reviews: {
            data: reviews.map(r => ({
              userId: r?.userId,
              rating: r?.rating,
              review: r?.review,
              createdAt: r?.createdAt,
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
        ...reserve,
        carId: carWithRatings,
        Day,
        price,
        appCharge,
        finalTotal,
      };
    })
  );

  const total = await ReserveDetailsModel.countDocuments(filter);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: reserveDataWithRatings,
  };
};

const getReserveHistory = async (
  options: IPaginationOptions,
  userId: string,
  role?: string
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const allowedStatuses = ['Cancelled', 'Delivered'];
  const filter: any = {
    progressStatus: { $in: allowedStatuses },
  };
  const result = await ReserveDetailsModel.find(filter)
    .populate({
      path: 'carId',
      populate: [
        { path: 'brandName' },
        { path: 'category' },
        { path: 'agencyId' },
      ],
    })
    .populate('userId')
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  const total = await ReserveDetailsModel.countDocuments(filter);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleReserveData = async (id: string) => {
  const reserve = await ReserveDetailsModel.findById(id).populate([
    {
      path: 'carId',
      populate: [
        {
          path: 'agencyId brandName',
          select:
            'name email image description location role brandName logo latitude longitude',
        },
        { path: 'category', select: 'category' },
      ],
    },
    {
      path: 'userId',
      select: 'name email image description location role ',
    },
  ]);

  if (!reserve) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No Reserve Data found');
  }

  const carId = reserve.carId?._id;

  // Calculate rental days
  const start = new Date(reserve?.startDate);
  const end = new Date(reserve?.endDate);
  const timeDiff = end.getTime() - start.getTime();
  const Day = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Price calculations
  const pricePerDay = (reserve?.carId as any)?.price;
  const price = pricePerDay * Day;
  const appCharge = 10;
  const finalTotal = +(price + appCharge).toFixed(2);

  // Rating aggregation
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
    ...(reserve.carId as any)?._doc,
    ratings: {
      averageRating: ratingAggregation?.averageRating?.toFixed(1) || 0,
      totalRatings: ratingAggregation?.totalRatings || 0,
      reviews: {
        data: reviews.map(r => ({
          userId: r?.userId,
          rating: r?.rating,
          review: r?.review,
          createdAt: r?.createdAt,
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
    userId: updatedData?.userId,
    title: 'Reserve Details In Progress',
    message: `Your reserve details are in ${progressStatus}`,
    type: 'reserve_details',
    filePath: 'reservation',
    referenceId: updatedData?._id,
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

const getReserveStatistics = async () => {
  // Get total orders excluding cancelled ones and calculate total price
  const total = await ReserveDetailsModel.aggregate([
    {
      $match: { progressStatus: { $ne: 'Cancelled' } },
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'carId',
        foreignField: '_id',
        as: 'carInfo',
      },
    },
    { $unwind: '$carInfo' },
    {
      $group: {
        _id: null,
        totalPrice: { $sum: '$carInfo.price' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const totalPrice = total[0]?.totalPrice || 0;
  const totalOrders = total[0]?.totalOrders || 0;

  // Get total orders in progress
  const result = await ReserveDetailsModel.aggregate([
    {
      $match: { progressStatus: 'InProgress' },
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'carId',
        foreignField: '_id',
        as: 'carInfo',
      },
    },
    { $unwind: '$carInfo' },
    {
      $group: {
        _id: null,
        totalPrice: { $sum: '$carInfo.price' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const totalPrices = result[0]?.totalPrice || 0;
  const totalOrdersInProgress = result[0]?.totalOrders || 0;

  // Get active orders (InProgress or Assigned)
  const activeOrder = await ReserveDetailsModel.aggregate([
    {
      $match: {
        progressStatus: { $in: ['InProgress', 'Assigned'] },
      },
    },
    {
      $lookup: {
        from: 'cars', 
        localField: 'carId',
        foreignField: '_id',
        as: 'carInfo',
      },
    },
    { $unwind: '$carInfo' },
    {
      $group: {
        _id: null,
        totalPrice: { $sum: '$carInfo.price' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const totalActiveOrderPrice = activeOrder[0]?.totalPrice || 0;
  const totalActiveOrders = activeOrder[0]?.totalOrders || 0;

  // Get successfully delivered orders and calculate the total amount
  const deliveredOrders = await paymentVerificationModel.aggregate([
    {
      $match: { status: 'successful' },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDeliveredOrders: { $sum: 1 },
      },
    },
  ]);

  const totalAmount = deliveredOrders[0]?.totalAmount || 0;
  const totalDeliveredOrders = deliveredOrders[0]?.totalDeliveredOrders || 0;

  return {
    totalOrder: {
      count: totalOrders,
      totalPrice: totalPrice.toFixed(2),
    },
    receivedOrder: {
      count: totalOrdersInProgress,
      totalPrice: totalPrices.toFixed(2),
    },
    activeOrder: {
      count: totalActiveOrders,
      totalPrice: totalActiveOrderPrice.toFixed(2),
    },
    deliveredOrder: {
      count: totalDeliveredOrders,
      totalAmount: totalAmount.toFixed(2),
    },
  };
};


export const ReserveDetailsServices = {
  createReserveDetails,
  getAllReserveData,
  getSingleReserveData,
  updateReserveDetails,
  deleteReserveDetails,
  //
  getReceivedAInProgressAndAssignedReserveData,
  getReserveHistory,

  // statistics
  getReserveStatistics,
};
