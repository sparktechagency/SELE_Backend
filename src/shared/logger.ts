import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf(
  ({ level, message, label, timestamp }) => {
    const date = new Date(timestamp as string);
    const formattedDate = date.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const formattedTime = date.toLocaleTimeString(); // HH:MM:SS

    return `[${label}] 🚗 ${level.toUpperCase()} | 📅 ${formattedDate} ⏰ ${formattedTime} | 📝 ${message}`;
  }
);

// ✅ Common transport options
const successTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'winston', 'success', '%DATE%-success.log'),
  datePattern: 'DD-MM-YYYY-HH',
  maxSize: '20m',
  maxFiles: '1d',
});

const errorTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'winston', 'error', '%DATE%-error.log'),
  datePattern: 'DD-MM-YYYY-HH',
  maxSize: '20m',
  maxFiles: '1d',
});

// ✅ Success Logger (info, warn, etc.)
const logger = createLogger({
  level: 'info',
  format: combine(
    colorize({ all: true }),
    label({ label: 'CarRentalService' }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console(), successTransport],
});

// ❌ Error Logger
const errorLogger = createLogger({
  level: 'error',
  format: combine(
    colorize({ all: true }),
    label({ label: 'CarRentalService' }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console(), errorTransport],
});

export { logger, errorLogger };
