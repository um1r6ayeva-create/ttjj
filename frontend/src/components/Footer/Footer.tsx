import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt, faUsers } from '@fortawesome/free-solid-svg-icons';
import { faYoutube, faInstagram, faFacebookF, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-logo-section">
            <div className="footer-logo">
              <img src="logo.png" alt="Логотип ТУИТ" />
            </div>
            <div>
              <div className="university-full-name">{t('footer.university_name')}</div>
              <div className="university-subtitle">{t('footer.university_subtitle')}</div>
            </div>
          </div>

          <div className="social-section">
            <div className="social-title-container">
              <FontAwesomeIcon icon={faUsers} className="social-title-icon" />
              <span>{t('footer.social_title')}</span>
              <FontAwesomeIcon icon={faShareAlt} className="social-title-icon" />
            </div>
            <div className="social-links">
              <a href="https://youtube.com/channel/UC0aN4MLNCjMAyvUOgGXzBSA" className="social-link youtube" target="_blank" rel="noopener noreferrer" aria-label="YouTube канал">
                <FontAwesomeIcon icon={faYoutube} />
              </a>
              <a href="https://www.instagram.com/tuit.official?r=nametag" className="social-link instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram страница">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://www.facebook.com/TUIT1955" className="social-link facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook страница">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="https://t.me/tuituz_official" className="social-link telegram" target="_blank" rel="noopener noreferrer" aria-label="Telegram канал">
                <FontAwesomeIcon icon={faTelegram} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            {t('footer.copyright')} <a href="mailto:info@tuit.uz">info@tuit.uz</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
