const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflow = require('@google-cloud/dialogflow');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const projectId = process.env.projectId;
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: process.env.credentials
});

// Webhook route
app.post('/webhook', (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;

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


app.post('/api/message', async (req, res) => {
  const message = req.body.message;
  const sessionId = Math.random().toString(36).substring(7);
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;
    res.json({ reply: result.fulfillmentText });
  } catch (error) {
    console.error(error);
    res.status(500).send('Dialogflow request failed');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
