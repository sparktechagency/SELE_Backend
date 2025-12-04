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
import crypto from 'crypto';
import config from './config';
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

app.post(
  '/github/webhook',
  express.json({ type: 'application/json' }),
  (req: Request, res: Response) => {
    try {
      const githubSecret = config.github.GITHUB_WEBHOOK_SECRET;

      //  Verify GitHub Signature (Optional but recommended)
      if (githubSecret) {
        const signature = req.headers['x-hub-signature-256'] as string;

        const body = JSON.stringify(req.body);
        const expectedSignature =
          'sha256=' +
          crypto.createHmac('sha256', githubSecret).update(body).digest('hex');

        if (signature !== expectedSignature) {
          return res.status(401).send('Invalid GitHub signature!');
        }
      }

      const event = req.headers['x-github-event'];
      const branch = req.body?.ref;

      console.log('🔔 GitHub Webhook Triggered!');
      console.log('Event:', event);

      // Deploy only on main branch push
      if (branch === 'refs/heads/main') {
        console.log('🚀 Deploying new update...');

        const { exec } = require('child_process');
        exec('sh /var/www/deploy.sh', (err: any, stdout: any, stderr: any) => {
          if (err) {
            console.error('Deploy error:', err);
            return;
          }
          console.log('Deploy Output:', stdout);
          if (stderr) console.error('Deploy Stderr:', stderr);
        });
      }

      return res.status(200).send('Webhook received!');
    } catch (error) {
      console.error('GitHub Webhook Error:', error);
      return res.status(500).json({
        success: false,
        message: 'GitHub webhook error',
      });
    }
  }
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
