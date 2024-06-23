const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  horsename: { type: String, required: true },
  eventlocation: { type: String, required: true },
  formdate: { type: Date, required: true },
  level: { type: String, required: true },
  videoupload: { type: String, required: true },
  discipline: { type: String, required: true }
});

const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema, 'event_registrations');

module.exports = EventRegistration;
