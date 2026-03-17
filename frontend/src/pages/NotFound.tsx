import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotFound.css';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="not-found-page">
      <div className="container">
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.message')}</p>
        <Link to="/" className="back-home-btn">
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
