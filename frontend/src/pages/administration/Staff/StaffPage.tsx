import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './StaffPage.css';

interface Person {
  id: number;
  positionKey: string;
  nameKey: string;
  photo: string;
  receptionKey: string;
  phone: string;
  email?: string;
}

const StaffPage: React.FC = () => {
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const { t } = useTranslation();

  // Данные сотрудников
  const staff: Person[] = [
    {
      id: 1,
      positionKey: 'positions.head',
      nameKey: 'people.arifdjanov',
      photo: 'staff/maxmud.jpg',
      receptionKey: 'receptions.arifdjanov',
      phone: '(+99895) 118-22-20',
      email: 'm.arifdjanov@tuit.uz'
    },
    {
      id: 2,
      positionKey: 'positions.educator',
      nameKey: 'people.raupova',
      photo: 'staff/dilfuza.jpg',
      receptionKey: 'receptions.raupova',
      phone: '(+99890) 955-83-06'
    },
    {
      id: 3,
      positionKey: 'positions.commandant',
      nameKey: 'people.abzamova',
      photo: 'staff/muyassar.jpg',
      receptionKey: 'receptions.abzamova',
      phone: '(+99893) 544-91-52'
    }
  ];

  const toggleCard = (id: number) => {
    setExpandedCards(prev =>
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    );
  };

  // Функция для получения перевода
  const getTranslation = (key: string) => {
    return t(`staff.${key}`);
  };

  return (
    <div className="staff-container">
      <h1 className="page-title fade-in">{getTranslation('pageTitle')}</h1>
      <p className="page-subtitle fade-in">{getTranslation('pageSubtitle')}</p>

      <div className="cards-container">
        {staff.map(person => (
          <div 
            key={person.id} 
            className={`person-card fade-in ${expandedCards.includes(person.id) ? 'active' : ''}`}
            onClick={() => toggleCard(person.id)}
          >
            <div className="person-photo">
              <img src={person.photo} alt={getTranslation(person.nameKey)} />
            </div>
            <div className="expand-icon">
              {expandedCards.includes(person.id) 
                ? getTranslation('expandCollapse.collapse') 
                : getTranslation('expandCollapse.expand')}
            </div>
            <div className="person-info">
              <div className="person-position">{getTranslation(person.positionKey)}</div>
              <h2 className="person-name">{getTranslation(person.nameKey)}</h2>
              <div className={`person-details ${expandedCards.includes(person.id) ? 'active' : ''}`}>
                <div className="detail-item">
                  <span className="detail-label">{getTranslation('details.reception')}:</span>
                  <span className="detail-value">{getTranslation(person.receptionKey)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{getTranslation('details.phone')}:</span>
                  <span className="detail-value">{person.phone}</span>
                </div>
                {person.email && (
                  <div className="detail-item">
                    <span className="detail-label">{getTranslation('details.email')}:</span>
                    <span className="detail-value">
                      <a href={`mailto:${person.email}`} className="email-link" onClick={(e) => e.stopPropagation()}>
                        {person.email}
                      </a>
                    </span>
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

export default StaffPage;