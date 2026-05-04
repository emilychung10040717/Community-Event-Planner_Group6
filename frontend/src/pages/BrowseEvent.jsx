import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import EventCard from '../components/EventCard'; // 匯入組件
//import '.src/App.css'; 

const BrowseEvent = () => {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/api/events');
        setEvents(response.data);
      } catch (error) {
        console.error("Fetch error", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="browse-container">
      <header>
        <div className="search-bar">🔍 <input type="text" placeholder="Search..." style={{backgroundColor: "transparent", border: "none" , outline: "none", marginLeft: "10px"}}/></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          // 這裡體現了 OOP 的組合關係：BrowseEvent 包含多個 EventCard
          <EventCard key={event._id} event={event} user={user} />
        ))}
      </div>
    </div>
  );
};

export default BrowseEvent;