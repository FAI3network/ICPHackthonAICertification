import { SetStateAction, useEffect, useState } from 'react';
import { ICPHackthonAICertification_backend } from '../../../declarations/ICPHackthonAICertification_backend';
import { useNavigate } from 'react-router-dom';

const instructions = [
  {
    title: '1- Submit your model',
    description: 'Upload your code, test set and weights',
    image: 'submitCode.png'
  },
  {
    title: '2- Get report',
    description: 'Get report with the scores calculated',
    image: 'report.png'
  },
  {
    title: '3- See leaderboard',
    description: 'See your score in the leaderboard and how you compare to others',
    image: 'leaderboard.png'
  }
]

function App() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [currentInstruction, setCurrentInstruction] = useState(instructions[0]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = (event.target as HTMLFormElement).elements.namedItem('name') as HTMLInputElement | null;
    const nameValue = name?.value;
    if (nameValue) {
      ICPHackthonAICertification_backend.greet(nameValue).then((greeting: SetStateAction<string>) => {
      });
    }
    return false;
  }

  function cycleInstructions() {
    const currentIndex = instructions.indexOf(currentInstruction);
    const nextIndex = (currentIndex + 1) % instructions.length;
    setCurrentInstruction(instructions[nextIndex]);
  }

  useEffect(() => {
    const interval = setInterval(cycleInstructions, 5000);
    return () => clearInterval(interval);
  }, [currentInstruction]);

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
        <div className="features-container max-width">
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
          <table>
            <tr>
              <th>
                <div className="article">
                  <img src="AmazonSexist.png" alt="BBC article" />
                </div>
              </th>
              <th>
                <div className="article">
                  <img src="appleSexist.png" alt="CNN Business article" />
                </div>
              </th>
            </tr>

            <tr>
              <th colSpan={2}>
                <div className="article">
                  <img src="natureRacism.png" alt="Nature article" />
                </div>
              </th>
            </tr>
          </table>
        </div>
      </section>

      <section className="yellow-container">
        <div className="howitworks-container">
          <div className="howitworks-content">
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
          <div className="howitworks-image">
            <img src={`${currentInstruction.image}`} alt="How it works" />
          </div>
        </div>

        <div className="floating-tab">
          <h3>{currentInstruction.title}</h3>
          <p>{currentInstruction.description}</p>
        </div>
      </section>
    </div>
  );
}

export default App;
