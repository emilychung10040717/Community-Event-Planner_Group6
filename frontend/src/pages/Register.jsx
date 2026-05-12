import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { Eye, EyeOff } from 'lucide-react';


const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', organization: '', password: '', confirmPassword: '', role: ''});
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // check if chhoose the role
    if (!formData.role) {
    alert("Please select your login role (Member or Organizer).");
    return;
  }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match, please enter again!");
      return;
    }

  
    try {
      await axiosInstance.post('/api/auth/register', formData);
      alert('Registration successful. Please log in.');
      navigate('/login');
    }  catch (error) {
      // check the message from backend
      if (error.response && error.response.data && error.response.data.message) {
          // prompt: "User already exists"
          alert(error.response.data.message); 
      } else {
          // If there is no response from backend
          alert('An unexpected error occurred.');
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
      <h1 className="text-3xl font-semibold text-gray-800">REGISTER</h1>

      {/* rightside title */}
      <div className="flex flex-col items-start space-y-2">
        
        {/* Role：Member */}
        <div >  {/*visualization for disabled status*/}  {/*className="opacity-50 cursor-not-allowed"*/}
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="role"
              className="w-4 h-4 accent-purple-400"
              value="member"
              checked = {formData.role === "member"}
              onChange={handleChange} 
              //disabled                               // disable the functionality
            />
            <span className="text-gray-400 text-sm font-light leading-none">
              I'm a community member <br/>
              {/*<span className="text-xs text-red-300">[Not available now]</span>*/}
            </span>
          </label>
        </div>

        {/* Role：Organizer */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="role"
              className="w-4 h-4 accent-purple-400"
              value = "eventorganizer"
              checked = {formData.role === "eventorganizer"}
              onChange={handleChange} 
            />
            <span className="text-gray-400 text-sm font-light leading-none">
              I'm an event organizer
            </span>
          </label>
        </div>
      </div>
    </div>
      {/*make a form for registration*/}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className ="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-Black-400"> Name   
            </span>
          <input
            type="text"
            name="name" // connection for handle change
            placeholder="Enter your First Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>
        <div className ="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-Black-400"> Email   
          </span>

        <input
          type="email"
          name="email" // connection for handle change
          placeholder="Enter your E-mail"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
        />
        </div>
        <div className ="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-Black-400"> Phone 
          </span>
        <input
          type="tel"
          name="phone" // connection for handle change
          pattern="[0-9]{10}"
          placeholder="0412111111"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
        />
        </div> 
        {formData.role === 'eventorganizer' && ( 
          <div className ="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-Black-400">Organization  
            </span>
          <input
            type="text"
            name="Organization" // connection for handle change
            placeholder="Organization you belong"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            className="w-full pl-32 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
          </div>
        )}
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-black-400">Password</span>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center text-black-400">Confirm Password</span>
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="Enter your password again"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full pl-40 pr-12 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-gray-500"
          >
            {showConfirm ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
        <button 
          type="submit"
          className="w-full bg-[#D1B3E2] hover:bg-[#C2A2D4] text-white py-4 rounded-2xl shadow-lg shadow-purple-100 flex justify-center items-center font-bold tracking-widest relative overflow-hidden"
        >
          Register
          <span className="absolute right-4 bg-[#7D5A94] rounded-full p-1 w-8 h-8 flex items-center justify-center">
            →
          </span>
        </button>
      </form>
      <Link to='/Login'>
        <p className="mt-8 text-center text-gray-600">
        Already have an account? <span className="text-purple-300 cursor-pointer hover:underline">Log in</span>
        </p>
      </Link>
    </div>
  );
};

export default Register;
