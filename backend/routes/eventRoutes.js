
const express = require('express');
const { getEvents, addEvent, updateEvent, deleteEvent,  getEventById, getEventByIdPublic } = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/event-details/:id').get(getEventByIdPublic);    //no need to be authority
router.route('/view-events/:id').get(protect, getEvents). post(protect, getEventById);
router.route('/').get(getEvents).post(protect, addEvent);
router.route('/:id').get(protect, getEventById).put(protect, updateEvent).delete(protect, deleteEvent);


module.exports = router;
