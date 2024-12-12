// api.tsx
import axios, { AxiosResponse } from 'axios';
import Cookies from 'universal-cookie';
import { API_BASE_URL } from './apiConfig';
import { CustomResponse, FileDownloadResponse, LoginType, SignupType } from '../types/user.type';

const cookie = new Cookies();
let isTokenRefreshing = false;
let isMultipart = false;

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  try {
    const ACCESS_TOKEN = localStorage.getItem("tokenOrigin");
    if (isMultipart)
      config.headers['Content-Type'] = 'multipart/form-data';
    else
      config.headers['Content-Type'] = 'application/json';

    if (ACCESS_TOKEN != null)
      config.headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;

    isMultipart = false;
  } catch (e) {
    alert('Error request' + e);
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    const originalRequest = config;
    if (!response) {
      console.error('Unknown error occurred:', error);
      return Promise.reject(error);
    }

    const { status, data } = response;
    console.log("status", status);
    console.log("error data", data);

    if (status === 401) {
      if (!isTokenRefreshing) {
        if (data.code === '4401') {
          window.location.href = '/signin';
        }
        if (data.code === '4402') {
          isTokenRefreshing = true;
          const REFRESH_TOKEN = cookie.get('refresh-token');
          return axios({
            method: 'post',
            url: `${API_BASE_URL}/api/auth/refresh`,
            data: { REFRESH_TOKEN },
          }).then((response) => {
            const accessToken = response.data.data.accessToken;
            isTokenRefreshing = false;
            cookie.set('access_token', accessToken);
            client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            client.defaults.headers.common['Content-Type'] = 'application/json';
            return axios(originalRequest);
          }).catch((refreshError) => {
            isTokenRefreshing = false;
            console.error('Refresh token request failed:', refreshError);
            return Promise.reject(refreshError);
          });
        }
      }
    }
    return Promise.reject(error);
  },
);

const responseBody = (response: AxiosResponse) => response.data;

const requests = {
  get: (url: string) => client.get(url).then(responseBody),
  post: (url: string, body: {}) => client.post(url, body).then(responseBody),
  put: (url: string, body: {}) => client.put(url, body).then(responseBody),
  patch: (url: string, body: {}) => client.patch(url, body).then(responseBody),
  delete: (url: string) => client.delete(url).then(responseBody),
  file: (url: string, body: FormData, token: string) =>
    axios({
        method: 'post',
        url: url,
        data: body,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`  // Authorization 헤더 추가
        }
    }).then(responseBody),
};
const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};
export const CustomAxios = {
  
  postLogin: (post: LoginType): Promise<CustomResponse> => requests.post(API_BASE_URL + '/api/login', post),
  postSignup: (post: SignupType): Promise<CustomResponse> => requests.post(API_BASE_URL + '/api/signup', post),
  postFirstPreprocess: (formData: FormData, token: string ): Promise<CustomResponse> => requests.file(API_BASE_URL + '/api/first/preprocess', formData, token),
  
  postSecondPreprocess: (formData: FormData, token: string): Promise<CustomResponse> => {
    return client.post(API_BASE_URL + '/api/second/preprocess', formData, {
      headers: {
        'Authorization': `Bearer ${token}`, // Authorization 헤더 추가
        'Content-Type': 'multipart/form-data', // 올바른 헤더 설정 추가
      }
    }).then(responseBody);
},
  postFileStatus: (email: string, formattedDate: string, brand:string): Promise<Blob> => {
    return requests.get(`${API_BASE_URL}/download/${email}/${formattedDate}/${brand}_items.csv`);
  },
  postFileHistory: (email: string): Promise<Blob> => {
    return requests.get(`${API_BASE_URL}/download/${email}/upload_log.csv`);
  },
  postDownloadcsvfile: (email: string, formattedDate: string, brand: string): Promise<Blob> => {
    return requests.get(`${API_BASE_URL}/download/${email}/${formattedDate}/integrated_${brand}.csv`);
  },


};
