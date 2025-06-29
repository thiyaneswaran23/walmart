import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signin.css';

function Signin() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signin', {
        email,
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem("Id",res.data.user.id);
      nav("/home");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="rcontainer">
      <h1>Login</h1>
      <div className="rcontent">
        <label>Email:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
        />
        <br />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password..."
        />
        <button onClick={handleLogin}>Sign In</button>

        <p className="signup-prompt">New user?</p>
        <button className="signup-btn" onClick={() => nav("/signup")}>Register</button>
      </div>
    </div>
  );
}

export default Signin;
