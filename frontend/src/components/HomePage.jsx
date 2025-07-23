import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';

export default function HomePage() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('http://localhost:3000/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
  }, []);


  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [flights, setFlights] = useState([]); // Store flights separately

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:3000/api/message', { message });

      const botMessage = {
        sender: 'bot',
        text: res.data.text,
        time: new Date().toLocaleTimeString(),
      };

      setChatHistory((prev) => [...prev, botMessage]);

      if (res.data.flights && res.data.flights.length > 0) {
        setFlights(res.data.flights);
      } else {
        setFlights([]);
      }
    } catch (err) {
      const errorMsg = {
        sender: 'bot',
        text: 'Something went wrong. Please try again later.',
        time: new Date().toLocaleTimeString(),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
      setFlights([]);
    }
  };

const handlePayment = (flight) => {
  const userString = localStorage.getItem("user");
  if (!userString) {
    alert("❌ Please log in to book a flight.");
    return;
  }

  const user = JSON.parse(userString); // parse the stored user object

  const userData = {
    name: user.name,
    email: user.email,
    contact: user.phoneNumber
  };

  if (flight.price === 0) {
    alert(`✅ Flight ${flight.flightNumber} from ${flight.origin} to ${flight.destination} has been booked for free!`);

    axios.post('http://localhost:3000/api/book', {
      flight,
      userId: user._id, // pass the userId to backend
    }).then(() => {
      console.log("Free flight booking recorded.");
    }).catch((err) => {
      console.error("Booking failed:", err);
    });

    return;
  }
  const options = {
    key: "rzp_test_NZd6RqdGNW1Kng",
    amount: flight.price * 100, // In paise
    currency: 'INR',
    name: 'SkyBound Booking',
    description: `Flight ${flight.flightNumber} - ${flight.origin} to ${flight.destination}`,
    handler: function (response) {
      alert(`🎉 Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);

      axios.post('http://localhost:3000/api/book', {
        flight,
        paymentId: response.razorpay_payment_id,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).then(() => {
        console.log("Paid flight booking recorded.");
      }).catch((err) => {
        console.error("Booking failed:", err);
      });
    },
    prefill: {
      name: userData.name,
      email: userData.email,
      contact: userData.contact,
    },
    theme: {
      color: '#0f172a',
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

  return (
    <div className="relative flex min-h-screen flex-col bg-white overflow-x-hidden font-['Plus Jakarta Sans']">
      <div className="flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#f0f2f5] px-10 py-3">
          <div className="flex items-center gap-4 text-[#111418]">
            <div className="w-4 h-4">{/* Icon */}</div>
            <h2 className="text-lg font-bold">SkyBound</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <Link to="/profile" className="text-sm font-medium">Profile</Link>
              <Link to="/itinerary" className="text-sm font-medium">Itinerary</Link>
            </div>
            <button className="flex h-10 px-2.5 items-center rounded-xl bg-[#f0f2f5] text-sm font-bold">{/* Bell */}</button>
            <div className="bg-center bg-cover rounded-full w-10 h-10" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/...')` }} />
          </div>
        </header>

        {/* Main Content */}
        <div className="px-10 flex justify-center py-5 grow">
          <div className="flex flex-col max-w-[960px] w-full">
            <h2 className="text-[28px] font-bold text-center py-5">Welcome to SkyBound</h2>
            <p className="text-base text-center">How can I help you today?</p>

            {/* Chat History */}
            <div className="flex flex-col gap-4 py-4 max-h-[400px] overflow-y-auto px-2">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`text-sm ${msg.sender === 'user' ? 'self-end text-right' : 'self-start text-left'}`}>
                  <div className={`inline-block px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                    <p>{msg.text}</p>
                    <span className="block text-xs mt-1 text-gray-500">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex items-center px-4 py-3 gap-3">
              <label className="flex flex-col w-full h-12">
                <div className="flex w-full h-full items-stretch rounded-xl gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="form-input flex-1 rounded-l-xl bg-[#f0f2f5] px-4 text-base"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className="flex items-center justify-center px-2 rounded-r-xl bg-[#f0f2f5]">
                    <button
                      className="min-w-[84px] h-8 px-4 bg-[#3d98f4] text-white text-sm font-medium rounded-xl hidden sm:block"
                      onClick={handleSend}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </label>
            </div>
            {flights.length > 0 && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Available Flights</h3>
                <div className="w-full overflow-x-auto rounded-xl shadow-md">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="bg-slate-800 text-white">
                    <tr>
                        <th className="py-3 px-4">Flight</th>
                        <th className="py-3 px-4">From</th>
                        <th className="py-3 px-4">To</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4">Price (₹)</th>
                        <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {flights.map((flight, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-medium">{flight.flightNumber} ({flight.company})</td>
                        <td className="py-3 px-4">{flight.origin}</td>
                        <td className="py-3 px-4">{flight.destination}</td>
                        <td className="py-3 px-4">{flight.date}</td>
                        <td className="py-3 px-4">{flight.time}</td>
                        <td className="py-3 px-4">{flight.class}</td>
                        <td className="py-3 px-4 font-semibold">₹{flight.price}</td>
                        <td className="py-3 px-4 text-center">
                            <button
                            onClick={() => handlePayment(flight)}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded-lg shadow-sm transition"
                            >
                            Book Now
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
