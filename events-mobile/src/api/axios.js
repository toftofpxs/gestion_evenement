import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.42:4000/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onTokenExpired = null;

export function setOnTokenExpired(callback) {
  onTokenExpired = callback;
}

export function getServerBaseUrl() {
  return BASE_URL.replace(/\/api\/?$/, '');
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
    if (error.response) {
      const status = error.response.status;
      if ((status === 401 || status === 403) && typeof onTokenExpired === 'function') {
        await onTokenExpired();
      }
    }
    return Promise.reject(error);
  }
);

export default API;
