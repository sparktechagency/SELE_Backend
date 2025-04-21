import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import QueryBuilder from '../../builder/QueryBuilder';

// dashboard statistics
const dashboardStatisticsIntoDB = async () => {
  const totalUser = await User.countDocuments({ role: 'USER' });
  const totalAgency = await User.countDocuments({ role: 'AGENCY' });
  return {
    totalUser,
    totalAgency,
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
          $lte: endDate
        }
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
  
    if(!result){
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Users not found');
    }
  
    return {
      success: true,
      message: "Users fetched successfully",
      data: {
        meta: paginationInfo,
        data: result,
      }
    };
  };

export const DashboardService = {
  dashboardStatisticsIntoDB,
  getRecentUserForDashboard,
  getAllUsers,
};
