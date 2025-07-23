import React, { useState } from "react";
import axios from "axios";
import FlightResults from "./FlightResults";

export default function Chatbot() {
  const [userMessage, setUserMessage] = useState("");
  const [flights, setFlights] = useState([]);

  const handleSend = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/message", { message: userMessage });
      const matchedFlights = res.data.flights || [];
      setFlights(matchedFlights);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">✈️ Flight Booking Chatbot</h1>
      <div className="flex gap-2">
        <input
          className="border p-2 w-full rounded"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Enter your query (e.g., Flights from Pune to Mumbai)"
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
      {flights.length > 0 && <FlightResults flights={flights} />}
    </div>
  );
}
