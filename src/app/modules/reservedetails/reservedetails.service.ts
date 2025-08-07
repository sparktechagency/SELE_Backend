import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IReserveDetails } from './reservedetails.interface';
import { ReserveDetailsModel } from './reservedetails.model';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../../types/pagination';
import { sendNotifications } from '../../../helpers/notificationSender';
import { Rating } from '../reting/reting.model';
import { CarsModel } from '../cars/cars.model';
import { paymentVerificationModel } from '../paymentVerification/paymentVerification.model';
import { User } from '../user/user.model';
import { stripe } from '../../../config/stripe';
import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { USER_ROLES } from '../../../enums/user';

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

  const [userDetail, superAdmin] = await Promise.all([
    User.findById(user),
    User.findOne({ role: USER_ROLES.SUPER_ADMIN }),
  ]);
  if (superAdmin) {
    const notificationPayload = {
      sender: userDetail?._id,
      receiver: superAdmin._id,
      title: 'New Reserve Request',
      message: `${userDetail?.name} submitted a new reservation on ${new Date().toLocaleDateString()}`,
      isRead: false,
      filePath: 'reservation',
      referenceId: reserveData._id,
    };

    await sendNotifications(notificationPayload as any);
  }

  return reserveData;

};

// # do verify from admin
const ReservationVerifyFromDB = async (id: string, payload: any) => {
  const result = await ReserveDetailsModel.findByIdAndUpdate(id, payload, { new: true }).populate({ path: "carId", select: "agencyId" });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Can't find Reserve Details")
  }
  // get user and agency details
  const [userDetail, agencyDetail] = await Promise.all([
    User.findById(result?.userId),
    // @ts-ignore
    User.findById(result?.carId?.agencyId),
  ])

  const notificationPayload = {
    sender: userDetail?._id,
    receiver: agencyDetail?._id,
    title: `New Reservetion request from ${userDetail?.name}`,
    message: `Reservation request from ${userDetail?.name} is now in progress.`,
    isRead: false,
    filePath: 'reservation',
    referenceId: result?._id,
  };
  await sendNotifications(notificationPayload as any);
  return result
}



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
  if (options.payload) {
    // @ts-ignore
    filter['payload'] = options.payload;
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
      const insurance = Number((reserve?.carId as any)?.insuranceAmount) || 0;
      const price = pricePerDay * Day;

      const appCharge = 10;
      const finalTotal = +(price + appCharge + insurance).toFixed(2);

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

const getReceivedAInProgressAndAssignedReserveData = async (
  query: Record<string, any>,
  userId: string
) => {
  const baseFilter = {
    userId: new mongoose.Types.ObjectId(userId),
    payload: { $in: ['Request', 'InProgress', 'Assigned'] },
  };

  const combinedQuery = {
    ...query,
    ...baseFilter,
  };

  const queryBuilder = new QueryBuilder(
    ReserveDetailsModel.find(),
    combinedQuery
  );

  queryBuilder
    .filter()
    .search(['carName', 'location'])
    .sort()
    .paginate()
    .populate(['carId', 'userId'], {
      carId: '',
      userId: 'name email',
    });

  // nested populate for carId
  queryBuilder.modelQuery.populate({
    path: 'carId',
    populate: [
      { path: 'brandName' },
      { path: 'category' },
      { path: 'agencyId' },
    ],
  });

  const data = await queryBuilder.modelQuery.lean();
  const meta = await queryBuilder.getPaginationInfo();

  const processed = await Promise.all(
    data.map(async reserve => {
      // @ts-ignore
      const carId = reserve?.carId?._id;
      // @ts-ignore
      const start = new Date(reserve?.startDate);
      // @ts-ignore
      const end = new Date(reserve?.endDate);
      const Day = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      // @ts-ignore
      const pricePerDay = reserve?.carId?.price || 0;
      // @ts-ignore
      const insurance = Number(reserve?.carId?.insuranceAmount) || 0;
      const price = pricePerDay * Day;
      const appCharge = 10;
      const finalTotal = +(price + appCharge + insurance).toFixed(2);

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

      const reviews = await Rating.find({ carId })
        .limit(10)
        .populate('userId', 'name email image')
        .lean();

      const carWithRatings = {
        // @ts-ignore
        ...reserve.carId,
        ratings: {
          averageRating: ratingAggregation?.averageRating?.toFixed(1) || 0,
          totalRatings: ratingAggregation?.totalRatings || 0,
          reviews: {
            data: reviews.map(r => ({
              userId: r.userId,
              rating: r.rating,
              review: r.review,
              createdAt: r.createdAt,
            })),
            pagination: {
              page: 1,
              limit: 10,
              totalPages: Math.ceil(
                (ratingAggregation?.totalRatings || 0) / 10
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

  return {
    meta,
    data: processed,
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
    payload: { $in: allowedStatuses },
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
  const insurance = Number((reserve?.carId as any)?.insuranceAmount) || 0;
  const price = pricePerDay * Day;
  const appCharge = 10;
  const finalTotal = +(price + appCharge + insurance).toFixed(2);

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
const updateReserveDetails = async (id: string, data: IReserveDetails) => {

  const reserveDetails = await ReserveDetailsModel.findById(id).populate(
    'carId'
  );

  if (!reserveDetails) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Reserve Details not found');
  }

  // 💥 Check: Only validate agencyId if status is Delivered
  // @ts-ignore
  if (data.payload === 'Delivered') {
    const user = await User.findById(
      // @ts-ignore
      new Types.ObjectId(reserveDetails?.carId?.agencyId)
    );
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    }

    const stripeAccountId = user.accountInformation?.stripeAccountId;
    if (!stripeAccountId) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'User has no connected Stripe account'
      );
    }

    const totalDay = Math.ceil(
      (new Date(reserveDetails?.endDate!).getTime() -
        new Date(reserveDetails?.startDate!).getTime()) /
      (1000 * 60 * 60 * 24)
    );
    // @ts-ignore
    const totalPrice = totalDay * reserveDetails?.carId?.price;

    await stripe.transfers.create({
      amount: totalPrice,
      currency: user.accountInformation?.currency || 'usd',
      destination: stripeAccountId,
      description: `Payment to ${user.name} for delivered item`,
    });
  }

  // 🛠 Update data
  const updatedData: any = await ReserveDetailsModel.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
    }
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
    message: `Your reserve details are in ${data.payload}`,
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
const getReserveStatistics = async (agencyId: string) => {
  // Total orders excluding Cancelled
  const total = await ReserveDetailsModel.aggregate([
    { $match: {} },
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
      $match: {
        'carInfo.agencyId': new mongoose.Types.ObjectId(agencyId),
      },
    },
    {
      $addFields: {
        start: { $toDate: '$startDate' },
        end: { $toDate: '$endDate' },
      },
    },
    {
      $addFields: {
        durationDays: {
          $ceil: {
            $divide: [{ $subtract: ['$end', '$start'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalPrice: {
          $sum: { $multiply: ['$carInfo.price', '$durationDays'] },
        },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const totalPrice = total[0]?.totalPrice || 0;
  const totalOrders = total[0]?.totalOrders || 0;

  // In Progress orders
  const inProgress = await ReserveDetailsModel.aggregate([
    { $match: { payload: { $in: ['Request'] } } },
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
      $match: {
        'carInfo.agencyId': new mongoose.Types.ObjectId(agencyId),
      },
    },
    {
      $addFields: {
        start: { $toDate: '$startDate' },
        end: { $toDate: '$endDate' },
      },
    },
    {
      $addFields: {
        durationDays: {
          $ceil: {
            $divide: [{ $subtract: ['$end', '$start'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalPrice: {
          $sum: { $multiply: ['$carInfo.price', '$durationDays'] },
        },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const totalInProgressPrice = inProgress[0]?.totalPrice || 0;
  const totalReceived = inProgress[0]?.totalOrders || 0;

  // Active orders (InProgress or Assigned)
  const activeOrder = await ReserveDetailsModel.aggregate([
    { $match: { payload: { $in: ['InProgress', 'Assigned'] } } },
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
      $match: {
        'carInfo.agencyId': new mongoose.Types.ObjectId(agencyId),
      },
    },
    {
      $addFields: {
        start: { $toDate: '$startDate' },
        end: { $toDate: '$endDate' },
      },
    },
    {
      $addFields: {
        durationDays: {
          $ceil: {
            $divide: [{ $subtract: ['$end', '$start'] }, 1000 * 60 * 60 * 24],
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalPrice: {
          $sum: { $multiply: ['$carInfo.price', '$durationDays'] },
        },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const totalActiveOrderPrice = activeOrder[0]?.totalPrice || 0;
  const totalActiveOrders = activeOrder[0]?.totalOrders || 0;

  // Delivered orders - from paymentVerificationModel (no duration calculation here)
  const deliveredOrders = await paymentVerificationModel.aggregate([
    { $match: { status: 'successful' } },
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
      count: totalReceived,
      totalPrice: totalInProgressPrice.toFixed(2),
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
  // ** verify from admin
  ReservationVerifyFromDB,
  //
  getReceivedAInProgressAndAssignedReserveData,
  getReserveHistory,

  // statistics
  getReserveStatistics,
};
