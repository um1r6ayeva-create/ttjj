import React from 'react';

import HeroSection from '../components/HeroSection/HeroSection';
import './HomePage.css'; // <-- Убедитесь, что импортируете
import News from '../components/News/News';

const HomePage: React.FC = () => {

  return (
    <div className="home-container"> {/* Добавить класс */}
      <HeroSection />
      <News/>
      {/* Дополнительные секции */}
    </div>
  );
};

export default HomePage;