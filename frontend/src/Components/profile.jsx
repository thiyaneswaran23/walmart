import{useState,useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import './profile.css'
function Profile(){
    const[userName,setUserName]=useState('');
    const[userGender,setUserGender]=useState('');
    const[userEmail,setUserEmail]=useState('');

    const nav=useNavigate();

   useEffect(()=>{
       const name= localStorage.getItem("Name");
   const gender= localStorage.getItem("Gender");
   const email= localStorage.getItem("email");
   setUserName(name);
   setUserGender(gender);
   setUserEmail(email);
   },[])

   return (
  <div className="profile-container">
    <div className="profile-card">
      <h2>Your Profile</h2>
      <p>Name: <span>{userName}</span></p>
      <p>Gender: <span>{userGender}</span></p>
      <p>Email: <span>{userEmail}</span></p>
      <button onClick={() => nav('/home')}>Go to Home</button>
    </div>
  </div>
);


}
export default Profile;