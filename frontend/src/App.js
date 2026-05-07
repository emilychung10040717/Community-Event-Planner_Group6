import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';      
import CreateEvents from './pages/CreateEvents';
import ViewEvent from './pages/ViewEvent';
import EditEvent from './components/EditEvent';
import EventDetails from "./pages/EventDetails";    
import BrowseEvent from "./pages/BrowseEvent";    
import Admin from "./pages/Admin";
import AddUser from "./pages/AddUser";

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
        <Route path="/admin/add-user" element={<AddUser/>} />
      </Routes>
    </Router>
  );
}

export default App;
