import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../util/generateOTP';
import { IUser } from './user.interface';
import { User } from './user.model';
import { sendNotifications } from '../../../helpers/notificationSender';
import { USER_ROLES } from '../../../enums/user';

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };

  const createAccountTemplate = emailTemplate.createAccount(values);
  emailHelper.sendEmail(createAccountTemplate);

  // Save OTP in authentication field
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  await User.findByIdAndUpdate(
    createUser._id,
    { $set: { authentication } },
    { new: true }
  );
  const superAdmin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });
  if (!superAdmin) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Super admin not found');
  }

  // need to send notification to admin using sociat and email
  const notificationPayload = {
    sender: createUser._id,
    receiver: superAdmin._id,
    title: `New User Registration request from ${createUser.name}`,
    message: `Please verify ${createUser.name} email address and driving license and your ID.`,
    isRead: false,
    filePath: 'user',
    referenceId: createUser._id,
  };
  await sendNotifications(notificationPayload as any);
  // need to call email template and return user email and name to super admin
  const adminEmailTemplate = emailTemplate.adminEmailTemplate({
    name: createUser.name,
    email: superAdmin.email,
  });
  emailHelper.sendEmail(adminEmailTemplate);


  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //unlink file here
  if (payload.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};



///Otp Verification
const verifyOTPIntoDB = async (email: string, otp: number): Promise<boolean> => {
  const user = await User.findOne({ email }).select('+authentication');

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }


  if (!user.authentication) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Authentication field is missing');
  }

  const { oneTimeCode, expireAt } = user.authentication;


  if (Date.now() > new Date(expireAt).getTime()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP expired');
  }

  if (oneTimeCode !== otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP');
  }

  // Mark user as verified and remove OTP
  await User.findOneAndUpdate(
    { email },
    { $set: { verified: true }, $unset: { authentication: '' } }
  );

  return true;
};



export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  verifyOTPIntoDB
};
