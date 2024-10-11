import { SetStateAction, useState } from 'react';
import { ICPHackthonAICertification_backend } from '../../../declarations/ICPHackthonAICertification_backend';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">FAI<span className="hero-title-red">3</span></h1>
          <img src="scale.png" alt="Scale" className='hero-image' />
          <p className="hero-subtitle">Fair AI for a better future.</p>
          <p className="hero-description">
            We certify AI models using Web3 technology to ensure transparency, trust, and improvement
            by standardizing metrics for fairness, accuracy, toxicity, and data quality.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/leaderboard")} className="btn btn-demo">View Demo</button>
            <a href="#whitepaper" className="btn btn-whitepaper">White Paper</a>
          </div>
        </div>
      </section>

      <section className="yellow-section">
        <div className="features-container">
          <div className="feature">
            <img src="ai_certification_icon.png" alt="AI certification on chain" />
            <h3>AI certification on chain</h3>
            <p>
              Once you evaluate your model, the scores stay on chain, generating a certification of your model evaluation.
            </p>
          </div>
          <div className="feature">
            <img src="improvement_report_icon.png" alt="Improvement report" />
            <h3>Improvement report</h3>
            <p>
              Based on the desegregated score obtain, you can (and should) improve your model on the weak dimensions. Don't know where to start? No worries. Our network of data scientists can help you out.
            </p>
          </div>
          <div className="feature">
            <img src="leaderboard_icon.png" alt="Leaderboard" />
            <h3>Leaderboard</h3>
            <p>
              Build your reputation on chain and let everyone know about your model performance!
            </p>
          </div>
        </div>
      </section>

      <section className="public-section">
        <h2>We need public, transparent and trustworthy AI certification</h2>
        <div className="news-articles">
          <div className="article">
            <img src="AmazonSexist.png" alt="BBC article" />
          </div>
          <div className="article">
            <img src="appleSexist.png" alt="CNN Business article" />
          </div>
          <div className="article">
            <img src="natureRacism.png" alt="Nature article" />
          </div>
        </div>
      </section>

      <section className="yellow-section center">
        <div className="howitworks-container">
          <div>
            <h2>How it works</h2>
            <p>
              1- Submit your model
            </p>
            <p>
              2- Obtain score report
            </p>
            <p>
              3- Check the leaderboard
            </p>
          </div>
          <div className='howitworks-image'>
            <img src="submitCode.png" alt="How it works" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
