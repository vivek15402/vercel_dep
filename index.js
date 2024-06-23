require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Connect to MongoDB
const mongoURL = process.env.MONGO_URL;
mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});

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

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
