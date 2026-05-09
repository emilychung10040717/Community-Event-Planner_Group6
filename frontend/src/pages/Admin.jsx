import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all'); //Record the tag of selected role
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);       
  const [editForm, setEditForm] = useState({});           
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 點鉛筆：展開 or 收起
  const handleEditToggle = (user) => {
    if (editingId === user._id) {
      // 再按一次收起
      setEditingId(null);
      setEditForm({});
    } else {
      const latestUser = users.find(u => u._id === user._id) || user;
      setEditingId(latestUser._id);
      setEditForm({
        username: latestUser.username || latestUser.name || '',
        email: latestUser.email || '',
        role: latestUser.role || 'member',
        organizer: latestUser.organizer || '',  // 
        phone: latestUser.phone || '',          // 
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 儲存修改
  const handleSave = async (userId) => {
    setSaving(true);
    try {
      await axiosInstance.put(`/api/auth/admin/users/${userId}`, editForm);
      await fetchUsers(); // ✅ 加 await，確保 users 更新完才繼續
      alert('Updated successfully!');
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      alert('Update failed');
    } finally {
      setSaving(false);
    }
  };

  // 刪除
  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/api/auth/admin/users/${userId}`);
        alert('Delete Successfully!!');
        fetchUsers();
      } catch (error) {
        alert('Delete failed');
      }
    }
  };
  
  if (loading) return <div className="p-10 text-center">Loading Admin Panel...</div>;

  // set the filter before render
  const filteredUsers = users.filter(user => {
  if (filterRole === 'all') return true;
  return user.role === filterRole;
});


  return (
    
    <div className="min-h-screen bg-[#F8F9FE] pt-24 pb-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Hi Admin!</h1>
            <p className="text-gray-500">Welcome back to your panel</p>
          </div>
          <div className="flex gap-4">
            <div 
              onClick={() => setFilterRole('all')}
              className={`w-20 h-20 border-4 rounded-full flex flex-col items-center justify-center text-[10px] text-center font-bold cursor-pointer transition-all shadow-sm
                ${filterRole === 'all' ? 'border-purple-500 bg-purple-50 scale-110' : 'border-purple-200 bg-white text-purple-300'}`}
            >
              <span>{users.length}</span>
              <span>All Users</span>
            </div>
            <div 
              onClick={() => setFilterRole('member')}
              className={`w-20 h-20 border-4 rounded-full flex flex-col items-center justify-center text-[10px] text-center font-bold cursor-pointer transition-all shadow-sm
                ${filterRole === 'member' ? 'border-[#A478C8] bg-purple-50 scale-110' : 'border-purple-100 bg-white text-gray-300'}`}
            >
              <span>{users.filter(u => u.role === 'member').length}</span>
              <span>Members</span>
            </div>
            <div 
              onClick={() => setFilterRole('eventorganizer')}
              className={`w-20 h-20 border-4 rounded-full flex flex-col items-center justify-center text-[10px] text-center font-bold cursor-pointer transition-all shadow-sm
                ${filterRole === 'eventorganizer' ? 'border-purple-500 bg-purple-50 scale-110' : 'border-purple-200 bg-white text-purple-300'}`}
            >
              <span>{users.filter(u => u.role === 'eventorganizer').length}</span>
              <span>Organizers</span>
            </div>
          </div>
        </div>

        {/* User List Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-700">User's List</h2>
            <button
              onClick={() => navigate('/admin/add-user')}
              className="bg-[#A478C8] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-[#8e62b1] transition-all text-2xl"
            >
              +
            </button>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <div key={user._id}>
                {/* ── 使用者列 ── */}
                <div className="flex items-center px-8 py-5 hover:bg-gray-50/50 transition-colors">
                  {/* 頭像 */}
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-[#A478C8] border border-purple-100 mr-6">
                    <span className="text-xl">👤</span>
                  </div>

                  {/* 資訊 */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{user.username || user.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{user.role || 'Community Member'}</p>
                  </div>

                  {/* 按鈕 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditToggle(user)}
                      className={`p-2 transition-colors ${editingId === user._id ? 'text-[#A478C8]' : 'text-gray-400 hover:text-[#A478C8]'}`}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 text-gray-400 hover:text-[#F2B6B6] transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* ── 展開編輯表單（accordion） ── */}
                <div
                  style={{
                    maxHeight: editingId === user._id ? '500px' : '0px',
                    opacity: editingId === user._id ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.35s ease, opacity 0.25s ease',
                  }}
                >
                  <div className="px-10 pb-6 pt-2 bg-purple-50/40 border-t border-purple-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">

                      {/* Username */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={editForm.username || ''}
                          onChange={handleFormChange}
                          className="px-3 py-2 rounded-xl border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                          placeholder="Username"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email || ''}
                          onChange={handleFormChange}
                          className="px-3 py-2 rounded-xl border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                          placeholder="Email"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone || ''}
                          onChange={handleFormChange}
                          className="px-3 py-2 rounded-xl border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                          placeholder="Phone number"
                        />
                      </div>

                      {/* Organizer — 只有 eventorganizer 才顯示 */}
                      {editForm.role === 'eventorganizer' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Organizer</label>
                          <input
                            type="text"
                            name="organizer"
                            value={editForm.organizer || ''}
                            onChange={handleFormChange}
                            className="px-3 py-2 rounded-xl border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                            placeholder="Organizer name"
                          />
                        </div>
                      )}

                      {/* Role */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                        <select
                          name="role"
                          value={editForm.role || 'member'}
                          onChange={handleFormChange}
                          className="px-3 py-2 rounded-xl border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                        >
                          <option value="member">Member</option>
                          <option value="eventorganizer">Event Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4 justify-end">
                      <button
                        onClick={() => { setEditingId(null); setEditForm({}); }}
                        className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(user._id)}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl bg-[#A478C8] text-white text-sm font-semibold hover:bg-[#8e62b1] transition-colors disabled:opacity-60"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUserManagement;