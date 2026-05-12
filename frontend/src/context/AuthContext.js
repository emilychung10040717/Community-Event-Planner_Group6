import React, { createContext, useState, useContext } from 'react';
import axiosInstance from '../axiosConfig';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null; // ✅ 重整後從 localStorage 讀回
  });


  const login = async (loginData) => {
    try{
      const response = await axiosInstance.post('/api/auth/login', loginData);
      console.log('Login response:', response.data); // 確認有沒有 name 欄位
      setUser(response.data);
      localStorage.setItem('userInfo', JSON.stringify(response.data)); // ✅ 加這行
      return response.data;
    } catch (error) {
      console.log("Axios Error Status:", error.response?.status);
      console.log("Axios Error Data:", error.response?.data);
      if (error.response) {
        const{status} = error.response;
        if (status === 404 || status === 401) {   
          throw new Error("GMAIL_NOT_FOUND or INVALID_PASSWORD");
        } 
      }
      throw new Error("LOGIN_FAILED");
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo'); // ✅ 加這行
  };
  
  return(
      <AuthContext.Provider value={{ user, login, logout }}>
        {children}
      </AuthContext.Provider> 
  );
};
export const useAuth = () => useContext(AuthContext);
