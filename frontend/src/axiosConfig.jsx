import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local
  //baseURL: 'http://54.206.117.121:5001',     // live           
  headers: { 'Content-Type': 'application/json' },
});

// 每次發送請求前，自動攔截並加上 Token
axiosInstance.interceptors.request.use(
  (config) => {
    // 假設你的 Token 存在 localStorage 叫 "userInfo" 裡的 token 欄位
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;  
