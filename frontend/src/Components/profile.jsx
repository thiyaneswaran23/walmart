import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './profile.css';

function Profile() {
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(true); 

  const nav = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("Name");
    const gender = localStorage.getItem("gender");
    const email = localStorage.getItem("email");
    const savedDob = localStorage.getItem("dob");
    const savedAddress = localStorage.getItem("address");

    setUserName(name || '');
    setUserGender(gender || '');
    setUserEmail(email || '');
    setDob(savedDob || '');
    setAddress(savedAddress || '');
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.put(
        'http://localhost:5000/api/profile/update-profile',
        {
          email: userEmail,
          dob,
          address
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        localStorage.setItem('dob', dob);
        localStorage.setItem('address', address);
        setSuccess('✅ Profile updated successfully!');
        setIsEditing(false); 
      }
    } catch (err) {
      console.error(err);
      console.log(token);
      setSuccess('❌ Failed to update profile.');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>

        <div className="profile-row">
          <label>Name:</label>
          <span>{userName}</span>
        </div>
        <div className="profile-row">
          <label>Gender:</label>
          <span>{userGender}</span>
        </div>
        <div className="profile-row">
          <label>Email:</label>
          <span>{userEmail}</span>
        </div>

        <div className="profile-row">
          <label htmlFor="dob">Date of Birth:</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            disabled={!isEditing}
          />
        </div>
        <div className="profile-row">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            readOnly={!isEditing}
          />
        </div>

        <div className="button-group">
          {isEditing ? (
            <button className="save-btn" onClick={handleSave}>Save</button>
          ) : (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
          )}
          <button className="home-btn" onClick={() => nav('/home')}>Home</button>
        </div>

        {success && <p className="message">{success}</p>}
      </div>
    </div>
  );
}

export default Profile;
