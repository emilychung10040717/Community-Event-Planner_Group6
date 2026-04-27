
const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Event = require('../models/Event');
const { updateEvent,getEvents,addEvent,deleteEvent, getEventById } = require('../controllers/eventController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;

//add a scenario for testing "add event" functionality
describe('AddEvent Function Test', () => {

  it('should create a new event successfully', async () => {
    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: {  title: 'Wonwoo birthday', capacity: '17', organizer : 'Carat', category: 'Idol', ticketRequired : true, ageRestriction : true, 
        suburb : 'Sunnybank', location : 'Yedang', expStartDate : '2026-07-17T00:00:00.000+00:00', expStartTime : '7:17', 
        expFinDate : '2026-07-17T00:00:00.000+00:00', expFinTime : '17:17', description: 'Join us to celebrate for Wonwoo' }
    };  //image  save format???

    // Mock event that would be created
    const createdEvent = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

    // Stub Event.create to return the createdEvent
    const createStub = sinon.stub(Event, 'create').resolves(createdEvent);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addEvent(req, res);

    // Assertions
    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdEvent)).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Event.create to throw an error
    const createStub = sinon.stub(Event, 'create').throws(new Error('DB Error'));

    // Mock request data
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: 'Wonwoo birthday', capacity: '17', organizer : 'Carat', category: 'Idol', ticketRequired : true, ageRestriction : true, 
        suburb : 'Sunnybank', location : 'Yedang', expStartDate : '2026-07-17T00:00:00.000+00:00', expStartTime : '7:17', 
        expFinDate : '2026-07-17T00:00:00.000+00:00', expFinTime : '17:17', description: 'Join us to celebrate for Wonwoo' }
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await addEvent(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    createStub.restore();
  });

});


//add a scenario for testing "update event" functionality
describe('Update Function Test', () => {

  it('should update event successfully', async () => {
    // Mock task data
    const eventId = new mongoose.Types.ObjectId();
    const existingEvent = {
      title: 'Wonwoo birthday', 
      capacity: '17', 
      organizer : 'Carat', 
      category: 'Idol', 
      ticketRequired : true, 
      ageRestriction : true, 
      suburb : 'Sunnybank', 
      location : 'Art Centre',       //Ask for Update location
      expStartDate : '2026-07-17T00:00:00.000+00:00', 
      expStartTime : '7:17', 
      expFinDate : '2026-07-17T00:00:00.000+00:00', 
      expFinTime : '17:17', 
      description: 'Join us to celebrate for Wonwoo', 
      save: sinon.stub().resolvesThis() // ← simulation for save
                            // Mock save method
    };
    // Stub Event.findById to return mock event      //avoid to connect to the real DB
    const findByIdStub = sinon.stub(Event, 'findById').resolves(existingEvent);

    // Mock request & response      //simulate for the updating data
    const req = {
      params: { id: eventId },
      body: {  location: "Queensland Museum" }
    };
    const res = {
      json: sinon.spy(), 
      status: sinon.stub().returnsThis()
    };

    // Call function
    await updateEvent(req, res);

    // Assertions = Verification
    expect(existingEvent.location).to.equal("Queensland Museum");
    // expect(res.status.called).to.be.false; // No error status should be set
    expect(res.json.calledOnce).to.be.true;
    

    // Restore stubbed methods
    findByIdStub.restore();
  });



  it('should return 404 if event is not found', async () => {
    const findByIdStub = sinon.stub(Event, 'findById').resolves(null);      //simulate: if the ID is null

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateEvent(req, res);

    expect(res.status.calledWith(404)).to.be.true;                              //check if backend return the message (404)
    expect(res.json.calledWith({ message: 'Event not found' })).to.be.true;     //return message to frontend

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Event, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateEvent(req, res);

    expect(res.status.calledWith(500)).to.be.true;          //simulate a disaster mistake
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });



});


//add a scenario for testing "view event" functionality
describe('GetEvent Function Test', () => {

  it('should return events for the given user', async () => {
    // Mock user ID
    const userId = new mongoose.Types.ObjectId();

    // Mock event data
    const events = [
      { _id: new mongoose.Types.ObjectId(), title: "Wonwoo birthday", userId },
      //{ _id: new mongoose.Types.ObjectId(), title: "anniversary", userId }
    ];

    // Stub Task.find to return mock tasks
    const findStub = sinon.stub(Event, 'find').resolves(events);

    // Mock request & response
    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getEvents(req, res);

    // Assertions
    //expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(findStub.calledOnceWith({ userId: req.user.id })).to.be.true;    //0504 update
    expect(res.json.calledWith(events)).to.be.true;
    expect(res.status.called).to.be.false; // No error status should be set

    // Restore stubbed methods
    findStub.restore();
  });

  it('should return 500 on error', async () => {
    // Stub Task.find to throw an error
    const findStub = sinon.stub(Event, 'find').throws(new Error('DB Error'));

    // Mock request & response
    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await getEvents(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findStub.restore();
  });

});


//add a scenario for testing "delete event" functionality
describe('DeleteEvent Function Test', () => {

  it('should delete a event successfully', async () => {
    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock task found in the database
    const event = { remove: sinon.stub().resolves() };

    // Stub Task.findById to return the mock task
    const findByIdStub = sinon.stub(Event, 'findById').resolves(event);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteEvent(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(event.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Event deleted' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 404 if task is not found', async () => {
    // Stub Task.findById to return null
    const findByIdStub = sinon.stub(Event, 'findById').resolves(null);

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteEvent(req, res);

    // Assertions
    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Event not found' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    // Stub Task.findById to throw an error
    const findByIdStub = sinon.stub(Event, 'findById').throws(new Error('DB Error'));

    // Mock request data
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await deleteEvent(req, res);

    // Assertions
    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    // Restore stubbed methods
    findByIdStub.restore();
  });
});

describe('getEventById Function Test', () => {
  it('should return the event if it exists and belongs to the user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const eventId = new mongoose.Types.ObjectId();
    
    const mockEvent = {
      _id: eventId,
      title: 'Test Event',
      userId: userId,
    };

    const findByIdStub = sinon.stub(Event, 'findById').resolves(mockEvent);

    const req = { params: { id: eventId }, user: { id: userId.toString() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await getEventById(req, res);

    expect(res.json.calledWith(mockEvent)).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if the event does not exist', async () => {
    const findByIdStub = sinon.stub(Event, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, user: { id: '123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await getEventById(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Event not found' })).to.be.true;

    findByIdStub.restore();
  });

  {/* test for GetEventById*/}
  it('should return 401 if the user is not the owner', async () => {
    const mockEvent = { _id: new mongoose.Types.ObjectId(), userId: new mongoose.Types.ObjectId() };
    const findByIdStub = sinon.stub(Event, 'findById').resolves(mockEvent);

    const req = { params: { id: mockEvent._id }, user: { id: 'differentUserId' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await getEventById(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ message: 'Not authorized' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on database error', async () => {
    const findByIdStub = sinon.stub(Event, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, user: { id: '123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await getEventById(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findByIdStub.restore();
  });
});