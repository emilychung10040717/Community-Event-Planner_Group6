import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const EventCard = ({ event, user, isRegistered, onCancelSuccess }) => {
  const navigate = useNavigate();
  const categoryImages = {
  'Talk': '/talk.jpg',
  'Community': '/community.jpg',
  'Market': '/market.jpg',
  'Workshop': '/workshop.jpg',
};

const defaultImage = categoryImages[event.category] || '/community.jpg';


  const eventDate = new Date(event.expStartDate);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString('en-US', { month: 'short' });

  const currentParticipants = event?.participants?.length || 0;
  const isFull = currentParticipants >= event?.capacity;
  const handleCancel = async () => {
    try {
      await axiosInstance.delete(
        `/api/events/${event._id}/register`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Registration cancelled.");
      if (onCancelSuccess) onCancelSuccess();
    } catch (error) {
      alert(error.response?.data?.message || "Cancel failed");
    }
  };



  return (
    <div className="event-card">
      <div className="date-tag">
        <span className="day">{day}</span>
        <span className="month">{month}</span>
      </div>
      <div className="card-image">
        <img src={event.image || defaultImage} alt={event.title} />
      </div>
      <div className="card-content">
        <div className="title-row">
          <h3 className="event-title">{event.title}</h3>
          <div className="flex items-center gap-2">
            {isFull && (
              <span className="text-xs bg-red-100 text-red-400 px-2 py-0.5 rounded-full">Full</span>
            )}
            <span className="category-tag">{event.category || 'Event'}</span>
          </div>
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
            isRegistered ? (
              <button onClick={handleCancel} className="btn-register" style={{backgroundColor: '#B65DD8'}}>
                Cancel Registration
              </button>
            ) : (
              <button 
                onClick={() => !isFull && navigate(`/event-details/${event._id}`)}
                disabled={isFull}
                className={`btn-register ${isFull ? 'opacity-50 cursor-not-allowed bg-gray-300' : ''}`}
              >
                {isFull ? 'Fully Booked' : 'Register Event'}
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventCard;