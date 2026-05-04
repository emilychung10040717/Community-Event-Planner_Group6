import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, user }) => {
  const navigate = useNavigate();
  
  // 日期解析邏輯封裝在這裡
  const eventDate = new Date(event.expStartDate);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString('en-US', { month: 'short' });

  return (
    <div className="event-card">
      <div className="date-tag">
        <span className="day">{day}</span>
        <span className="month">{month}</span>
      </div>
      <div className="card-image">
        <img src={event.image || 'default.jpg'} alt={event.title} />
      </div>
      <div className="card-content">
        <div className="title-row">
          <h3 className="event-title">{event.title}</h3>
          <span className="category-tag">{event.category || 'Event'}</span>
        </div>
        <div className="info-row">
          <p>🏠 {event.organizer}</p>
          <p>📍 {event.location}</p>
        </div>
        <div className="card-actions">
          <button onClick={() => navigate(`/event-details/${event._id}`)} className="btn-view">
              View Details
          </button>
          {user?.role === 'eventorganizer' && user?.id === event.userId ? (
            <button onClick={() => navigate(`/edit-event/${event._id}`)} className="btn-update">
              Update Details
            </button>
          ) : user?.role === 'member' ? (
            <button onClick={() => navigate(`/event-details/${event._id}`)} className="btn-register">
              Register Event
            </button>
          ) :null
          }
        </div>
      </div>
    </div>
  );
};

export default EventCard;