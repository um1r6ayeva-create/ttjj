import React from 'react';
import './HeroSection.css';
import { useTranslation } from 'react-i18next';

const HeroSection: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <section className="hero-section">
            <div className="hero-container2">
                <h1 className="hero-title">
                    {t('hero.title')}
                </h1>
                <p className="hero-subtitle">
                    {t('hero.subtitle')}
                </p>
                <div className="hero-buttons">
                    <a href="#news" className="hero-btn">
                        {t('hero.news_button')}
                    </a>
                    <a 
                        href="https://tuit.uz" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hero-btn secondary"
                    >
                        {t('hero.official_button')}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;