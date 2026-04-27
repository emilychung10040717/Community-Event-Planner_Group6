
const express = require('express');
const { getEvents, addEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { getEventById } = require('../controllers/eventController');
const router = express.Router();

router.route('/').get(protect, getEvents).post(protect, addEvent);
router.route('/:id').get(protect, getEventById).put(protect, updateEvent).delete(protect, deleteEvent);

module.exports = router;
