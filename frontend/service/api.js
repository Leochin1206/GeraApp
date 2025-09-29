import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native'; 

const ipLocal = '192.168.0.47'; 

const baseURL = Platform.OS === 'web' ? 'http://127.0.0.1:8000' : `http://${ipLocal}:8000`; 

const api = axios.create({
  baseURL: baseURL, 
});

export { AxiosError };
export default api;