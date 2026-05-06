import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import EventCard from '../components/EventCard';
import { useLocation } from 'react-router-dom';

const BrowseEvent = () => {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('search') || '';

  const refreshEvents = async () => {
    try {
      const response = await axiosInstance.get('/api/events');
      const sorted = response.data.sort((a, b) => 
        new Date(a.expStartDate) - new Date(b.expStartDate)
      );
      setEvents(sorted);
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const currentUserId = user?._id || user?.id;

  // member：已註冊的活動
  const myRegisteredEvents = events.filter(event =>
    event.participants?.some(p => String(p) === String(currentUserId)) &&
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // eventorganizer：自己建立的活動
  const myCreatedEvents = events.filter(event =>
  String(event.userId) === String(currentUserId) &&
  event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredEvents = events.filter(event =>
  event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="browse-container">

      {/* 上方區塊：role-based */}
      {user?.role === 'member' && myRegisteredEvents.length > 0 && (
        <div className="my-events-section">
          <h2 className="text-xl font-bold mb-4 px-4">My Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRegisteredEvents.map(event => (
              <EventCard key={event._id} event={event} user={user} isRegistered={true} onCancelSuccess={refreshEvents} />
            ))}
          </div>
        </div>
      )}

      {user?.role === 'eventorganizer' && myCreatedEvents.length > 0 && (
        <div className="my-events-section">
          <h2 className="text-xl font-bold mb-4 px-4">My Created Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCreatedEvents.map(event => (
              <EventCard key={event._id} event={event} user={user} isRegistered={false} onCancelSuccess={refreshEvents} />
            ))}
          </div>
        </div>
      )}

      {/* 下方：全部活動 */}
      <div className="all-events-section">
        <h2 className="text-xl font-bold mb-4 px-4">All Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event._id} event={event} user={user} isRegistered={
              event.participants?.some(p => String(p) === String(currentUserId))
            } onCancelSuccess={refreshEvents} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowseEvent;