import { useNavigate } from 'react-router-dom';
import logo from '../assets/mainlogo.png';
function LandingPage() {
  const nav = useNavigate();
  
  return (
    <div className="container-fluid p-0">
      <header className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3">
        <div className="container">
          <div className="navbar-brand d-flex align-items-center">
            <img src={logo} alt="Logo" height="40" className="me-3" />
            <span className="fs-3 fw-bold text-primary">ShopSmart!</span>
          </div>
          
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-primary px-4 py-2 rounded-pill fw-medium"
              onClick={() => nav('signup')}
            >
              SignUp
            </button>
            <button 
              className="btn btn-primary px-4 py-2 rounded-pill fw-medium shadow-sm"
              onClick={() => nav('signin')}
            >
              SignIn
            </button>
          </div>
        </div>
      </header>

      <section className="hero-section position-relative overflow-hidden">
        <div className="hero-background position-absolute top-0 start-0 w-100 h-100"></div>
        <div className="container position-relative">
          <div className="row min-vh-100 align-items-center justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="hero-content text-white">
                <h1 className="display-3 fw-bold mb-4 animate-fade-up">
                  Welcome to <span className="text-warning">Smart Shopping</span>
                </h1>
                <p className="lead mb-5 fs-4 animate-fade-up-delay">
                  Discover personalized suggestions, seamless browsing, and the best deals curated just for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        
        .hero-background {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          opacity: 0.9;
        }
        
        .animate-fade-up {
          animation: fadeUp 1s ease-out;
        }
        
        .animate-fade-up-delay {
          animation: fadeUp 1s ease-out 0.3s both;
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .btn {
          transition: all 0.3s ease;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .navbar-brand img {
          transition: transform 0.3s ease;
        }
        
        .navbar-brand:hover img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}

export default LandingPage;