import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const EditEvent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  

  const [formData, setFormData] = useState({
    title: '', capacity: '', organizer: '', category: '', 
    ticketRequired: false, ageRestriction: false, suburb: '', 
    location: '', expStartDate: '', expStartTime: '', 
    expFinDate: '', expFinTime: '', description: ''
  });
  const [loading, setLoading] = useState(true);

  // Transfer date format into HTML
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  useEffect(() => {
    const fetchSingleEvent = async () => {
      try {
        const response = await axiosInstance.get(`/api/events/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const event = response.data;
        
        setFormData({
          title: event.title || '',
          capacity: event.capacity || '',
          organizer: event.organizer || '',
          category: event.category || '',
          ticketRequired: event.ticketRequired ?? false,
          ageRestriction: event.ageRestriction ?? false,
          suburb: event.suburb || '',
          location: event.location || '',
          expStartDate: formatDate(event.expStartDate),
          expStartTime: event.expStartTime || '',
          expFinDate: formatDate(event.expFinDate),
          expFinTime: event.expFinTime || '',
          description: event.description || '',
        });

        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        alert("Could not load event details.");
        setLoading(false);
      }
    };

    if (id && user?.token) fetchSingleEvent();
  }, [id, user]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity), // string → number
        ticketRequired: formData.ticketRequired === 'Yes', // string → boolean
        ageRestriction: formData.ageRestriction === '18+', // string → boolean
        expStartDate: new Date(formData.expStartDate), // string → Date
        expFinDate: new Date(formData.expFinDate)      // string → Date
      };

      await axiosInstance.put(`/api/events/${id}`, payload, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      alert("Update Successful! ✨");
      navigate('/view-events'); 
    } catch (error) {
      console.error(error);
      alert("Update Failed.");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen italic text-[#8A60A1]">
      Loading event data...
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-8xl mx-auto bg-white p-10 rounded-[3rem] shadow-sm mb-6 border border-gray-100">
      <div className="bg-purple-100 py-3 rounded-xl mb-6 text-center">
        <h1 className="text-3xl font-light text-purple-600 tracking-wide">Edit event</h1>
      </div>


        <Link to="/view-events" className="flex items-center text-[#8A60A1] mb-6 hover:opacity-70 transition-all">
          <span className="mr-2 text-xl">←</span> View Event List
        </Link>

 
          
            
             {/* first row for title/capacity/organizzer */}
            <div className="grid grid-cols-1 grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                <label htmlFor="title" className="block text-gray-700 font-medium">Event Title</label>
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
                <label htmlFor="capacity" className="block text-gray-700 font-medium">Capacity</label>
                <input
                    id="capacity"
                    type="number"
                    placeholder="Enter the maximum number of participants, e.g.: 100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                />
                </div>

                <div className="space-y-2">
                <label htmlFor="organizer" className="block text-gray-700 font-medium">Organizer</label>
                <input
                    id="organizer"
                    type="text"
                    value={formData.organizer}
                    placeholder="Enter the organizer of the event"
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                />
                </div>
            </div>

            {/* second row for category/ticketrequired/age */}
            <div className="grid grid-cols-1 grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-gray-700 font-medium ml-1">Category</label>
                <select
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
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
                <label htmlFor="ageRestriction" className="block text-gray-700 font-medium ml-1">Ticket Required</label>
                <select 
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                    value={formData.ticketRequired ? 'Yes' : 'No'}
                    onChange={(e) => setFormData({ ...formData, ticketRequired: e.target.value})}
                >
                    <option>Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
                </div>

                <div className="space-y-2">
                <label htmlFor="ageRestriction" className="block text-gray-700 font-medium ml-1">Age Restriction</label>
                <select 
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                    value={formData.ageRestriction ? '18+' : 'No'}
                    onChange={(e) => setFormData({ ...formData, ageRestriction: e.target.value })}
                >
                    <option>Select</option>
                    <option value="18+">18+</option>
                    <option value="No">No</option>
                </select>   
                </div>
            </div>

            {/* row 3 for suburb and location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
                <div className="space-y-2">
                <label htmlFor="suburb" className="block text-gray-700 font-medium ml-1">Suburb</label>
                <select 
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
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
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                    <option>Select</option>
                    <option value="Art Centre">Art Centre</option>
                    <option value="Botanic Garden">Botanic Garden</option>
                    <option value="Queensland Museum">Queensland Museum</option>
                </select>
                </div>
            </div>

            {/* row 4 start date & time*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
                <div className="space-y-2">
                <label htmlFor="expStartDate" className="block text-gray-700 font-medium ml-1">Expected Start Date</label>
                <input
                    id="expStartDate"
                    type="date"
                    value={formData.expStartDate}
                    onChange={(e) => setFormData({ ...formData, expStartDate: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                />
                </div>

                <div className="space-y-2">
                <label htmlFor="expStartTime" className="block text-gray-700 font-medium ml-1">Expected Start Time</label>
                <input
                    id="expStartTime"
                    type="time"
                    value={formData.expStartTime}
                    onChange={(e) => setFormData({ ...formData, expStartTime: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                />
                </div>
            </div>

            {/* row 5 finish date & time*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
                <div className="space-y-2">
                <label htmlFor="expFinDate" className="block text-gray-700 font-medium ml-1">Expected Finish Date</label>
                <input
                    id="expFinDate"
                    type="date"
                    value={formData.expFinDate}
                    onChange={(e) => setFormData({ ...formData, expFinDate: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                />
                </div>

                <div className="space-y-2">
                <label htmlFor="expFinTime" className="block text-gray-700 font-medium ml-1">Expected Finish Time</label>
                <input
                    id="expFinTime"
                    type="time"
                    value={formData.expFinTime}
                    onChange={(e) => setFormData({ ...formData, expFinTime: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                />
                </div>
            </div>

            {/* row 6 for description and image*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-6 mb-8">
                <div className="space-y-2">
                <label htmlFor="description" className="block text-gray-700 font-medium ml-1">Description</label>
                <input
                    id="description"
                    type="text"
                    placeholder="Enter mroe description for the event"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                />
                </div>

              {/*  function for upload image (need to be fixed later)*/}
                {/* <div className="space-y-2">
                <label htmlFor="image" className="block text-gray-700 font-medium ml-1">Upload Image</label>
                <input
                    id="image"
                    type="file"
                    //ref={fileInputRef}
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder-gray-300"
                />
                </div> */}
            </div>


            {/* Submit Button */}
            <div className="flex justify-center pt-10">
              <button 
                type="submit" 
                className="w-full bg-[#D1B3E2] hover:bg-[#C2A2D4] text-white py-4 rounded-2xl shadow-lg font-bold tracking-widest text-xl transition-all"
              >
                Update Event ✨
              </button>
            </div>

    </form>
  );
};

export default EditEvent;