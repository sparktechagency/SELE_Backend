import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  name: string;
  role: USER_ROLES;
  email: string;
  password: string;
  confirmPassword: string;
  location: string;
  image?: string;
  verified: boolean;
  drivingLicense?: [string];
  yourID?: [string];
  adminApproval: boolean;
  isDeleted: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  latitude?: number;
  longitude?: number;
  description?: string;
  accountInformation?: {
    status: boolean;
    stripeAccountId: string;
    externalAccountId: string;
    currency: string;
    accountUrl: string;
  };
  unApprove?: boolean;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
