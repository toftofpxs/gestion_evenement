import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_URL = 'http://192.168.1.42:4000/api';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/?api\/?$/, '');

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onTokenExpired = null;

export function setOnTokenExpired(callback) {
  onTokenExpired = callback;
}

API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && typeof onTokenExpired === 'function') {
      await onTokenExpired();
    }
    return Promise.reject(error);
  }
);

export default API;
