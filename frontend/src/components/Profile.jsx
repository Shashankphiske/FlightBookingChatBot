import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSaveChanges = async () => {
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      alert('No user found in localStorage.');
      return;
    }

    const response = await axios.put(
      'https://flightbookingbackend.netlify.app/.netlify/functions/server/api/auth/update-profile',
      {
        id: storedUser._id,
        ...formData,
      }
    );
    localStorage.setItem('user', JSON.stringify(response.data.updatedUser));
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Update error:', error);
    alert('Failed to update profile.');
  }
};



  return (
    <div className="min-h-screen bg-white font-['Plus Jakarta Sans','Noto Sans',sans-serif]">
      <header className="flex items-center justify-between border-b px-10 py-3 border-[#f0f2f5]">
        <div className="flex items-center gap-4 text-[#111418]">
          <div className="w-4 h-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
            </svg>
          </div>
          <Link to="/chat"><h2 className="text-lg font-bold">Skybound</h2></Link>
        </div>
        <div className="flex items-center gap-8">
          <button className="flex items-center justify-center bg-[#f0f2f5] text-[#111418] h-10 px-2.5 rounded-full text-sm font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
            </svg>
          </button>
          <div
            className="w-10 h-10 rounded-full bg-cover bg-center"
            style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCouCDFSlY97x8CDRIbRT1dCrpaCUgx_42MNV16l-mSjv0y3RT7D-CNPgKhy80XK9cgLapyVJEAJPXoQGjozFETvKxsHJ15lPccOUjmJwpa-dG4l53xiUYnhk78_Cy472puHvA0tCrkEuUj-HJ3EU9S9OBm34_K-OPLWJ-WhjxG5AKLD_abAceRYDNeXXqi6ybDKdNAcDwyAcsyTbFT0yiiPkr9YjfKmFK1ou8RHWLbw9BqzeEh-iHLYhXJy_DPyH-yzLshYLaLWoiH)' }}
          ></div>
          <button
            onClick={handleLogout}
            className="ml-4 text-sm font-bold text-[#3490f3] hover:underline"
          >
            Logout
          </button>

        </div>
      </header>

      <div className="px-40 py-5">
        <div className="max-w-xl mx-auto">
          <h1 className="text-[32px] font-bold mb-6">Profile</h1>

          <div className="mb-4">
            <label className="block text-base font-medium text-[#111418] mb-2">Full name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full h-14 border border-[#dbe0e6] rounded-xl p-4 text-base text-[#111418]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-base font-medium text-[#111418] mb-2">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-14 border border-[#dbe0e6] rounded-xl p-4 text-base text-[#111418]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-base font-medium text-[#111418] mb-2">Phone number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full h-14 border border-[#dbe0e6] rounded-xl p-4 text-base text-[#111418]"
            />
          </div>


          <button onClick={handleSaveChanges} className="bg-[#3490f3] text-white font-bold text-sm px-4 h-10 rounded-full">Save changes</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;