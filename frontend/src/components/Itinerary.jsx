// src/pages/Itinerary.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const Itinerary = () => {
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [pastTrips, setPastTrips] = useState([]);


  const fetchBookings = async (setUpcomingTrips, setPastTrips) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) return;

    const res = await axios.get(`https://flightbookingbackend.netlify.app/.netlify/functions/server/bookings/${user.email}`);
    const bookings = res.data;

    const now = dayjs();
    const upcoming = [];
    const past = [];

    bookings.forEach((booking) => {
      const dep = dayjs(`${booking.date} ${booking.departureTime}`);
      const route = `${booking.origin} to ${booking.destination}`;
      const reference = booking._id.slice(-10);
      const date = dep.format("YYYY-MM-DD");
      const id = booking._id;

      const trip = { route, reference, date, id };

      if (dep.isAfter(now)) {
        upcoming.push(trip);
      } else {
        past.push(trip);
      }
    });

    setUpcomingTrips(upcoming);
    setPastTrips(past);
  } catch (err) {
    console.error("Failed to fetch bookings:", err);
  }
};

useEffect(() => {
  fetchBookings(setUpcomingTrips, setPastTrips);
}, []);


const handleCancel = async (reference) => {
  try {
    const res = await axios.delete(`https://flightbookingbackend.netlify.app/,netlify/functions/server/bookings/${reference}`);
    if (res.status === 200) {
      alert("Booking cancelled successfully.");
      await fetchBookings(setUpcomingTrips, setPastTrips);
    }
  } catch (err) {
    console.error("Cancellation failed:", err);
    alert("Failed to cancel booking.");
  }
};



  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      <header className="flex items-center justify-between border-b px-10 py-3">
        <div className="flex items-center gap-4 text-[#121417]">
          <div className="w-4 h-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
            </svg>
          </div>
          <Link to="/chat"><h2 className="text-lg font-bold">Skybound</h2></Link>
        </div>

        <div className="flex items-center gap-8">
          <nav className="flex gap-9 text-sm font-medium">
            <Link to="/chat"><a>Home</a></Link>
          </nav>
          <button className="h-10 px-2.5 bg-[#f1f2f4] text-sm font-bold rounded-full flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216Z" />
            </svg>
          </button>
          <div
            className="w-10 h-10 bg-cover bg-center rounded-full"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC07_KKOzSKbWPQSWJZ7xOZ3q41L_uE4LwUqwC7yIwOjDTtwP97euM7OQhvVrMm8tNHviP0R-H3mx5f5m-m277tVR-l0nB0bog18SRI9Zn34qdBD_CE70Dx63aylDFi5OufIQ00NLKTdYDPzc0w5Q-Vwxz3YXIGd6RgE7XOwuh8smXKqTVva2xKh7yBHw_OvVdMvmixhCDK74jnzc90c3mVZxk82pNorKArHk75585IsKXsEuEELXJ8aAGu8F-X_9-tBpFJtH0vcgVm")',
            }}
          ></div>
        </div>
      </header>

      <main className="px-40 py-5">
        <div className="max-w-[960px] mx-auto">
          <div className="p-4">
            <h1 className="text-[32px] font-bold text-[#121417]">Trips</h1>
            <p className="text-sm text-[#677583]">View your upcoming and past trips</p>
          </div>
          <section className="px-4 pt-5">
            <h2 className="text-[22px] font-bold text-[#121417] pb-3">Upcoming</h2>
            {upcomingTrips.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-6">
                <div className="aspect-video w-full max-w-[360px] bg-cover bg-center rounded-xl" style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC-envtX4tsWxhEnVVXTkLKs8R5H1h7J3qhr9KYwpjTGg3EeYmFiAJsINSwKtjCNPktaZ9gGOxpjDNyWKiQElPPYSKG9ANqaHAH2gRBWfy6jDCaDz6vAI0DPdLIKUCKtVRb6dVII7of7mSIUf9mv3JJpwfcYwTAD7EfAqd0ZK0MkKUmixRKNGLDfIDaxEkYGKdof3C4OygCi9Q1GSO47LrCEQoukWjemWs0RBejvGuVEQVDWLpmtxYkAF_DZQ8WjAi8q8xNTmbhhgY1")'
                }}></div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#121417]">No upcoming trips</p>
                  <p className="text-sm text-[#121417]">Book a trip to see it here</p>
                </div>
              </div>
            ) : (
              upcomingTrips.map((trip, index) => (
                <div key={index} className="flex justify-between items-center bg-white py-2 px-4 min-h-[72px] gap-4 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#f1f2f4] text-[#121417]">
                      ✈️
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-base font-medium text-[#121417]">{trip.route}</p>
                      <p className="text-sm text-[#677583]">Booking reference: {trip.reference}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <p className="text-sm text-[#677583]">{trip.date}</p>
                  </div>
                      <button onClick={() => handleCancel(trip.id)} className="text-red-600 font-bold">
                      Cancel
                    </button>
                </div>
              ))
            )}
          </section>
          <section className="px-4 pt-5">
            <h2 className="text-[22px] font-bold text-[#121417] pb-3">Past</h2>
            {pastTrips.map((trip, index) => (
              <div key={index} className="flex justify-between items-center bg-white py-2 px-4 min-h-[72px] gap-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#f1f2f4] text-[#121417]">
                    🧳
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-base font-medium text-[#121417]">{trip.route}</p>
                    <p className="text-sm text-[#677583]">Booking reference: {trip.reference}</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <p className="text-sm text-[#677583]">{trip.date}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Itinerary;
