import { useState} from 'react';
//import axiosInstance from '../axiosConfig';
import EventForm from '../components/EventForm';
// import EventList from '../components/EventList';
//import { useAuth } from '../context/AuthContext';

const Events = () => {
  const [events, setEvents] = useState([]);



  return (
    <div className="container mx-auto p-6">
      <EventForm
        events={events}     
        setEvents={setEvents}
        editingEvent={null}
        setEditingEvent={()=>{}}
      />

    </div>
  );
};

export default Events;



