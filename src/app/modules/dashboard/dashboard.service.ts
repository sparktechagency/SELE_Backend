import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { ReserveDetailsModel } from '../reservedetails/reservedetails.model';
import { paymentVerificationModel } from '../paymentVerification/paymentVerification.model';

// dashboard statistics
const dashboardStatisticsIntoDB = async () => {
  const totalUser = await User.countDocuments({ role: 'USER' });
  const totalAgency = await User.countDocuments({ role: 'AGENCY' });
  const totalEarning = await paymentVerificationModel.find();
  const earningPerTransaction = 10;
  const calculatedTotalEarning = totalEarning.length * earningPerTransaction;
  return {
    totalUser,
    totalAgency,
    totalEarning: calculatedTotalEarning,
  };
};

// recent user

const getRecentUserForDashboard = async () => {
  const result = await User.find({ role: 'USER' })
    .sort({ createdAt: -1 })
    .limit(10);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Recent user not found');
  }
  return result;
};

// get all users
const getAllUsers = async (query: Record<string, unknown>) => {
  const { year, ...remainingQuery } = query;

  let userQuery = User.find({ role: 'USER' });

  // Add year filter if provided
  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    userQuery = userQuery.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  const userBuilder = new QueryBuilder(userQuery, remainingQuery)
    .search(['name', 'email', 'location'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userBuilder.modelQuery;
  const paginationInfo = await userBuilder.getPaginationInfo();

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Users not found');
  }

  return {
    data: {
      meta: paginationInfo,
      data: result,
    },
  };
};

// get single user
const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }
  return result;
};

// delete user
const deleteUserFromDB = async (id: string) => {
  const result = await User.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }
  return result;
};
// total earning
const totalEarningFromDB = async () => {
  const result = await ReserveDetailsModel.aggregate([
    {
      $match: {
        payload: { $in: ['Delivered', 'Assigned'] },
      },
    },
    {
      $group: {
        _id: null,
        totalAppCharge: { $sum: 10 },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalAppCharge: 1,
        totalOrders: 1,
      },
    },
  ]);

  if (!result.length) {
    return {
      totalAppCharge: 0,
      totalOrders: 0,
    };
  }

  return result[0];
};

//  total earning by month
const totalEarningByMonthFromDB = async () => {
  const currentYear = new Date().getFullYear();

  const result = await ReserveDetailsModel.aggregate([
    {
      $match: {
        progressStatus: { $in: ['Delivered', 'Assigned'] },
      },
    },
    {
      $addFields: {
        convertedDate: {
          $dateFromString: {
            dateString: '$startDate',
            onError: null,
          },
        },
      },
    },
    {
      $match: {
        convertedDate: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$convertedDate' },
        totalAppCharge: { $sum: 10 },
        totalOrders: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Create array for all 12 months
  const monthlyData = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    monthName: new Date(2024, index).toLocaleString('en-US', { month: 'long' }),
    totalAppCharge: 0,
    totalOrders: 0,
  }));

  // Fill in actual data
  result.forEach(item => {
    const monthIndex = item._id - 1;
    monthlyData[monthIndex].totalAppCharge = item.totalAppCharge;
    monthlyData[monthIndex].totalOrders = item.totalOrders;
  });

  return monthlyData;
};

// agency
const totalAgency = async (query: Record<string, unknown>) => {
  const { year, ...remainingQuery } = query;

  let userQuery = User.find({ role: 'AGENCY' });

  // Add year filter if provided
  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    userQuery = userQuery.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  const userBuilder = new QueryBuilder(userQuery, remainingQuery)
    .search(['name', 'email', 'location'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userBuilder.modelQuery;
  const paginationInfo = await userBuilder.getPaginationInfo();

  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Agency not found');
  }

  return {
    data: {
      meta: paginationInfo,
      data: result,
    },
  };
};

// single agency
const getSingleAgencyFromDB = async (id: string) => {
  const result = await User.findById(id);
  if (result?.role !== 'AGENCY') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Agency not found');
  }
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Agency not found');
  }
  return result;
};

// delete agency
const deleteAgencyFromDB = async (id: string) => {
  const result = await User.findByIdAndDelete(id);
  if (result?.role !== 'AGENCY') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Agency not found');
  }
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Agency not found');
  }
  return result;
};

const totalUserEarning = async (query: Record<string, unknown>) => {
  const userQuery = paymentVerificationModel.find().populate('userId');

  const userBuilder = new QueryBuilder(userQuery, query)
    .search(['userId.email'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userBuilder.modelQuery;
  const paginationInfo = await userBuilder.getPaginationInfo();
  if (!result.length) {
    return {
      meta: paginationInfo,
      data: [],
    };
  }
  return {
    meta: paginationInfo,
    data: result
  };
};

export const DashboardService = {
  dashboardStatisticsIntoDB,
  getRecentUserForDashboard,
  getAllUsers,
  getSingleUserFromDB,
  deleteUserFromDB,
  totalAgency,
  getSingleAgencyFromDB,
  deleteAgencyFromDB,
  totalEarningFromDB,
  totalEarningByMonthFromDB,
  totalUserEarning,
};
