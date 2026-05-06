
const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile, getUsers,updateUserById , deleteUserById, addUser} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/admin/users', protect, getUsers);
router.put('/admin/users/:id', protect, updateUserById);
router.delete('/admin/users/:id', protect, deleteUserById);
router.post('/admin/add-user', protect, addUser);
module.exports = router;
