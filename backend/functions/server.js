const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflow = require('@google-cloud/dialogflow');
require('dotenv').config();
const path = require('path');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const authRoutes = require('../auth');
const protect = require('../middleware/auth');
const User = require("../user");
const serverless = require("serverless-http");
const flights = require("../flightdata"); 

const paymentRoutes = require('../payment');
const Booking = require('../booking');


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
  credentials: {
    client_email: process.env.client_email,
    private_key: process.env.private_key,
  },
});


app.use('/.netlify/functions/server/api/payment', paymentRoutes);
app.use('/.netlify/functions/server/api/auth', authRoutes);

app.post('/.netlify/functions/server/webhook', (req, res) => {
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

  res.json({ fulfillmentText: "Sorry, I didn't understand that request." });
});

const sessionPath = (sessionId) => sessionClient.projectAgentSessionPath(projectId, sessionId);

app.post('/.netlify/functions/server/api/message', async (req, res) => {
  const body = JSON.parse(req.body)
  const message = body.message;
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

    const isoDate = new Date(travelDateRaw).toISOString().split('T')[0];

    let matchedFlights = flights.filter(flight =>
      flight.origin.toLowerCase() === origin.toLowerCase() &&
      flight.destination.toLowerCase() === destination.toLowerCase() &&
      flight.date === isoDate
    );

    if (flightClass) {
      matchedFlights = matchedFlights.filter(flight =>
        flight.class?.toLowerCase() === flightClass.toLowerCase()
      );
    }

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

app.post('/.netlify/functions/server/api/book', async (req, res) => {
  const body = JSON.parse(req.body);
  const { flight, userId } = body;

  if (!flight || !flight.flightNumber || !flight.origin || !flight.destination || !userId) {
    return res.status(400).json({ error: 'Missing flight or user details.' });
  }

  try {

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const booking = new Booking({
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.time,
      date: flight.date,
      price: flight.price,
      user: {
        name: user.name,
        email: user.email,
      },
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Flight ${flight.flightNumber} successfully booked!`,
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, error: 'Booking failed.' });
  }
});

app.get("/.netlify/functions/server/bookings/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;

    const bookings = await Booking.find({ "user.email": userEmail });
    console.log(bookings);

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings for user." });
  }
});

app.delete("/.netlify/functions/server/bookings/:reference", async (req, res) => {
  try {
    const reference = req.params.reference;

    const booking = await Booking.findOne({ _id: reference });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await booking.deleteOne();
    res.status(200).json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/.netlify/functions/server/", (req, res) => {
  return res.json({message : "Hello, World"});
})

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
}