import { Response } from 'express';

type IData<T> = {
  totalLength?: number;
  success: boolean;
  statusCode: number;
  message?: string;
  meta?: any;
  data?: T;
};

const sendResponse = <T>(res: Response, data: IData<T>) => {
  const resData = {
    totalLength: data.totalLength,
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
  };
  res.status(data.statusCode).json(resData);
};

export default sendResponse;
