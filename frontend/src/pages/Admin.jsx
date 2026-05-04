import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';


const Admin = () => {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();

};
export default Admin;