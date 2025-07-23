import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chatbot from "./components/Chatbot";
import Itinerary from "./components/Itinerary";
import HomePage from "./components/HomePage";
import Profile from "./components/Profile";
import LoginPage from "./components/LoginPage";
import axios from "axios";
import RegisterPage from "./components/RegisterPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-10 text-xl">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-4">
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              user ? <Navigate to="/chat" /> : <LoginPage setUser={setUser} />
            }
          />
          <Route
            path="/chat"
            element={
              user ? <HomePage user={user} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/itinerary"
            element={
              user ? <Itinerary user={user} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/profile"
            element={
              user ? <Profile user={user} /> : <Navigate to="/" />
            }
          />
          <Route
            path="*"
            element={<Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
