import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local
  //baseURL: 'http://54.206.117.121:5001',     // live           
  headers: { 'Content-Type': 'application/json' },
});

// Before every request is sent, automatically intercept the request
// and attach the authentication token
axiosInstance.interceptors.request.use(
  (config) => {
    // Assume the token is stored inside localStorage
    // under "userInfo" in the token field
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      // Attach JWT token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;  
