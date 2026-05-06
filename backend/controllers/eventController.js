/*Get Event Function (Read)*/

const Event = require('../models/Event');
const getEvents = async (req , res) => {
try{
//const events = await Event.find ({userId: req.user.id});          //original
const events = await Event.find ({});                        //0428
res.json(events);
} catch (error) {
res.status(500).json({message: error.message});
}   
};

/*Add Event Function*/
const addEvent = async (req, res) => {
const{
    title, capacity, organizer, category, ticketRequired,
    ageRestriction, suburb, location, expStartDate, expStartTime,
    expFinDate,expFinTime, description
} = req.body;
try{
const event = await Event.create({
    userId: req.user.id,title, capacity, organizer, category, ticketRequired,
    ageRestriction, suburb, location, expStartDate, expStartTime,
    expFinDate,expFinTime, description
});
res.status(201).json(event); 
} catch (error) {
res.status(500).json({message: error.message});
}
};

/*Update Event*/
const updateEvent = async (req, res) =>{
const {
    title, capacity, organizer, category, ticketRequired,
    ageRestriction, suburb, location, expStartDate, expStartTime,
    expFinDate,expFinTime, description
} = req.body;
try{
const event = await Event.findById(req.params.id);
if (!event) return res.status(404).json({message: "Event not found"});

// 權限檢查：只有該活動的主辦人可以修改
if (event.userId.toString() !== req.user.id) {
  return res.status(401).json({ message: "Not authorized to update this event" });
}

event.title = title || event.title;
event.capacity = capacity || event.capacity;
event.organizer = organizer || event.organizer;
event.category = category || event.category;
event.ticketRequired = ticketRequired ?? event.ticketRequired;
event.ageRestriction = ageRestriction ?? event.ageRestriction;
event.suburb = suburb || event.suburb;
event.location = location || event.location;
event.expStartDate = expStartDate || event.expStartDate;
event.expStartTime = expStartTime || event.expStartTime;
event.expFinDate = expFinDate || event.expFinDate;
event.expFinTime = expFinTime || event.expFinTime;
event.description = description || event.description;

const updateEvent = await event.save();
res.json(updateEvent);
} catch (error){
res.status(500).json({message:error.message});
}
};

/*Delete Event*/
const deleteEvent = async (req, res) =>{
try{
const event = await Event.findById(req.params.id);
if(! event) return res.status(404).json({message: "Event not found"});

await event.remove();
res.json({message: "Event deleted"});
} catch(error){
res.status(500).json({message:error.message});
}
};

/* (Read Single) */
const getEventById = async (req, res) => {
  try {
    // Search for the ID 
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // check if the event belongs to the logged-in user
    if (event.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });    //0504update
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* (Read Single - Public, no auth required) */
const getEventByIdPublic = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);  // 直接回傳，不做 user 權限檢查
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ########Register Event */
const registerEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const userId = req.user._id;
    if (!event.participants) event.participants = [];
    if (event.participants.includes(userId)) {
      return res.status(400).json({ message: "Already registered" });
    }

    event.participants.push(userId);
    await event.save();
    res.json({ message: "Registered successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*####### Cancel Register Event */
const cancelRegisterEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.participants) event.participants = [];
    event.participants = event.participants.filter(
      (p) => String(p) !== String(req.user._id)
    );
    await event.save();
    res.json({ message: "Cancelled successfully", event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, addEvent, updateEvent, deleteEvent, getEventById, getEventByIdPublic, registerEvent, cancelRegisterEvent };


