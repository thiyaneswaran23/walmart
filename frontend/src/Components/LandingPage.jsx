import { useNavigate } from 'react-router-dom';
import logo from '../assets/mainlogo.png';
import './LandingPage.css';

function LandingPage() {
  const nav = useNavigate();
  
  return (
    <div className="landing-wrapper">
      {/* Navigation Header */}
      <header className="professional-navbar">
        <div className="nav-container">
          <div className="brand-section">
            <div className="logo-container">
              <img src={logo} alt="Logo" className="brand-logo" />
              <span className="brand-text">ShopSmart!</span>
            </div>
          </div>
          
          <div className="nav-actions">
            <button 
              className="nav-btn signup-btn"
              onClick={() => nav('signup')}
            >
              <span>SignUp</span>
              <div className="btn-glow"></div>
            </button>
            <button 
              className="nav-btn signin-btn"
              onClick={() => nav('signin')}
            >
              <span>SignIn</span>
              <div className="btn-glow"></div>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-masterpiece">
        <div className="hero-background-layers">
          <div className="gradient-layer-1"></div>
          <div className="gradient-layer-2"></div>
          <div className="floating-particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
          </div>
          <div className="geometric-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        
        <div className="hero-content-container">
          <div className="hero-content">
            <div className="content-wrapper">
              <div className="hero-badge">
                <span className="badge-icon">✨</span>
                <span className="badge-text">Trusted by 50,000+ sellers worldwide</span>
              </div>
              
              <h1 className="hero-title">
                <span className="title-line-1">Welcome to</span>
                <span className="title-line-2">
                  <span className="highlight-text">Smart Shopping</span>
                </span>
                <span className="title-line-3">Revolution</span>
              </h1>
              
              <p className="hero-description">
                Discover personalized suggestions, seamless browsing, and the best deals 
                curated just for you. Transform your shopping experience with our 
                cutting-edge platform designed for modern sellers.
              </p>
              
              <div className="hero-features">
                <div className="feature-item">
                  <div className="feature-icon">🚀</div>
                  <span>Lightning Fast</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔒</div>
                  <span>Secure & Trusted</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">📈</div>
                  <span>Boost Sales</span>
                </div>
              </div>
              
              <div className="hero-cta">
                <button className="cta-primary" onClick={() => nav('signup')}>
                  <span className="btn-text">Start Your Journey</span>
                  <div className="btn-shine"></div>
                  <div className="btn-ripple"></div>
                </button>
                <button className="cta-secondary">
                  <span className="btn-text">Watch Demo</span>
                  <div className="play-icon">▶</div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <div className="scroll-arrow">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-showcase">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Active Sellers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">2M+</div>
            <div className="stat-label">Products Sold</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support</div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="features-preview">
        <div className="features-container">
          <h2 className="features-title">Why Choose ShopSmart?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="card-icon">💎</div>
              <h3>Premium Quality</h3>
              <p>Curated products with guaranteed quality and authenticity</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">⚡</div>
              <h3>Lightning Speed</h3>
              <p>Ultra-fast loading and seamless shopping experience</p>
            </div>
            <div className="feature-card">
              <div className="card-icon">🎯</div>
              <h3>Smart Recommendations</h3>
              <p>AI-powered suggestions tailored to your preferences</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;