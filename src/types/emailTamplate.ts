export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};
export type IResetOpt = {
  email: string;
  otp: number;
};