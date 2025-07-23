import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !phoneNumber || !password) {
      return alert('Please fill in all fields');
    }

    try {
      const res = await axios.post('https://flightbookingbackend.netlify.app/.netlify/functions/server/api/auth/register', {
        name,
        email: email.trim(),
        phoneNumber,
        password : password.trim(),
      });
      
      alert('Registered successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f1f2f4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#121417]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-[#121417] text-lg font-bold leading-tight tracking-[-0.015em]">Skybound</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <button
              onClick={() => navigate('/login')}
              className="h-10 px-4 rounded-full bg-[#f1f2f4] text-[#121417] text-sm font-bold"
            >
              Log in
            </button>
          </div>
        </header>

        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <h2 className="text-[#121417] text-[28px] font-bold text-center pb-3 pt-5 px-4">Create your account</h2>

            {/* Name Field */}
            <div className="flex max-w-[480px] px-4 py-3">
              <label className="flex flex-col flex-1">
                <p className="text-base font-medium pb-2">Name</p>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="h-14 p-4 rounded-xl bg-[#f1f2f4] text-base focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            </div>

            {/* Email Field */}
            <div className="flex max-w-[480px] px-4 py-3">
              <label className="flex flex-col flex-1">
                <p className="text-base font-medium pb-2">Email</p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-14 p-4 rounded-xl bg-[#f1f2f4] text-base focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>

            {/* Phone Number Field */}
            <div className="flex max-w-[480px] px-4 py-3">
              <label className="flex flex-col flex-1">
                <p className="text-base font-medium pb-2">Phone number</p>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="h-14 p-4 rounded-xl bg-[#f1f2f4] text-base focus:outline-none"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </label>
            </div>

            {/* Password Field */}
            <div className="flex max-w-[480px] px-4 py-3">
              <label className="flex flex-col flex-1">
                <p className="text-base font-medium pb-2">Password</p>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="h-14 p-4 rounded-xl bg-[#f1f2f4] text-base focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>

            {/* Register Button */}
            <div className="flex px-4 py-3">
              <button
                onClick={handleRegister}
                className="flex h-10 px-4 rounded-full items-center bg-[#357dc9] text-white text-sm font-bold"
              >
                Register
              </button>
            </div>

            {/* Login Redirect */}
            <p
              className="text-[#677583] text-sm text-center underline cursor-pointer px-4 pb-3 pt-1"
              onClick={() => navigate('/login')}
            >
              Already have an account? Log in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
