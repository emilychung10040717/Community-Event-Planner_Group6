import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';      //update
import CreateEvents from './pages/CreateEvents';
import ViewEvent from './pages/ViewEvent';
import EditEvent from './components/EditEvent';
import EventDetails from "./pages/EventDetails";    //TBC
import BrowseEvent from "./pages/BrowseEvent";    //TBC
import Admin from "./pages/Admin";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-events" element={<CreateEvents />} />
        <Route path="/view-events" element={<ViewEvent/>} />
        <Route path="/edit-event/:id" element={<EditEvent />} />
        <Route path="/event-details/:id" element={<EventDetails />} />   {/*TBC*/}
        <Route path="/" element={<BrowseEvent />} />     {/*TBC*/}  
        <Route path="/admin" element={<Admin/>} />
      </Routes>
    </Router>
  );
}

export default App;
