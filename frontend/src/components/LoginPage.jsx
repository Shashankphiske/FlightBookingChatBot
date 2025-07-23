import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

const handleLogin = async () => {
  if (!email || !password) return alert('Please fill in all fields');

  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    console.log(res.data.token);
    setUser(res.data.user); // this updates App's state// navigate only after user is set
  } catch (err) {
    console.error(err);
    alert('Login failed. Please check your credentials.');
  }
};

  return (
    <div className="relative flex min-h-screen flex-col bg-white overflow-x-hidden font-['Plus Jakarta Sans']">
      <div className="flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#f1f2f4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#121416]">
            <div className="w-4 h-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-lg font-bold">Skybound</h2>
          </div>
        </header>

        {/* Login Form */}
        <div className="px-6 md:px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col w-full max-w-[512px]">
            <h2 className="text-[28px] font-bold text-center py-5">Welcome back</h2>

            <div className="flex flex-col gap-4 px-4">
              <label className="flex flex-col">
                <p className="text-base font-medium pb-2">Email</p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-14 rounded-xl bg-[#f1f2f4] px-4 text-base focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="flex flex-col">
                <p className="text-base font-medium pb-2">Password</p>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="h-14 rounded-xl bg-[#f1f2f4] px-4 text-base focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <p className="text-sm text-[#6a7581] underline cursor-pointer mt-1">Forgot Password?</p>

              <button
                onClick={handleLogin}
                className="h-12 rounded-full bg-[#5e92c9] text-white font-bold text-sm mt-2"
              >
                Login
              </button>

              {/* New Register Button */}
              <button
                onClick={() => navigate('/register')}
                className="h-12 rounded-full bg-[#e0e0e0] text-[#121416] font-bold text-sm"
              >
                New user? Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
