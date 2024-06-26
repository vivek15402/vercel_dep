// Load environment variables
require("dotenv").config();

// Dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL);

// Initialize Express app
const app = express();

// Multer configuration
const upload = multer({ dest: 'uploads/' });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Define the video schema
const videoSchema = new mongoose.Schema({
  video_name: { type: String, required: true },
  timestamp: {
    Fence1: String,
    Fence2: String
  },
  tagName: [String]
});

const Video = mongoose.model('Video', videoSchema, 'videos');

// Routes
app.post('/api/videos', async (req, res) => {
  const { video_name, timestamp, tagName } = req.body;

  try {
    const updatedVideo = await Video.findOneAndUpdate(
      { video_name: video_name }, // search query
      {
        $set: { timestamp: timestamp, tagName: tagName }
      }, // update data
      {
        new: true, // return the updated document
        upsert: true, // create a new document if no documents match the query
        runValidators: true // ensure validation rules are applied
      }
    );
    res.status(200).json(updatedVideo);
  } catch (err) {
    res.status(500).json({ message: "Error updating video information", error: err });
  }
});

app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find({});
    res.status(200).send(videos);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Define the entry schema
const entrySchema = new mongoose.Schema({
  code: { type: String, required: true },
  description: { type: String, required: true }
});

// Define the movement schema
const movementSchema = new mongoose.Schema({
  movement: { type: Number, required: true },
  entries: [entrySchema]
});

// Define the main schema
const testSchema = new mongoose.Schema({
  testValue: { type: Number, required: true }
});

// Create the model from the schema
const DressageTest = mongoose.model('DressageTest', testSchema, 'dressage_test')

app.get('/api/dressage_test', async (req, res) => {
  const { testValue } = req.query;
  const filter = {};

  if (testValue) {
    filter.testValue = testValue;
  }

  try {
    const dressage_test = await DressageTest.find(filter);
    res.status(200).send(dressage_test);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Define the score schema
const scoreSchema = new mongoose.Schema({
  movement: { type: Number, required: true },
  score: { type: Number, required: true }
});

// Define the dressage test schema
const dressageTestSchema = new mongoose.Schema({
  video: { type: String, required: true },
  test: { type: Number, required: true },
  scores: [scoreSchema],
  timestamps: [String]
});

const DressageScoreTest = mongoose.model('DressageScoreTest', dressageTestSchema, 'dressage_test_scores');


app.post('/api/save_scores', async (req, res) => {
  const { video, test, scores, timestamps } = req.body;

  try {
    const updatedScores = await DressageScoreTest.findOneAndUpdate(
      { video: video, test: test }, // search query
      {
        $set: { scores: scores, timestamps: timestamps }
      }, // update data
      {
        new: true, // return the updated document
        upsert: true, // create a new document if no documents match the query
        runValidators: true // ensure validation rules are applied
      }
    );
    res.status(200).json({ message: 'Scores saved successfully', result: updatedScores });
  } catch (err) {
    res.status(500).json({ message: 'Error saving scores', error: err });
  }
});


app.get('/api/save_scores', async (req, res) => {
  const { test } = req.query;
  const filter = {};

  if (test) {
    filter.test = test;
  }

  try {
    const dressage_test = await DressageScoreTest.find(filter);
    res.status(200).send(dressage_test);
  } catch (err) {
    res.status(500).send(err);
  }
});


// Define the event registration schema
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

app.post('/api/register_event', upload.single('videoupload'), async (req, res) => {
  const { firstname, lastname, horsename, eventlocation, formdate, level, discipline } = req.body;
  const videoupload = req.file ? req.file.path : '';

  const newEventRegistration = new EventRegistration({
    firstname,
    lastname,
    horsename,
    eventlocation,
    formdate,
    level,
    videoupload,
    discipline
  });

  try {
    const savedRegistration = await newEventRegistration.save();
    res.status(201).json({ message: 'Event registered successfully', data: savedRegistration });
  } catch (err) {
    res.status(500).json({ message: 'Error registering event', error: err });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/api/register_event', async (req, res) => {
  try {
    const events = await EventRegistration.find({});
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events', error: err });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
