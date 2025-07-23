const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflow = require('@google-cloud/dialogflow');
require('dotenv').config();
const path = require('path');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const authRoutes = require('./auth');
const protect = require('./middleware/auth');

const paymentRoutes = require('./payment');
const Booking = require('./booking');


// Replace with your actual connection string from MongoDB Atlas
const MONGO_URI = 'mongodb+srv://sspuser:0511@cluster0.zesp8.mongodb.net/FlightData?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to Mongodb'))
.catch((err) => console.error('connection error:', err));


const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const projectId = process.env.projectId;
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.credentials
});

app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);


// Webhook route
app.post('/webhook', (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;
  const origin = req.body.queryResult.parameters['origin'];
  const destination = req.body.queryResult.parameters['destination'];
  const travelDate = req.body.queryResult.parameters['date'];

  console.log({ origin, destination, travelDate });

  console.log('Intent:', intentName);
  console.log('Parameters:', req.body.queryResult.parameters);

  if (intentName === 'SearchFlights') {
    const { origin, destination, travelDate, flightClass, preferredAirline } = req.body.queryResult.parameters;

    const responseText = `✈ Searching flights from ${origin} to ${destination} on ${travelDate}` +
                         `${flightClass ? ` in ${flightClass} class` : ''}` +
                         `${preferredAirline ? ` with ${preferredAirline}` : ''}.`;

    return res.json({
      fulfillmentText: responseText
    });
  }

  // Default fallback
  res.json({ fulfillmentText: "Sorry, I didn't understand that request." });
});

const sessionPath = (sessionId) => sessionClient.projectAgentSessionPath(projectId, sessionId);

app.post('/api/message', async (req, res) => {
  const message = req.body.message;
  const sessionId = uuidv4();

  const request = {
    session: sessionPath(sessionId),
    queryInput: {
      text: {
        text: message,
        languageCode: 'en'
      }
    }
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    console.log("Detected intent:", result.intent.displayName);
    console.log("Parameters:", result.parameters.fields);

    // Extract parameters
    const params = result.parameters.fields;
    const origin = params.origin?.listValue?.values?.[0]?.stringValue || '';
    const destination = params.destination?.listValue?.values?.[0]?.stringValue || '';
    const travelDateRaw = params.travelDate?.listValue?.values?.[0]?.stringValue || '';
    const flightClass = params.flightClass?.stringValue || '';
    const preferredAirline = params.preferredAirline?.listValue?.values?.map(v => v.stringValue) || [];

    if (!origin || !destination || !travelDateRaw) {
      return res.json({
        reply: result.fulfillmentText || "Please provide origin, destination, and travel date.",
        flights: []
      });
    }

    // Normalize travel date to YYYY-MM-DD
    const isoDate = new Date(travelDateRaw).toISOString().split('T')[0];

    // Load flight data
    const dataPath = path.join(__dirname, './flightData.json');
    const allFlights = JSON.parse(fs.readFileSync(dataPath));

    // Filter flights by mandatory fields
    let matchedFlights = allFlights.filter(flight =>
      flight.origin.toLowerCase() === origin.toLowerCase() &&
      flight.destination.toLowerCase() === destination.toLowerCase() &&
      flight.date === isoDate
    );

    // Optional filter: flight class
    if (flightClass) {
      matchedFlights = matchedFlights.filter(flight =>
        flight.class?.toLowerCase() === flightClass.toLowerCase()
      );
    }

    // Optional filter: preferred airline
    if (preferredAirline.length > 0) {
      matchedFlights = matchedFlights.filter(flight =>
        preferredAirline.includes(flight.company)
      );
    }

    if (matchedFlights.length === 0) {
      return res.json({
        reply: "Sorry, no flights available.",
        flights: []
      });
    }

    return res.json({
      reply: `Here are the available flights from ${origin} to ${destination} on ${isoDate}`,
      flights: matchedFlights
    });

  } catch (error) {
    console.error("Dialogflow Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/api/book', protect, async (req, res) => {
  const { flight } = req.body;

  if (!flight || !flight.flightNumber || !flight.origin || !flight.destination) {
    return res.status(400).json({ error: 'Missing flight details.' });
  }

  try {
    const booking = new Booking({
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      price: flight.price,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });

    await booking.save();
    res.status(200).json({
      success: true,
      message: `Flight ${flight.flightNumber} successfully booked!`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Booking failed.' });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
