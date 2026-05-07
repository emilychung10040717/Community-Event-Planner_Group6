// export default ViewEvent;
import { useState, useEffect, useCallback } from 'react'; // import useCallback
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const ViewEvent = ({ setEditingEvent }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // use useCallback to package fetchEvents，avoid function() being rebuilt
  const fetchEvents = useCallback(async () => {
    if (!user?.token) return;
    
    try {  
      setLoading(true);
      const response = await axiosInstance.get('/api/events', {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const allEvents = response.data;
      const myEvents = allEvents.filter(event => {
      const creatorId = event.userId; 
      
      // get current user ID
      const currentUserId = user?._id || user?.id;

      // to string for comparing
      return String(creatorId) === String(currentUserId);
    });
  
  
    setEvents(myEvents);
    console.log("print myEvents", myEvents)
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.token]); // when token changes，fetchEvents will be define again

  // listen fetchEvents，avoid ESLint error
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // handle delete logic
  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure to delete this event?")) {
      try {
        await axiosInstance.delete(`/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents(prev => prev.filter((event) => event._id !== eventId));
      } catch (error) {
        alert('Failed to delete event.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8A60A1]"></div>
      </div>
    );
  }


  return (
    <div className="max-w-5xl mx-auto bg-white min-h-screen shadow-sm pb-20">
      <div className="bg-purple-100 py-3 rounded-xl mb-6 text-center">
        <h1 className="text-3xl font-light text-purple-600 tracking-wide">View event</h1>
      </div>

      <div className="px-8">
        <Link to="/create-events" className="flex items-center text-[#8A60A1] mb-6 hover:opacity-70 transition-all">
          <span className="mr-4 text-xl">+</span> Create New
        </Link>

        <section>
          <div className="mb-8">
            <h2 className="text-2xl text-gray-600 inline-block mr-2 font-medium">Published</h2>
            <span className="text-gray-300 font-light">- Activities are published on public.</span>
          </div>

          <div className="bg-gray-50 flex py-4 px-10 text-gray-400 font-medium rounded-t-2xl border-x border-t border-gray-100">
            <div className="flex-1 text-left">Event Title</div> 
            <div className="w-32 text-center">Time</div>
            <div className="w-32 text-center">Participants</div>             
            <div className="w-32 text-center">Status</div>
            <div className="w-64 text-center">Actions</div>
          </div>

          <div className="border-x border-gray-100">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event._id} className="flex items-center px-10 py-6 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 text-left text-gray-700 font-normal">{event.title}</div>  
                  
                  <div className="w-32 flex justify-center">
                      <div>{event.expStartDate ? new Date(event.expStartDate).toLocaleDateString() : 'N/A'}</div>
                  </div>
                 
                  <div className="w-32 flex justify-center">
                    <div>{event.participants?.length || 0} / {event.capacity}</div>
                  </div>
                  <div className="w-32 flex justify-center">
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#E2FDE8] text-[#73E58C]">
                      {event.status || 'Published'}
                    </span>
                  </div>
                  <div className="w-64 flex justify-center gap-3">
                    <button 
                      onClick={() => navigate(`/edit-event/${event._id}`)}
                      className="bg-[#B8D4EE] text-[#A9A9A9] px-6 py-2 rounded-xl flex-1 items-center gap-2 hover:bg-[#a5c5e4] transition-all text-sm font-medium"
                    >
                      Edit 
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="bg-[#F2B6B6] text-[#A9A9A9] px-6 py-2 rounded-xl flex-1 items-center gap-2 hover:bg-[#e89a9a] transition-all text-sm font-medium"
                    >
                      Delete 
                    </button>
                    <button
                      onClick={() => navigate(`/event-details/${event._id}`)}
                      className="bg-[#E3D8D8] text-[#A9A9A9] px-6 py-2 rounded-xl flex-1 items-center gap-2 hover:bg-[#B7A5A5] transition-all text-sm font-medium"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-gray-300 text-xl border-b border-gray-100">
                There is no event.
              </div>
            )}
          </div>
          <div className="bg-white border border-t-0 border-gray-100 py-3 flex justify-center text-gray-300 rounded-b-2xl shadow-sm"></div>
        </section>
      </div>
    </div>
  );
};

export default ViewEvent;
