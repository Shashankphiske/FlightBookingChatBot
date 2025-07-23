import React from "react";
import RazorpayButton from "./RazorpayButton";

export default function FlightResults({ flights }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Matching Flights</h2>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Flight</th>
            <th className="p-2">From</th>
            <th className="p-2">To</th>
            <th className="p-2">Time</th>
            <th className="p-2">Price</th>
            <th className="p-2">Book</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{flight.company}</td>
              <td className="p-2">{flight.origin}</td>
              <td className="p-2">{flight.destination}</td>
              <td className="p-2">{flight.time}</td>
              <td className="p-2">₹{flight.price}</td>
              <td className="p-2">
                <RazorpayButton flight={flight} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
