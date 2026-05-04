import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log("the id of this event is:", id)
        const response = await axiosInstance.get(`/api/events/event-details/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Fetch error", error);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  // 重要：如果 event 還沒抓到，先回傳 Loading，避免後續讀取 event.title 報錯
  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading event details...
      </div>
    );
  }
  
  console.log("user._id:", user?._id)
  console.log("event.userId:", event?.userId)
  console.log("user.role:", user?.role)
  console.log("id match:", String(user?._id) === String(event?.userId))
  return (
    <div className="max-w mx-auto bg-white min-h-screen pb-10 shadow-lg relative">
      {/* 1. 活動圖片 */}
      <div className="relative h-64 w-full">
        <img 
          // 假設你的後端圖片靜態資料夾在 localhost:5005
          //src={event.image ? `http://localhost:5005/${event.image}` : '/default-event.png'} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />

      </div>

      <div className="px-6 py-4">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-4 left-4 text-white flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-hover hover:bg-black/60"
        >
          ← Back
        </button>
        {/* 2. 活動標題 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{event.title}</h1>

        {/* 3. 詳細資訊清單 */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">📅</div>
            <div>
              <p className="font-medium text-gray-700">
                {event.expStartDate ? new Date(event.expStartDate).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-sm text-gray-400">{event.expStartTime} - {event.expFinTime}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">📍</div>
            <div>
              <p className="font-medium text-gray-700">{event.location}</p>
              <p className="text-sm text-gray-400">{event.suburb}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">🏠</div>
            <div>
              <p className="font-medium text-gray-700">{event.organizer}</p>
              <p className="text-sm text-gray-400">Organizer</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600">👥</div>
            <div>
              <p className="font-medium text-gray-700">{event.capacity} ppl</p>
              <p className="text-sm text-gray-400">
                {event.ticketRequired ? "Ticket Required" : "Free Entry"} 
                {event.ageRestriction && " • 18+"}
              </p>
            </div>
          </div>
        </div>

        {/* 4. About Event */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">About Event</h2>
          <p className="text-gray-500 leading-relaxed">
            {event.description || "No description provided."}
          </p>
        </div>


        {/* 5. 底部按鈕 */}
        <div className="mt-10">
          {/* 確保 ID 比較時型別一致 */}
          {String(user?.id) === String(event.userId) && user?.role === 'eventorganizer'? (
            <button 
              onClick={() => navigate(`/edit-event/${event._id}`)}
              className="w-full bg-[#A478C8] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-[#8e62b1] transition-all"
            >
              UPDATE ✏️
            </button>

            ) : ( user?.role === 'member'? (
              
              <button className="w-full bg-[#73E58C] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#5db972] transition-all">
                REGISTER NOW
              </button>
            ) : ( user?.role === 'eventorganizer'?(
              null
            ) : (
              <button onClick={() => navigate(`/login`)} className="w-full bg-[#D1B3E2] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#C2A2D4] transition-all">
                LOG IN NOW
              </button>
            )
            ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;