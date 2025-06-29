import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {useEffect, useState} from 'react';
function Home() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  useEffect(()=>{
    axios.get('http://localhost:5000/api/auth/products').then((res)=>{
      console.log(res.data);
    }).catch((err)=>{
      console.error(err);
    })
  },[])
   


  return (
    <div>
      <h2>Welcome to Home Page</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Home;
