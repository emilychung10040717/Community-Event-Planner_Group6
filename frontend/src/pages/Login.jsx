import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {Link, useNavigate } from 'react-router-dom';



const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role:'' });   
  const { login } = useAuth();
  const navigate = useNavigate();

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const userData = await login(formData);
    
    //  (Strategy Pattern)
    const roleRoutes = {
      "eventorganizer": "/",
      "member": "/",
      "admin": "/admin" 

    };
    navigate(roleRoutes[userData.role] || "/");

  } catch (err) {
    
    switch (err.message) {
      case "GMAIL_NOT_FOUND or INVALID_PASSWORD":
        alert("Email or Password is incorrect. Please check it again.");
        break;
      default:
        alert("Login failed. Please try again.");
    }
  }
};
  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="flex justify-center mb-10">
        <div className="text-[#D1B3E2] text-3xl">Community Event Planner</div> 
      </div>

<div className="flex items-center justify-between mb-8">
  {/* leftside title */}
  <h1 className="text-3xl font-semibold text-gray-800">Log in</h1>

</div>
 
     
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className ="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-Black-400"> Email   
          </span>
          <input
            type="email"
            placeholder="abc@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
          </div>
        
        <div className ="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-Black-400"> Password   
          </span>
          <input
            type="password"
            placeholder="Your Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>
        
        {/* forget passwoord */}
        {/* <div className="text-right">
          <a href="#" className="text-sm text-gray-600 hover:underline">Forgot Password?</a>
        </div> */}

        {/*<div className="text-left">
          <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="userType"
            className="w-4 h-4 accent-purple-400"
            //disabled           // diable for the functionality
          />
          <span className="text-gray-400 text-sm font-light leading-none">
            I'm ADMIN <br/>
          </span>
          </label>
        </div>*/}

        {/* Login Button*/}
        <button
          type="submit"
          className="w-full bg-[#D1B3E2] hover:bg-[#C2A2D4] text-white py-4 rounded-2xl shadow-lg shadow-purple-100 flex justify-center items-center font-bold tracking-widest relative overflow-hidden"
        >
          LOG IN
          <span className="absolute right-4 bg-[#7D5A94] rounded-full p-1 w-8 h-8 flex items-center justify-center">
            →
          </span>
        </button>
      </form>
      <Link to='/Register'>
        <p className="mt-8 text-center text-gray-600">
        Don't have an account? <span className="text-purple-300 cursor-pointer hover:underline">Register</span>
        </p>
      </Link>
    </div>
  );
};

export default Login;
