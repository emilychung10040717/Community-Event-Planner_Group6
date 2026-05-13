
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, phone, organization, password, confirmPassword, role } = req.body;
    try {
        if (password !== confirmPassword){
            return res.status(400).json({message: 'Confirm password is not match, please enter again!'});
        }
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        
        const user = await User.create({ name, email, phone, organization, password, role});
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        // console.log('--- Login information of log ---');
        // console.log('Password from frontend (password):', password);
        // console.log('User found in database (user):', user ? 'Found' : 'Not found');
        // console.log('User ID (user._id):', user._id ? 'Found' : 'Not found', user._id);
        // if (user) {
        //     console.log('Encrypted password (user.password):', user.password);
        // }
        // console.log('--------------------');
        if (user && (await bcrypt.compare(password, user.password))) {
            //res.json({ id: user.id, email: user.email, token: generateToken(user.id) });
            if (role && user.role !== role) {
                return res.status(401).json({ message: `Access denied: You are not a ${role}` });
            }
            //console.log('User found in database (user):', user.role ? 'Found' : 'Not found',user.role);
            //console.log('Role passed (role):', role ? 'Found' : 'Not found',role);
            res.json({ 
                id: user.id,
                name: user.name, 
                email: user.email, 
                role: user.role,    // response role data
                token: generateToken(user.id) 
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        name: user.name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        role: user.role,     //add on the response of role data
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, phone, organization} = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.organization = organization || user.organization;

        const updatedUser = await user.save();
        res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone, organization: updatedUser.organization, token: generateToken(updatedUser.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// 新增：取得所有使用者 (供 Admin 使用)
const getUsers = async (req, res) => {
    console.log("The request information:", req.user); // <--- 加這行
    try {
        // 抓取所有使用者，但不回傳密碼
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 新增：取得單一使用者 (供 Admin 編輯頁面回填資料使用)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { username, email, phone, organization, role } = req.body;
        user.name     = username || user.name;
        user.email    = email    || user.email;
        user.phone    = phone    || user.phone;
        user.organization= organization|| user.organization;
        user.role     = role     || user.role;
    
        const updatedUser = await user.save();
        res.status(200).json({ 
            id: updatedUser.id, 
            name: updatedUser.name, 
            phone: updatedUser.phone,
            email: updatedUser.email, 
            organization: updatedUser.organization,
            role: updatedUser.role 
        });
    } catch (error) {
        console.error('updateUserById error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('deleteUserById error:', error);
        res.status(500).json({ message: error.message });
    }
};

const addUser = async (req, res) => {
    const { name, email, phone, organization, password, role } = req.body;
    try {

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        
        const user = await User.create({ name, email, phone, organization, password, role});
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile, getUsers, getUserById, updateUserById, deleteUserById, addUser };
