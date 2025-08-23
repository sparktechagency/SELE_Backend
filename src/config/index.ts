import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  ip_address: process.env.IP_ADDRESS,
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expire_in: process.env.JWT_EXPIRE_IN,
    jwt_refresh: process.env.JWT_SECRET_REFRESH,
    jwt_refresh_expire_in: process.env.JWT_REFRESH_EXPIRE_IN,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  super_admin: {
    email: process.env.SUPER_ADMIN_EMAIL,
    password: process.env.SUPER_ADMIN_PASSWORD,
    confirmPassword: process.env.SUPER_ADMIN_CONFIRM_PASSWORD,
  },
  stripe: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.WEBHOOK_SECRET,
    paymentSuccess: process.env.STRIPE_PAYMENT_SUCCESS_LINK,
    INITIAL_PAYMENT: process.env.INITIAL_PAYMENT_SUCCESS,
    INITIAL_PAYMENT_CANCEL: process.env.INITIAL_PAYMENT_CANCEL,
    // CONNECTED ACCOUNT
    CONNECTED_ACCOUNT_CREATE_URL: process.env.CONNECTED_ACCOUNT_CREATE_URL,
    // CONNECTED_ACCOUNT_SUCCESS_URL: process.env.CONNECTED_ACCOUNT_SUCCESS_URL,
    CONNECTED_ACCOUNT_SUCCESS_URL: process.env.CONNECTED_ACCOUNT_SUCCESS_URL,
    CONNECTED_ACCOUNT_FAILD_URL: process.env.CONNECTED_ACCOUNT_FAILD_URL,
  },
  bonza: {
    bonzahAPIHOST: process.env.BONZAH_API_HOST,
    bonzahUserName: process.env.BONZAH_USERNAME,
    bonzahPassword: process.env.BONZAH_PASSWORD,
  },
};
