import logo from '../assets/mainlogo.png';
import bg from '../assets/bg3.avif';
import './App.css';

import { useNavigate } from 'react-router-dom';
function LandingPage() {
    const nav=useNavigate()
  return (
    <div className="container">
      <header className="header">
        <div className="left">
          <img src={logo} alt="Logo" />
        </div>
        <div className="centre">
          <p>ShopSmart!</p>
        </div>
        <div className="right">
          <button onClick={()=>nav('signup')}>SignUp</button>
          <button onClick={()=>nav('signin')}>SignIn</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay">
          <h1>Welcome to Smart Shopping</h1>
          <p>Discover personalized suggestions, seamless browsing, and the best deals curated just for you.</p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
