import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import ApiError from '../../errors/ApiError';

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case 'image':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'media':
          uploadDir = path.join(baseUploadDir, 'media');
          break;
        case 'doc':
          uploadDir = path.join(baseUploadDir, 'doc');
          break;
        case "logo":
          uploadDir = path.join(baseUploadDir, "logo")
          break
        case "carImage":
          uploadDir = path.join(baseUploadDir, "carImage")
          break;
        case "drivingLicense":
          uploadDir = path.join(baseUploadDir, "drivingLicense")
          break
        case "yourID":
          uploadDir = path.join(baseUploadDir, "yourID")
          break
        case "messageImage":
          uploadDir = path.join(baseUploadDir, "messageImage")
          break
        default:
          throw new ApiError(StatusCodes.BAD_REQUEST, 'File is not supported');
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  //file filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    // console.log("Received file fieldname:", file.fieldname);
    // console.log("Received file mimetype:", file.mimetype);

    if (file.fieldname === 'image' || file.fieldname === 'logo' || file.fieldname === 'carImage' || file.fieldname === "yourID" || file.fieldname === "drivingLicense" || file.fieldname === "messageImage") {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/gif' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'image/svg+xml' ||
        file.mimetype === 'image/bmp' ||
        file.mimetype === 'image/tiff'
      ) {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .jpeg, .png, .jpg, .gif, .webp, .svg, .bmp, .tiff files are supported'
          )
        );
      }
    } else if (file.fieldname === 'media') {
      if (file.mimetype === 'video/mp4' || file.mimetype === 'audio/mpeg') {
        cb(null, true);
      } else {
        cb(
          new ApiError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .mp3, file supported'
          )
        );
      }
    } else if (file.fieldname === 'doc') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new ApiError(StatusCodes.BAD_REQUEST, 'Only pdf supported'));
      }
    } else {
      cb(new ApiError(StatusCodes.BAD_REQUEST, 'This file is not supported'));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: filterFilter,
  }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'media', maxCount: 3 },
    { name: 'doc', maxCount: 3 },
    { name: 'logo', maxCount: 1 },
    { name: 'carImage', maxCount: 2 },
    { name: "drivingLicense", maxCount: 2 },
    { name: "yourID", maxCount: 2 },
    { name: "messageImage", maxCount: 1 }
  ]);
  return upload;
};

export default fileUploadHandler;
