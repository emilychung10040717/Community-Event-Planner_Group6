import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    password: '',
    confirmPassword: '',
    role: 'member',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!formData.role) {                        // ✅ 加這個
      alert('Please select a role.');
      return;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
    alert('Phone number must be 10 digits.');
    return;
  }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.post('/api/auth/admin/add-user', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone, 
        organization: formData.organization, 
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });
      alert('User added successfully!');
      navigate('/admin');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add user.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const roles = [
    { value: 'member', label: 'Member' },
    { value: 'eventorganizer', label: 'Event Organizer' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FE] pt-24 pb-10 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:text-[#A478C8] hover:border-purple-200 transition-all"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add User</h1>
            <p className="text-gray-500">Create a new user account</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Role Selection */}
          <div className="px-8 py-6 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Assign Role</h2>
            <div className="flex gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setFormData((prev) => ({ ...prev, role: r.value }))}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                    formData.role === r.value
                      ? 'bg-[#A478C8] border-[#A478C8] text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-400 hover:border-purple-200 hover:text-[#A478C8]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="px-8 py-6 grid grid-cols-1 gap-5">

            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter username"
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* Organizerzation */}
            {roles === "eventorganizer" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="Enter organization name"
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>
            )}
            
            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number (optional)"
                className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Set password"
                  className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={`px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-purple-200'
                  }`}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="px-8 py-5 border-t border-gray-50 flex justify-end gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#A478C8] text-white text-sm font-semibold hover:bg-[#8e62b1] transition-colors shadow-lg shadow-purple-100 disabled:opacity-60"
            >
              {saving ? 'Adding...' : '+ Add User'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddUser;