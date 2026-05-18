import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

// ── Strategy Pattern ──────────────────────────────────────────

const createNavigationStrategies = (navigate) => ({
  eventorganizer: () => navigate("/"),
  member:          () => navigate("/"),
  admin:           () => navigate("/admin"),
});
 
// Context
const executeNavigationStrategy = (navigate, role) => {
  const strategies = createNavigationStrategies(navigate);
  const strategy = strategies[role] ?? (() => navigate("/"));
  strategy();
};
// ─────────────────────────────────────────────────────────────



const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: ''});   
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


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
    
    // Strategy Pattern
      executeNavigationStrategy(navigate, userData.role);
    
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
            name="email"
            placeholder="abc@email.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
          </div>
        
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-black-400">Password</span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-24 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-gray-500"
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        

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
