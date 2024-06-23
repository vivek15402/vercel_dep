const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const EventRegistration = require('../models/eventModel');

// Multer configuration
const upload = multer({ dest: 'uploads/' });

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


app.get('/api/register_event', async (req, res) => {
    try {
        const events = await EventRegistration.find({});
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching events', error: err });
    }
});

module.exports = router;