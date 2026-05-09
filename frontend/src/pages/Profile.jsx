import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user } = useAuth(); // Access user token from context
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organizer: '',
    role:'',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch profile data from the backend
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
          organizer: response.data.organizer || '',
          role: response.data.role || '',
        });
      } catch (error) {
        alert('Failed to fetch profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-3xl font-semibold text-center">Your Profile</h1>
        <div className ="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-Black-400"> Name   
            </span>
            <input
              type="text"
              placeholder="Name"
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
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
            />
        </div>
        <div className ="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-Black-400"> Phone   
            </span>
            <input
              type="text"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
            />
        </div>
        {formData.role === "eventorganizer" && (
        <div className ="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-Black-400"> Organizer   
            </span>
            <input
              type="text"
              placeholder="Organizer"
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
            />
        </div>
        )}
        <div className ="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-Black-400"> Role  
            </span>
            <input
              type="text"
              name='role'
              placeholder="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full pl-24 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              disabled
            />
        </div>

        <button type="submit" className="w-full bg-[#D1B3E2] hover:bg-[#C2A2D4] text-white py-4 rounded-2xl shadow-lg shadow-purple-100 flex justify-center items-center font-bold tracking-widest relative overflow-hidden">
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
