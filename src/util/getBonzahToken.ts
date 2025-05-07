import axios from 'axios';
import config from '../config';

export const getBonzahToken = async () => {
  try {
    const response = await axios.post(
      `${config.bonza.bonzahAPIHOST}/api/v1/auth`,
      {
        email: config.bonza.bonzahUserName,
        pwd: config.bonza.bonzahPassword,
      }
    );
    console.log(response.data);

    if (response.data?.data?.token) {
      return response.data.data.token;
    } else {
      throw new Error('Bonzah login failed. No token received.');
    }
  } catch (error) {
    console.error('Error logging in to Bonzah:', error);
    throw new Error('Failed to login to Bonzah service');
  }
};
