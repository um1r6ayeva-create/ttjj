import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './RectoratePage.css';

interface PersonCard {
  id: number;
  photo: string;
  positionKey: string;
  nameKey: string;
  degreeKey: string;
  scheduleKey: string;
  phone: string;
  email: string;
  dutiesKey?: string;
  altKey: string;
}

const RectoratePage: React.FC = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const { t } = useTranslation();

  const toggleCard = (id: number) => {
    setActiveCard(activeCard === id ? null : id);
  };

  const rectorateData: PersonCard[] = [
    {
      id: 1,
      photo: '/images/rektor.jpg',
      positionKey: 'positions.rector',
      nameKey: 'persons.mahkamov',
      degreeKey: 'degrees.mahkamov',
      scheduleKey: 'schedules.mahkamov',
      phone: '(+99871) 238-64-15',
      email: 'b.maxkamo@gmail.com',
      altKey: 'positions.rector'
    },
    {
      id: 2,
      photo: '/images/prorektor1.jpg',
      positionKey: 'positions.firstViceRector',
      nameKey: 'persons.yakhshibayev',
      degreeKey: 'degrees.yakhshibayev',
      scheduleKey: 'schedules.yakhshibayev',
      phone: '(+99871) 238-65-24',
      email: 'd.yaxshibayev@gmail.com',
      dutiesKey: 'duties.yakhshibayev',
      altKey: 'positions.firstViceRector'
    },
    {
      id: 3,
      photo: '/images/sultanov.jpg',
      positionKey: 'positions.viceRectorAcademic',
      nameKey: 'persons.sultanov',
      degreeKey: 'degrees.sultanov',
      scheduleKey: 'schedules.sultanov',
      phone: '(+99871) 238-64-63',
      email: 'vice-rector@gmail.com',
      dutiesKey: 'duties.sultanov',
      altKey: 'positions.viceRectorAcademic'
    },
    {
      id: 4,
      photo: '/images/tashaev.jpg',
      positionKey: 'positions.viceRectorResearch',
      nameKey: 'persons.tashev',
      degreeKey: 'degrees.tashev',
      scheduleKey: 'schedules.tashev',
      phone: '(+99871) 238-65-85',
      email: 'k.tashev@gmail.com',
      dutiesKey: 'duties.tashev',
      altKey: 'positions.viceRectorResearch'
    },
    {
      id: 5,
      photo: '/images/toshmatov.jpg',
      positionKey: 'positions.viceRectorFinance',
      nameKey: 'persons.toshmatov',
      degreeKey: 'degrees.toshmatov',
      scheduleKey: 'schedules.toshmatov',
      phone: '(+99871) 238-65-31',
      email: 'toshmatov.s@gmail.com',
      dutiesKey: 'duties.toshmatov',
      altKey: 'positions.viceRectorFinance'
    },
    {
      id: 6,
      photo: '/images/toraev.jpg',
      positionKey: 'positions.viceRectorRegional',
      nameKey: 'persons.turaev',
      degreeKey: 'degrees.turaev',
      scheduleKey: 'schedules.turaev',
      phone: '(+99871) 207-59-51',
      email: 'sh.turaev@gmail.com',
      dutiesKey: 'duties.turaev',
      altKey: 'positions.viceRectorRegional'
    }
  ];

  // Функция для получения перевода с префиксом 'rectorate'
  const getTranslation = (key: string) => {
    return t(`rectorate.${key}`);
  };

  return (
    <div className="container">
      <h1 className="page-title fade-in">
        {getTranslation('pageTitle')}
      </h1>
      <p className="page-subtitle fade-in">
        {getTranslation('pageSubtitle')}
      </p>
      
      <div className="cards-container">
        {rectorateData.map((person) => (
          <div 
            key={person.id}
            className={`person-card fade-in ${activeCard === person.id ? 'active' : ''}`}
            onClick={() => toggleCard(person.id)}
          >
            <div className="person-photo">
              <img src={person.photo} alt={getTranslation(person.altKey)} />
            </div>
            <div className="expand-icon">
              {getTranslation('expandIcon')}
            </div>
            <div className="person-info">
              <div className="person-position">
                {getTranslation(person.positionKey)}
              </div>
              <h2 className="person-name">
                {getTranslation(person.nameKey)}
              </h2>
              <div className="person-degree">
                {getTranslation(person.degreeKey)}
              </div>
              <div className="person-details">
                <div className="detail-item">
                  <span className="detail-label">{getTranslation('details.schedule')}</span>
                  <span className="detail-value">{getTranslation(person.scheduleKey)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{getTranslation('details.phone')}</span>
                  <span className="detail-value">{person.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{getTranslation('details.email')}</span>
                  <span className="detail-value">
                    <a href={`mailto:${person.email}`} className="email-link">
                      {person.email}
                    </a>
                  </span>
                </div>
                {person.dutiesKey && (
                  <div className="detail-item">
                    <span className="detail-label">{getTranslation('details.duties')}</span>
                    <span className="detail-value">{getTranslation(person.dutiesKey)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="back-btn-container">
        <Link to="/" className="back-btn">
          {getTranslation('backBtn')}
        </Link>
      </div>
    </div>
  );
};

export default RectoratePage;