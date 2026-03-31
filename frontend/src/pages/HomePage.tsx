import React from 'react';

import HeroSection from '../components/HeroSection/HeroSection';
import './HomePage.css'; // <-- Убедитесь, что импортируете
import News from '../components/News/News';
import VideoPlayer from '../components/VideoPlayer/VideoPlayer';

const HomePage: React.FC = () => {

  return (
    <div className="home-container"> {/* Добавить класс */}
      <HeroSection />
      <section className="video-section">
        <div className="video-container">
          <div className="video-grid">
            <VideoPlayer 
              title="О сайте" 
              description="Узнайте больше о возможностях и структуре нашего сайта." 
              src="https://youtu.be/Ee-Fau0AabY?si=Et9nsdWUmPQ1MjtE"
            />
            <VideoPlayer 
              title="Регистрация" 
              description="Пошаговая инструквая по регистрации в системе." 
              src="https://youtu.be/tl8SfSijW6U?si=izEBjKw1h9ODtnu0"
            />
          </div>
        </div>
      </section>
      <News/>
      {/* Дополнительные секции */}
    </div>
  );
};

export default HomePage;