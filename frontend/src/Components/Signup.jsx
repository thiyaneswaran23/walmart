import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';

function Signup() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();
    const [confirmPassword, setConfirmPassword] = useState('');
   


  const handleRegister = async () => {
    if(!email || !gender || !password || !confirmPassword)
    {
      alert("Enter all the fields correctly, missing field found");
      return;
    }
    

      if (password !== confirmPassword) {
      alert("Ensure your password correctly ");
      return;
    }

  try {
    const res = await axios.post('http://localhost:5000/api/auth/signup', {
      name,
      gender,
      email,
      password,
    });

    if (res.data) 
    {
      localStorage.setItem("token", res.data.token);         
      localStorage.setItem("Id",res.data.newUser.id);
      localStorage.setItem("email", res.data.newUser.email);
      localStorage.setItem("Name",res.data.newUser.name);
      localStorage.setItem("Gender",res.data.newUser.gender);
      nav("/home");                                 
    }
    else 
    {
      alert("Invalid token");
    }

  } catch (err) {
    alert(err.response || "Registration failed");
  }
};


  return (
    <div className="rcontainer">
      <div className="rcontent">
        <h1 className="form-heading">Register</h1>

        <label htmlFor="name">Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
        />

        <label htmlFor="gender">Gender:</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label htmlFor="email">Email:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password..."
        />
        <label>Confirm Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password..."
        />

        <button onClick={handleRegister}>Register</button>

        <p className="login-prompt">Already registered?</p>
        <button className="login-btn" onClick={() => nav("/signin")}>SignIn</button>
      </div>
    </div>
  );
}

export default Signup;
