import { useState, useEffect} from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { useNavigate,Link } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from 'react-router-dom';



const EventForm = ({ events, setEvents, editingEvent, setEditingEvent }) => {

  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', capacity: '', organization : '', category: '', ticketRequired : '', ageRestriction : '', 
        suburb : '', location : '', expStartDate : null, expStartTime : '', expFinDate : '', expFinTime : '', description: '', image: ''});
  const navigate = useNavigate();
  const { id } = useParams();
  const locationOptions={
    "Brisbane CBD": ["Art Centre", "Botanic Garden", "Queensland Museum"],
    "Sunnybank": ["Sunpac", "Sunnybank Plaza"],
    "South Bank": ["RiverSide"]
  };

  const [unavailableDatesByLocation, setUnavailableDatesByLocation, unavailableFinDate] = useState({});
  
  {/* Define options of time: from 00:00 to 23:30 */}
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${minute}`);
    }
  }
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        capacity: editingEvent.capacity,
        organization : editingEvent.organization,
        category :editingEvent.category,
        ticketRequired : editingEvent.ticketRequired,
        ageRestriction : editingEvent.ageRestriction,
        suburb : editingEvent.suburb,
        location : editingEvent.location,
        expStartDate : editingEvent.expStartDate? new Date(editingEvent.expStartDate) : null,
        expStartTime : editingEvent.expStartTime,
        expFinDate : editingEvent.expFinDate? new Date(editingEvent.expFinDate) : null,
        expFinTime : editingEvent.expFinTime,
        description: editingEvent.description,
        //image: editingEvent.image,
      });
     
      //result to default
    } else {
      setFormData({ 
        title: '', capacity: '', organization : '', category: '', ticketRequired : '', ageRestriction : '', 
        suburb : '', location : '', expStartDate : null, expStartTime : '', expFinDate : '', expFinTime : '', description: '' 
      });
    }
 

  }, [editingEvent]);

  useEffect(() => {
    if (id) {
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
  }, [id]);  





  //update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
//
    if (!user || !user.token) {
        alert("Session expired. Please log in again.");
        return;
    }

    //
    console.log("Preparing to submit data:", formData);
    // 

    console.log("Current user object:", user);
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
        console.log('--- Login information of logged-in user ---');
        console.log('User from database (user):', user._id ? 'Found' : 'Not found', user._id);

        if (editingEvent?._id || id) {
          const eventId = editingEvent?._id || id;
          const response = await axiosInstance.put(`/api/events/${eventId}`, dataToSubmit, config);
          alert("Event Updated!");
          navigate('/view-events'); // 加這行，edit by id 後要導回列表
          setEvents(events.map((event) => (event._id === response.data._id ? response.data : event)));
                
        } else {  
            
            console.log('--- [Debug] Create Event Step ---');
            console.log('1. User ID from state:', user?._id || user?.id); 
            console.log('2. Data to be sent to Backend:', dataToSubmit);
            
            // 
            if (!dataToSubmit.userId) {
                console.error('❌ Error: userId is empty! The backend might reject this request.');
            }

            // 
            const response = await axiosInstance.post('/api/events', dataToSubmit, config);
            
            console.log('3. Backend Response:', response.data); 
            alert("Event added!");
            navigate('/view-events');
            // 
            setEvents([...events, response.data]); 
        }

        //
        setEditingEvent(null);
        setFormData({ title: '', capacity: '', organization : '', category: '', ticketRequired : '', ageRestriction : '', 
        suburb : '', location : '', expStartDate : null, expStartTime : '', expFinDate : '', expFinTime : '', description: '', image: ''  });

    } catch (error) {
// 
        const errorMsg = error.response?.data?.message || error.message || "Unknown error";
        console.error("Submission Failed:", errorMsg);
        alert(`Failed to save event: ${errorMsg}`);
    }
};

  /*Delete the reserved date*/
  useEffect(() => {
  const fetchUnavailableDates = async () => {
    try {
      const response = await axiosInstance.get('/api/events');

      // collect all the unavailable dates by different locations
      const datesByLocation = {};

      response.data.forEach((event) => {
        if (!event.expStartDate || !event.expFinDate || !event.location) return;

        const location = event.location;
        const start = new Date(event.expStartDate);
        const end = new Date(event.expFinDate);
        const dateRange = [];

        // generate the all dates between expStartDate and expFinDate
        const current = new Date(start);
        while (current <= end) {
          dateRange.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }

        // Store the date corresponding to the specific location
        if (!datesByLocation[location]) {
          datesByLocation[location] = [];
        }
        datesByLocation[location].push(...dateRange);
      });

      // Remove the duplicated date in each event
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


  const selectClass = "w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%239F7AEA%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]";
  return (
    <form onSubmit={handleSubmit} className="max-w-8xl mx-auto bg-white p-10 rounded-[3rem] shadow-sm mb-6 border border-gray-100">
      <div className="bg-purple-100 py-3 rounded-xl mb-6 text-center">
        <h1 className="text-3xl font-light text-purple-600 tracking-wide">{id ? 'Edit Event' : 'Create Event'}</h1>
      </div>
      {/* button for return back*/}
      <Link 
        to="/view-events"
        className="flex items-center text-purple-400 mb-8 hover:text-purple-600 transition-colors">
        <span className="mr-2">←</span> View Event
      </Link>

      {/* first row for title/capacity/organizzer */}
      <div className="grid grid-cols-1 grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-gray-700 font-medium">Event Title<span className="text-red-400">*</span></label>
          <input
            id="title"
            type="text"
            placeholder="Enter title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="capacity" className="block text-gray-700 font-medium">Capacity<span className="text-red-400">*</span></label>
          <input
            id="capacity"
            type="number"
            min="1"
            placeholder="Enter the maximum number of participants, e.g.: 100"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="organization" className="block text-gray-700 font-medium">Organization<span className="text-red-400">*</span></label>
          <input
            id="organization"
            type="text"
            value={formData.organization}
            placeholder="Enter the organization of the event"
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
          />
        </div>
      </div>

      {/* second row for category/ticketrequired/age */}
      <div className="grid grid-cols-1 grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="category" className="block text-gray-700 font-medium ml-1">Category<span className="text-red-400">*</span></label>
          <select
            className={selectClass}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option>Select</option>
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
          <label htmlFor="ageRestriction" className="block text-gray-700 font-medium ml-1">Ticket Required<span className="text-red-400">*</span></label>
          <select 
            className={selectClass}
            value={String(formData.ticketRequired)}
            onChange={(e) => setFormData({ ...formData, ticketRequired: e.target.value === "true"})}
          >
            <option>Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="ageRestriction" className="block text-gray-700 font-medium ml-1">Age Restriction<span className="text-red-400">*</span></label>
          <select 
            className={selectClass}
            value={String(formData.ageRestriction)}
            onChange={(e) => setFormData({ ...formData, ageRestriction: e.target.value === "true" })}
          >
            <option>Select</option>
            <option value="true">18+</option>
            <option value="false">No</option>
          </select>   
        </div>
      </div>

      {/* row 3 for suburb and location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="suburb" className="block text-gray-700 font-medium ml-1">Suburb<span className="text-red-400">*</span></label>
          <select 
            className={selectClass}
            value={formData.suburb}
            onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
          >
            <option>Select</option>
            <option value="Brisbane CBD">Brisbane CBD</option>
            <option value="Sunnybank">Sunnybank</option>
            <option value="South Bank">South Bank</option>
          </select>
        </div>
       
        <div className="space-y-2">
          <label htmlFor="location" className="block text-gray-700 font-medium ml-1">Location</label>
          <select 
            className={selectClass}
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value})}
          >
            <option value="">Select</option>

            {(locationOptions[formData.suburb]|| []).map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>  
            ))}
          </select>
        </div>
      </div>

      {/* row 4 start date & time*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="expStartDate" className="block text-gray-700 font-medium ml-1">Expected Start Date<span className="text-red-400">*</span></label>
        <input
          id="expStartDate"
          type="date"
          dateFormat="dd-MM-yyyy"
          value={formData.expStartDate
            ? new Date(formData.expStartDate).toISOString().split('T')[0]
            : ''}
          min={new Date().toISOString().split('T')[0]} // Disappear the past date
          onChange={(e) => {
            const selected = e.target.value;
            const currentLocation = formData.location;

            // Save the unavailable date
            const blockedDates = unavailableDatesByLocation[currentLocation] || [];

            if (blockedDates.includes(selected)) {
              alert(`${selected} is already booked at ${currentLocation}. Please choose another date.`);
              setFormData({ ...formData, expStartDate: null });
              return;
            }  if (formData.expStartDate && new Date(selected) > new Date(formData.expFinDate)) {
              alert(`Start Date should be before the Finished Date. Please choose another date.`);
              setFormData({ ...formData, expStartDate: null });
              return;
            } else {
              setFormData({ ...formData, expStartDate: new Date(selected) });
            }

          }}
          className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100"
        />

        
        </div>

        <div className="space-y-2">
        <label htmlFor="expStartTime" className="block text-gray-700 font-medium ml-1">
          Expected Start Time<span className="text-red-400">*</span>
        </label>
        <select
          id="expStartTime"
          value={formData.expStartTime}
          onChange={(e) => {
            const selectedTime = e.target.value;
            const {expStartDate, expFinDate, expFinTime} = formData;

            //change time string into minutes
            const timeToMinutes = (timeStr) =>{
              if (!timeStr) return 0;
              const [hours,minutes] = timeStr.split(':').map(Number);
              return hours*60 + minutes;
            };

            // check if it's the same date
            const isSameDay = expStartDate && expFinDate && new Date(expStartDate).toDateString() === new Date(expFinDate).toDateString()

            //
            if (isSameDay && expFinTime){
              if (timeToMinutes(selectedTime) >= timeToMinutes(expFinTime)){
                alert ("The Start Time should be earlier than the Finish Time, please choose another time")
                setFormData({...formData, expStartTime:""});
                return;
              }
            }
            setFormData({ ...formData, expStartTime: selectedTime });
          }}
          className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white appearance-none cursor-pointer"
        >
          <option value="" disabled>Select a time</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        </div>
      </div>

      {/* row 5 finish date & time*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="expFinDate" className="block text-gray-700 font-medium ml-1">Expected Finish Date <span className="text-red-400">*</span></label>
          <input
            id="expFinDate"
            type="date"
            dateFormat="dd-MM-yyyy"
            value={formData.expFinDate
            ? new Date(formData.expFinDate).toISOString().split('T')[0]
            : ''}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              const selected = e.target.value;
              const currentLocation = formData.location;

              const blockedDates = unavailableDatesByLocation[currentLocation] || [];

              if (blockedDates.includes(selected)) {
                alert(`${selected} is already booked at ${currentLocation}. Please choose another date.`);
                setFormData({ ...formData, expFinDate: null });
              } if (formData.expFinDate && new Date(selected) < new Date(formData.expStartDate)) {
                alert(`Finish Date should be after the Start Date. Please choose another date.`);
                setFormData({ ...formData, expFinDate: null });
                return;
              } else {
                setFormData({ ...formData, expFinDate: selected });
              }
            }}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
          />
        </div>
        <div className="space-y-2">
        <label htmlFor="expFinTime" className="block text-gray-700 font-medium ml-1">
          Expected Finish Time<span className="text-red-400">*</span>
        </label>
        <select
          id="expFinTime"
          value={formData.expFinTime}
          onChange={(e) => {
            const selectedTime = e.target.value;
            const {expStartDate, expFinDate, expStartTime} = formData;

            //change time string into minutes
            const timeToMinutes = (timeStr) =>{
              if (!timeStr) return 0;
              const [hours,minutes] = timeStr.split(':').map(Number);
              return hours*60 + minutes;
            };

            // check if it's the same date
            const isSameDay = expStartDate && expFinDate && new Date(expStartDate).toDateString() === new Date(expFinDate).toDateString()

            //
            if (isSameDay && expStartTime){
              if (timeToMinutes(selectedTime) <= timeToMinutes(expStartTime)){
                alert ("The Finish Time should be later than the Start Time, please choose another time")
                setFormData({...formData, expFinTime:""});
                return;
              }
            }
            setFormData({ ...formData, expFinTime: selectedTime });
          }}
          className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 bg-white appearance-none cursor-pointer"
        >
          <option value="" disabled>Select a time</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        </div>
      </div>


      {/* row 6 for description and image*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="description" className="block text-gray-700 font-medium ml-1">Description</label>
          <textarea
            id="description"
            rows={4}
            placeholder="Enter more description for the event"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300 resize-none"
          />
        </div>
      </div>

      {/*check column*/}
      <div className="flex items-center justify-center gap-3 mb-10 text-gray-400 font-light">
        <input type="checkbox" className="w-6 h-6 rounded-full border-gray-300 accent-purple-500" required />
        <p>I confirm all details are correct before I submit it!</p>
      </div>
      
      {/*submit button*/}
      <div className="flex justify-center">
        <button type="submit" className="w-full bg-[#D1B3E2] hover:bg-[#C2A2D4] text-white py-4 rounded-2xl shadow-lg shadow-purple-100 flex justify-center items-center font-bold tracking-widest relative overflow-hidden text-xl">
         {id ? 'Update Event ✨' : 'Create Event'}
        </button>
      </div>
    </form>
  );
  
};


export default EventForm;

