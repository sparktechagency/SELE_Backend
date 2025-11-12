import nodemailer from 'nodemailer';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465, // true for 465, false for other ports
  secure: true, // use TLS
  auth: {
    user: 'sele1rental.com@www.selerental.com',
    pass: 'Thisshitcrazy1$',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: `"SELE" <sele1rental.com@www.selerental.com>`,
      to: values.to,
      subject: values.subject,
      html: values.html,
    });
    console.log('info', info);
    logger.info('✅ Email sent successfully!', info.messageId);
  } catch (error) {
    errorLogger.error('❌ Email send failed:', error);
  }
};

export const emailHelper = {
  sendEmail,
};
