import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { useNavigate, Link, useParams } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";

// import Facade
import { useFormFacade } from '../patterns/useFormFacade';

const EventForm = ({ events, setEvents, editingEvent, setEditingEvent }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const locationOptions = {
    "Brisbane CBD": ["Art Centre", "Botanic Garden", "Queensland Museum"],
    "Sunnybank": ["Sunpac", "Sunnybank Plaza"],
    "South Bank": ["RiverSide"]
  };

  const [unavailableDatesByLocation, setUnavailableDatesByLocation] = useState({});
  
  // initiate Facade
  const { formData, setFormData, changeField } = useFormFacade(
    null, 
    unavailableDatesByLocation
  );

  // define time option (00:00 - 23:30)
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${minute}`);
    }
  }

  // 
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        capacity: editingEvent.capacity,
        organization: editingEvent.organization,
        category: editingEvent.category,
        ticketRequired: editingEvent.ticketRequired,
        ageRestriction: editingEvent.ageRestriction,
        suburb: editingEvent.suburb,
        location: editingEvent.location,
        expStartDate: editingEvent.expStartDate ? new Date(editingEvent.expStartDate) : null,
        expStartTime: editingEvent.expStartTime,
        expFinDate: editingEvent.expFinDate ? new Date(editingEvent.expFinDate) : null,
        expFinTime: editingEvent.expFinTime,
        description: editingEvent.description,
      });
    } else if (id) {
      axiosInstance.get(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      }).then(res => {
        const event = res.data;
        setFormData({
          title: event.title || '',
          capacity: event.capacity || '',
          organization: event.organization || '',
          category: event.category || '',
          ticketRequired: event.ticketRequired ?? false,
          ageRestriction: event.ageRestriction ?? false,
          suburb: event.suburb || '',
          location: event.location || '',
          expStartDate: event.expStartDate ? new Date(event.expStartDate) : null,
          expStartTime: event.expStartTime || '',
          expFinDate: event.expFinDate ? new Date(event.expFinDate) : null,
          expFinTime: event.expFinTime || '',
          description: event.description || '',
        });
      }).catch(() => alert("Could not load event details."));
    }
  }, [editingEvent, id, setFormData, user?.token]);

  // fetch the list of reserved date
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const response = await axiosInstance.get('/api/events');
        const datesByLocation = {};

        response.data.forEach((event) => {
          if (!event.expStartDate || !event.expFinDate || !event.location) return;
          const location = event.location;
          const start = new Date(event.expStartDate);
          const end = new Date(event.expFinDate);
          const dateRange = [];

          const current = new Date(start);
          while (current <= end) {
            dateRange.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
          }

          if (!datesByLocation[location]) datesByLocation[location] = [];
          datesByLocation[location].push(...dateRange);
        });

        Object.keys(datesByLocation).forEach((loc) => {
          datesByLocation[loc] = [...new Set(datesByLocation[loc])];
        });

        setUnavailableDatesByLocation(datesByLocation);
      } catch (error) {
        console.error("Failed to fetch unavailable dates:", error);
      }
    };
    fetchUnavailableDates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
        alert("Session expired. Please log in again.");
        return;
    }

    const dataToSubmit = {
        ...formData,
        userId: user._id || user.id,         
        capacity: formData.capacity,   
        ticketRequired: String(formData.ticketRequired) === "true",
        ageRestriction: String(formData.ageRestriction) === "true"   
    };

    try {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` },
            "Content-Type": "application/json" 
        };

        if (editingEvent?._id || id) {
          const eventId = editingEvent?._id || id;
          const response = await axiosInstance.put(`/api/events/${eventId}`, dataToSubmit, config);
          alert("Event Updated!");
          navigate('/view-events');
          if(setEvents && events) {
            setEvents(events.map((event) => (event._id === response.data._id ? response.data : event)));
          }
        } else {  
            const response = await axiosInstance.post('/api/events', dataToSubmit, config);
            alert("Event added!");
            navigate('/view-events');
            if(setEvents && events) {
              setEvents([...events, response.data]); 
            }
        }
        setEditingEvent(null);
    } catch (error) {
        alert(`Failed to save event: ${error.response?.data?.message || error.message}`);
    }
  };

  const selectClass = "w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239F7AEA%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]";

  return (
    <form onSubmit={handleSubmit} className="max-w-8xl mx-auto bg-white p-10 rounded-[3rem] shadow-sm mb-6 border border-gray-100">
      <div className="bg-purple-100 py-3 rounded-xl mb-6 text-center">
        <h1 className="text-3xl font-light text-purple-600 tracking-wide">{id ? 'Edit Event' : 'Create Event'}</h1>
      </div>

      <Link to="/view-events" className="flex items-center text-purple-400 mb-8 hover:text-purple-600 transition-colors">
        <span className="mr-2">←</span> View Event
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-gray-700 font-medium">Event Title<span className="text-red-400">*</span></label>
          <input
            id="title"
            type="text"
            placeholder="Enter title"
            value={formData.title}
            onChange={(e) => changeField('title', e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="capacity" className="block text-gray-700 font-medium">Capacity<span className="text-red-400">*</span></label>
          <input
            id="capacity"
            type="number"
            min="1"
            placeholder="e.g.: 100"
            value={formData.capacity}
            onChange={(e) => changeField('capacity', e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="organization" className="block text-gray-700 font-medium">Organization<span className="text-red-400">*</span></label>
          <input
            id="organization"
            type="text"
            value={formData.organization}
            placeholder="Enter organization"
            onChange={(e) => changeField('organization', e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="category" className="block text-gray-700 font-medium ml-1">Category<span className="text-red-400">*</span></label>
          <select className={selectClass} value={formData.category} onChange={(e) => changeField('category', e.target.value)}>
            <option value="">Select</option>
            <option value="Community">Community</option>
            <option value="Education">Education</option> 
            <option value="Health">Health</option>            
            <option value="Market">Market</option>
            <option value="Religion">Religion</option>
            <option value="Talk">Talk</option>
            <option value="Workshop">Workshop</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 font-medium ml-1">Ticket Required<span className="text-red-400">*</span></label>
          <select className={selectClass} value={String(formData.ticketRequired)} onChange={(e) => changeField('ticketRequired', e.target.value === "true")}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 font-medium ml-1">Age Restriction<span className="text-red-400">*</span></label>
          <select className={selectClass} value={String(formData.ageRestriction)} onChange={(e) => changeField('ageRestriction', e.target.value === "true")}>
            <option value="false">No</option>
            <option value="true">18+</option>
          </select>   
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="suburb" className="block text-gray-700 font-medium ml-1">Suburb<span className="text-red-400">*</span></label>
          <select className={selectClass} value={formData.suburb} onChange={(e) => changeField('suburb', e.target.value)}>
            <option value="">Select</option>
            <option value="Brisbane CBD">Brisbane CBD</option>
            <option value="Sunnybank">Sunnybank</option>
            <option value="South Bank">South Bank</option>
          </select>
        </div>
       
        <div className="space-y-2">
          <label htmlFor="location" className="block text-gray-700 font-medium ml-1">Location</label>
          <select className={selectClass} value={formData.location} onChange={(e) => changeField('location', e.target.value)}>
            <option value="">Select</option>
            {(locationOptions[formData.suburb] || []).map((loc) => (
              <option key={loc} value={loc}>{loc}</option>  
            ))}
          </select>
        </div>
      </div>

      {/* Start Date and Time (apply Facade)*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="expStartDate" className="block text-gray-700 font-medium ml-1">Expected Start Date<span className="text-red-400">*</span></label>
          <input
            id="expStartDate"
            type="date"
            value={formData.expStartDate ? new Date(formData.expStartDate).toISOString().split('T')[0] : ''}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => changeField('expStartDate', e.target.value)} 
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expStartTime" className="block text-gray-700 font-medium ml-1">Expected Start Time<span className="text-red-400">*</span></label>
          <select id="expStartTime" value={formData.expStartTime} onChange={(e) => changeField('expStartTime', e.target.value)} className="w-full p-4 border border-gray-200 rounded-2xl bg-white cursor-pointer">
            <option value="" disabled>Select a time</option>
            {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
        </div>
      </div>

      {/* Finish Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="expFinDate" className="block text-gray-700 font-medium ml-1">Expected Finish Date <span className="text-red-400">*</span></label>
          <input
            id="expFinDate"
            type="date"
            value={formData.expFinDate ? new Date(formData.expFinDate).toISOString().split('T')[0] : ''}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => changeField('expFinDate', e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="expFinTime" className="block text-gray-700 font-medium ml-1">Expected Finish Time<span className="text-red-400">*</span></label>
          <select id="expFinTime" value={formData.expFinTime} onChange={(e) => changeField('expFinTime', e.target.value)} className="w-full p-4 border border-gray-200 rounded-2xl bg-white cursor-pointer">
            <option value="" disabled>Select a time</option>
            {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="description" className="block text-gray-700 font-medium ml-1">Description</label>
          <textarea
            id="description"
            rows={4}
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) => changeField('description', e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-2xl placeholder-gray-300 resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-10 text-gray-400 font-light">
        <input type="checkbox" className="w-6 h-6 rounded-full accent-purple-500" required />
        <p>I confirm all details are correct before I submit it!</p>
      </div>
      
      <div className="flex justify-center">
        <button type="submit" className="w-full bg-[#D1B3E2] hover:bg-[#C2A2D4] text-white py-4 rounded-2xl shadow-lg font-bold tracking-widest text-xl">
         {id ? 'Update Event ✨' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;