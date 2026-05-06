
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    //eventId: {type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true},   //0428  
    title: { type: String, required: true },
    capacity : {type: Number, required: true},
    organizer : {type: String, required: true},
    category : {type: String, required: true},
    ticketRequired  : { type: Boolean, required: true },
    ageRestriction  : { type: Boolean, required: true },
    suburb: {type: String, required: true},
    location: {type: String, required: true},
    expStartDate: { type: Date , required: true},
    expStartTime: { type: String , required: true},
    expFinDate: { type: Date , required: true},
    expFinTime: { type: String , required: true},
    description: { type: String },
    image: {type: String},
    participants:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' },  //參加者
    ],
});

module.exports = mongoose.model('Event', eventSchema);
