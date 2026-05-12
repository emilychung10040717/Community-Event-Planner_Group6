import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
 
// ─── 按鈕邏輯 ───
const ActionButton = ({ user, event, isRegistered, isFull, onRegister, onCancel, onNavigate }) => {
  const currentUserId = user?._id || user?.id;
  const isOwner =
    String(currentUserId) === String(event?.userId) && user?.role === 'eventorganizer';
 
  if (isOwner) {
    return (
      <button
        onClick={() => onNavigate(`/edit-event/${event._id}`)}
        className="w-full bg-[#7D5A94] hover:bg-[#6a4a7f] text-white py-4 rounded-2xl font-medium text-base transition-all"
      >
        ✏️ Update event
      </button>
    );
  }
 
  if (user?.role === 'eventorganizer') return null;
 
  if (user?.role === 'member') {
    return (
      <button
        onClick={isRegistered ? onCancel : onRegister}
        disabled={!isRegistered && isFull}
        className={`w-full py-4 rounded-2xl font-medium text-base transition-all
          ${isRegistered
            ? 'bg-[#B65DD8] hover:bg-[#9d4fbd] text-white'
            : isFull
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#73E58C] hover:bg-[#5db972] text-green-900'
          }`}
      >
        {isRegistered ? 'Cancel registration' : isFull ? 'Fully booked' : 'Register now'}
      </button>
    );
  }
 
  return (
    <button
      onClick={() => onNavigate('/login')}
      className="w-full bg-[#D1B3E2] hover:bg-[#C2A2D4] text-white py-4 rounded-2xl font-medium text-base transition-all"
    >
      Log in to register
    </button>
  );
};
 
// ─── 資訊格子 ───
const InfoCell = ({ icon, label, value, sub, extra }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 text-[#7D5A94] text-lg">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 leading-snug">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {extra}
    </div>
  </div>
);
 
// ───  component ───
const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
 
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/events/event-details/${id}`);
        setEvent(response.data);
        const currentUserId = user?._id || user?.id;
        const participants = response.data.participants || [];
        setIsRegistered(participants.some((p) => String(p) === String(currentUserId)));
      } catch (error) {
        console.error('Fetch error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, user]);
 
  const handleRegister = async () => {
    try {
      const response = await axiosInstance.post(
        `/api/events/${event._id}/register`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setEvent(response.data.event);
      setIsRegistered(true);
      alert('Successfully registered! 🎉');
    } catch (error) {
      alert(error.response?.data?.message || 'Register failed');
    }
  };
 
  const handleCancel = async () => {
    try {
      const response = await axiosInstance.delete(`/api/events/${event._id}/register`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEvent(response.data.event);
      setIsRegistered(false);
      alert('Registration cancelled.');
    } catch (error) {
      alert(error.response?.data?.message || 'Cancel failed');
    }
  };
 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Loading event details...
      </div>
    );
  }
 
  if (!event) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-400 gap-4">
        <p>Event not found.</p>
        <button onClick={() => navigate(-1)} className="text-purple-400 underline">Go back</button>
      </div>
    );
  }
 
  const currentParticipants = event?.participants?.length || 0;
  const isFull = currentParticipants >= event?.capacity;
  const capacityPercent = Math.min(Math.round((currentParticipants / event?.capacity) * 100), 100);
  const eventDate = event.expStartDate
    ? new Date(event.expStartDate).toLocaleDateString('en-AU', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'N/A';
 
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
 
      {/* ── Hero：全寬圖片 + overlay ── */}
      {/* pt-16 補 Navbar 高度，讓圖片從 Navbar 下方開始 */}
      <div className="max-w-5xl mx-auto px-4 pt-6">

        <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-md bg-white">
          <img
            src={event.image || `/${event.category?.toLowerCase()}.jpg`}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover block"
            onError={(e) => { e.target.src = '/community.jpg'; }}
          />
  
          {/* 深色漸層：上淡下深，讓標題清晰 */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)' }}
          />
  
          {/* Back 按鈕 */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-white text-sm px-4 py-1.5 rounded-full border border-white/50 bg-black/20 hover:bg-black/35 transition-all backdrop-blur-sm"
          >
            ← Back
          </button>
  
          {/* 分類 badge */}
          {event.category && (
            <span className="absolute top-4 right-4 z-10 bg-[#7D5A94] text-white text-xs font-medium px-3 py-1.5 rounded-full">
              {event.category}
            </span>
          )}
  
          {/* 活動標題 */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 z-10">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-white text-2xl font-bold leading-tight drop-shadow-md">
                {event.title}
              </h1>
            </div>
          </div>
        </div>
      </div>
 
      {/* ── 內容區（置中窄欄）── */}
      <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col gap-4">
 
        {/* 資訊卡 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="grid grid-cols-2 gap-5">
            <InfoCell
              icon="📅"
              label="Date"
              value={eventDate}
              sub={`${event.expStartTime} – ${event.expFinTime}`}
            />
            <InfoCell
              icon="📍"
              label="Location"
              value={event.location}
              sub={event.suburb}
            />
            <InfoCell
              icon="🏢"
              label="Organizer"
              value={event.organizer}
            />
            <InfoCell
              icon="👥"
              label="Spots"
              value={`${currentParticipants} / ${event.capacity} ppl`}
              extra={
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                  <div
                    className="h-full bg-[#7D5A94] rounded-full"
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              }
            />
          </div>
 
          {/* Tags */}
          <div className="border-t border-gray-100 mt-5 pt-4 flex flex-wrap gap-2">
            {event.ticketRequired ? (
              <span className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50">
                🎟 Ticket required
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full border border-purple-100 text-purple-600 bg-purple-50">
                Free entry
              </span>
            )}
            {event.ageRestriction && (
              <span className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50">
                18+
              </span>
            )}
            {isFull && (
              <span className="text-xs px-3 py-1 rounded-full border border-red-100 text-red-400 bg-red-50">
                Fully booked
              </span>
            )}
          </div>
        </div>
 
        {/* About 卡 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">About this event</h2>
          <p className= "text-sm md:text-base text-gray-500 leading-relaxed">
            {event.description || 'No description provided.'}
          </p>
        </div>
 
        {/* 按鈕 */}
        <ActionButton
          user={user}
          event={event}
          isRegistered={isRegistered}
          isFull={isFull}
          onRegister={handleRegister}
          onCancel={handleCancel}
          onNavigate={navigate}
        />
      </div>
    </div>
  );
};
 
export default EventDetails;