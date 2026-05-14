import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to TireSupply By SABYER</h1>
          <p>Your trusted partner for premium tires and automotive supplies</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary btn-large">
              Browse Products
            </Link>
            <button className="btn btn-outline btn-large" onClick={scrollToFeatures}>
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="tire-icon">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="14" opacity="0.15" />
              <circle cx="60" cy="60" r="30" fill="none" stroke="currentColor" strokeWidth="14" />
              <g stroke="currentColor" strokeWidth="10" strokeLinecap="round">
                <line x1="60" y1="10" x2="60" y2="34" />
                <line x1="60" y1="110" x2="60" y2="86" />
                <line x1="10" y1="60" x2="34" y2="60" />
                <line x1="110" y1="60" x2="86" y2="60" />
                <line x1="26" y1="26" x2="38" y2="38" />
                <line x1="94" y1="94" x2="82" y2="82" />
                <line x1="26" y1="94" x2="38" y2="82" />
                <line x1="94" y1="26" x2="82" y2="38" />
              </g>
            </svg>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose TireSupply Pro?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable delivery to your doorstep</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Premium Quality</h3>
              <p>Only the best tires from trusted manufacturers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Competitive pricing with great discounts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛠️</div>
              <h3>Expert Support</h3>
              <p>Professional advice and customer support</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied customers</p>
          <Link to="/products" className="btn btn-primary btn-large">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home