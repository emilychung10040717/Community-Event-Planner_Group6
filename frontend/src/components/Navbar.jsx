import { useState } from 'react'; // 加入 state 來控制手機版選單
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // controly overlay

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  //function for turn-on * turn-off menu
  const toggleNav = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Full-screen overlay menu for mobile */}
      <div className={`fixed inset-0 bg-black bg-opacity-90 z-50 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <button className="absolute top-5 right-10 text-6xl text-white" onClick={toggleNav}>&times;</button>
        <div className="flex flex-col items-center justify-center h-full space-y-8 text-white text-3xl">
          
          {user?
          (
            <>
            <Link to ="/" onClick={toggleNav}>Home</Link>
            <Link to="/profile" onClick={toggleNav}>Profile</Link>
            {user.role === 'eventorganizer' && (
                <>
                <Link to="/create-events" onClick={toggleNav}>New Event</Link>
                <Link to="/view-events" onClick={toggleNav}>Event List</Link>
                </>
            )}

            </>
          ): (
            <>
              <Link to="/login" onClick={toggleNav}>Login</Link>
              <Link to="/register" onClick={toggleNav}>Register</Link>
              
            </>
          )
          }

        </div>
      </div>

      <nav className="bg-[#7D5A94] text-white p-4 flex justify-between items-center relative z-10">
        <div className="flex items-center">
          {/*Hamburger */}
          <button onClick={toggleNav} className="mr-4 text-2xl md:hidden">☰</button>
          <Link to="/" className="text-2xl font-bold">
            Community Event Planner
          </Link>
        </div>

        <div className="flex items-center">
          {user ? (
            <>
              <Link to ="/" className="mr-4 hover:text-purple-200">Home</Link>
              <Link to="/profile" className="mr-4 hover:text-purple-200">Profile</Link>
              
              {/* only organizer can see function: New & List */}
              {user.role === 'eventorganizer' && (
                <>
                  <Link to="/create-events" className="mr-4 hover:text-purple-200">New Event</Link>
                  <Link to="/view-events" className="mr-4 hover:text-purple-200">List</Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-400 px-4 py-2 rounded-2xl hover:bg-red-600 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4 hover:text-purple-200">Login</Link>
              <Link
                to="/register"
                className="bg-blue-400 px-4 py-2 rounded-2xl hover:bg-blue-600 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;