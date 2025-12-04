import cors from 'cors';
import rateLimit from 'express-rate-limit';
import requestIp from 'request-ip';
import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import handleStripeWebhook from './app/stripe/handleStripeWebhook';
import ApiError from './errors/ApiError';
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request, res) => {
    if (!req.clientIp) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Unable to determine client IP!'
      );
    }
    return req.clientIp;
  },
  handler: (
    _req: Request,
    _res: Response,
    _next: NextFunction,
    options: any
  ) => {
    _res.status(options?.statusCode || 429).json({
      success: false,
      message: `Rate limit exceeded. Try again in ${
        options.windowMs / 60000
      } minutes.`,
    });
  },
});
app.use(requestIp.mw());
app.use(limiter);

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);
//! stripe
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

//body parser
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//file retrieve
app.use(express.static('uploads'));

//router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(
    `<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `
  );
});

//global error handle
app.use(globalErrorHandler);

//handle not found route;
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
