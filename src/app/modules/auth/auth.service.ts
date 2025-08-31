import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import {
  IAuthResetPassword,
  IChangePassword,
  ILoginData,
  IVerifyEmail,
} from '../../../types/auth';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { getBonzahToken } from '../../../util/getBonzahToken';
import { USER_ROLES } from '../../../enums/user';
import QueryBuilder from '../../builder/QueryBuilder';

//login
const loginUserFromDB = async (payload: ILoginData) => {
  const { email, password } = payload;

  // 1️⃣ Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // 2️⃣ Reactivate deleted account (with adminApproval check if needed)
  if (user.isDeleted) {
    user.isDeleted = false;
    user.adminApproval = true;
    await user.save();
  }

  // 3️⃣ Verify account status
  if (!user.verified) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please verify your account before logging in.'
    );
  }

  if (!user.adminApproval) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      'Your Driving License and Id is not approved. Please wait for admin approval.'
    );
  }

  if (user.role === USER_ROLES.USER && user.unApprove) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      'Your account has been deactivated. Please contact support.'
    );
  }

  if (user.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your account has been deleted. Please contact support.'
    );
  }

  // 4️⃣ Check password match
  const isPasswordValid = password
    ? await User.isMatchPassword(password, user.password)
    : false;

  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  // 5️⃣ Generate tokens
  const payloadData = { id: user._id, role: user.role, email: user.email };

  const accessToken = jwtHelper.createToken(
    payloadData,
    config.jwt.jwt_secret!,
    config.jwt.jwt_expire_in!
  );

  const refreshToken = jwtHelper.createToken(
    payloadData,
    config.jwt.jwt_refresh!,
    config.jwt.jwt_refresh_expire_in!
  );

  // 6️⃣ Get Bonza token if user role is USER
  const bonzaToken =
    user.role === USER_ROLES.USER ? await getBonzahToken() : null;

  return { accessToken, refreshToken, role: user.role, bonzaToken };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;

  // Find the user and check if the OTP exists
  const isExistUser = await User.findOne({ email }).select('+authentication');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please provide the OTP sent to your email'
    );
  }

  // Check if the provided OTP matches the stored OTP
  if (isExistUser.authentication?.oneTimeCode !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP');
  }

  const date = new Date();
  if (date > isExistUser.authentication?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'OTP has expired, please try again'
    );
  }
  let message;
  let data;
  if (!isExistUser.verified) {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      { verified: true, authentication: { oneTimeCode: null, expireAt: null } }
    );
    message = 'Email verify successfully';
  } else {
    await User.findOneAndUpdate(
      { _id: isExistUser._id },
      {
        authentication: {
          isResetPassword: true,
          oneTimeCode: null,
          expireAt: null,
        },
      }
    );

    //create token ;
    const createToken = cryptoToken();
    await ResetToken.create({
      user: isExistUser._id,
      token: createToken,
      expireAt: new Date(Date.now() + 5 * 60000),
    });
    message =
      'Verification Successful: Please securely store and utilize this code for reset password';
    data = createToken;
  }
  return { data, message };
};

// new access Token
const newAccessTokenToUser = async (token: string) => {
  // Check if the token is provided
  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Token is required!');
  }

  const verifyUser = jwtHelper.verifyToken(
    token,
    config.jwt.jwt_refresh as Secret
  );
  const isExistUser = await User.findById(verifyUser?.id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized access');
  }

  //create token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return accessToken;
};

//forget password
const resetPasswordToDB = async (
  token: string,
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const isExistToken = await ResetToken.isExistToken(token);
  if (!isExistToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  //user permission check
  const isExistUser = await User.findById(isExistToken.user).select(
    '+authentication'
  );
  if (!isExistUser?.authentication?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  //validity check
  const isValid = await ResetToken.isExpireToken(token);
  if (!isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password'
    );
  }

  //check password
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    authentication: {
      isResetPassword: false,
    },
  };

  await User.findOneAndUpdate({ _id: isExistToken.user }, updateData, {
    new: true,
  });
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};

// delete user
const deleteUserToDB = async (user: JwtPayload, password: string) => {
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const isPasswordMatched = await bcrypt.compare(
    password,
    isExistUser.password
  );
  if (!isPasswordMatched) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password doesn't match!");
  }
  if (isExistUser.isDeleted) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User already deleted!');
  }
  const result = await User.findOneAndUpdate(
    { _id: user.id },
    { isDeleted: true },
    { new: true }
  );

  return { result };
};

// resend otp
const resendOTP = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resendOtp(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
};

// get single user
const getSingleUserFromDB = async (user: JwtPayload) => {
  const result = await User.findById(user.id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return result;
};

const deleteUserByEmailAndPassword = async (
  email: string,
  password: string
) => {
  const isExistUser = await User.findOne({ email }).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //check match password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect');
  }
  const updateUser = await User.findByIdAndUpdate(isExistUser._id, {
    isDeleted: true,
  });
  if (!updateUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return;
};

// get all unapproved users
const getAllUnapprovedUsersIntoDB = async (query: Record<string, any>) => {
  const result = new QueryBuilder(User.find({ adminApproval: false }), query);

  const data = await result.modelQuery;
  const meta = await result.getPaginationInfo();

  return { data, meta };
};

export const AuthService = {
  verifyEmailToDB,
  loginUserFromDB,
  forgetPasswordToDB,
  resetPasswordToDB,
  changePasswordToDB,
  deleteUserToDB,
  resendOTP,
  getSingleUserFromDB,
  newAccessTokenToUser,
  deleteUserByEmailAndPassword,
  getAllUnapprovedUsersIntoDB,
};
