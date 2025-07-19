import { Request, Response, NextFunction } from 'express';
import { ReserveDetailsServices } from './reservedetails.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getMultipleFilesPath } from '../../../shared/getFilePath';

const createReserveDetails = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;
  const data = req.body;
  const result = await ReserveDetailsServices.createReserveDetails(data, user);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Successfully create Reserve Details',
    data: result,
  });
});

const getAllReserveDetails = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, sortBy, sortOrder, progressStatus } = req.query;
  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc',
    progressStatus: progressStatus,
  };

  // Log the final options passed to the service
  const userId = req.user.id;
  const role = req.user.role;
  // @ts-ignore
  const result = await ReserveDetailsServices.getAllReserveData(
    // @ts-ignore
    options,
    userId,
    role
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully retrieved all reserve details',
    // @ts-ignore
    data: result.data,
    // @ts-ignore
    pagination: result.pagination,
  });
});

const getSpecificReserveDetails = catchAsync(async (req, res) => {
  // Tumar query parameters like page, limit, sortBy, searchTerm etc ekhane thakbe
  const queryParams = req.query;

  // userId auth middleware theke pabe
  const userId = req.user.id;

  const data =
    await ReserveDetailsServices.getReceivedAInProgressAndAssignedReserveData(
      queryParams,
      userId
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully retrieved specific reserve details',
    meta: data.meta,
    data: data.data,
  });
});

const getSpecificReserveHistory = catchAsync(
  async (req: Request, res: Response) => {
    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as string) || 'desc',
    };

    const data = await ReserveDetailsServices.getReserveHistory(
      {
        page: options.page,
        limit: options.limit,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder as 'asc' | 'desc',
      },
      req.user.id
    );

    const processedData = data.data.map((reservation: any) => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);

      // Calculate number of days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      // Calculate total cost
      const dailyPrice = reservation.carId.price;
      const rentalCost = dailyPrice * days;
      const appCharge = 10;
      const totalCost = rentalCost + appCharge;

      return {
        ...reservation.toObject(),
        Day: days,
        price: dailyPrice,
        appCharge: appCharge,
        finalTotal: totalCost,
      };
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successfully retrieved specific reserve details',
      data: processedData,
      // @ts-ignore
      pagination: data.meta,
    });
  }
);

const getSingleReserveDetails = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ReserveDetailsServices.getSingleReserveData(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successfully Retrieve Details',
      data: result,
    });
  }
);

const updateReserveDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  // ⬇ Optional file handling
  // @ts-ignore
  const drivingLicense = getMultipleFilesPath(req.files, 'drivingLicense');
  // @ts-ignore
  const yourID = getMultipleFilesPath(req.files, 'yourID');

  if (drivingLicense?.length) {
    data.drivingLicense = drivingLicense;
  }
  if (yourID?.length) {
    data.yourID = yourID;
  }

  const result = await ReserveDetailsServices.updateReserveDetails(id, data);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully Updated Reserve Details',
    data: result,
  });
});

const deleteReserveDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleteData = await ReserveDetailsServices.deleteReserveDetails(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully Delete Reserve Details',
    data: deleteData,
  });
});

// statistics
const getReserveStatistics = catchAsync(async (req: Request, res: Response) => {
  const result = await ReserveDetailsServices.getReserveStatistics();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Successfully Retrieve Statistics',
    data: result,
  });
});

export const ReserveDetailsController = {
  createReserveDetails,
  getAllReserveDetails,
  getSingleReserveDetails,
  updateReserveDetails,
  deleteReserveDetails,
  getSpecificReserveDetails,
  getSpecificReserveHistory,
  getReserveStatistics,
};
