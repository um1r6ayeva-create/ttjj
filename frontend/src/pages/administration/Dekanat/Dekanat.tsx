import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Dekanat.css';

interface Person {
  id: number;
  faculty: string;
  positionKey: string;
  nameKey: string;
  photo: string;
  receptionKey: string;
  phone: string;
  email: string;
  extraInfoKey?: string;
}

interface FacultyInfo {
  id: string;
  nameKey: string;
  descriptionKey: string;
}

const DekanatPage: React.FC = () => {
  const [activeFaculty, setActiveFaculty] = useState<string>('prof_education');
  const [activeCard, setActiveCard] = useState<number | null>(null); // Изменили здесь
  const { t } = useTranslation();
  
  // Данные факультетов
  const faculties: FacultyInfo[] = [
    { id: 'prof_education', nameKey: 'faculties.profEducation.name', 
      descriptionKey: 'faculties.profEducation.description' },
    { id: 'computer_eng', nameKey: 'faculties.computerEng.name', 
      descriptionKey: 'faculties.computerEng.description' },
    { id: 'software_eng', nameKey: 'faculties.softwareEng.name', 
      descriptionKey: 'faculties.softwareEng.description' },
    { id: 'cybersecurity', nameKey: 'faculties.cybersecurity.name', 
      descriptionKey: 'faculties.cybersecurity.description' },
    { id: 'telecom', nameKey: 'faculties.telecom.name', 
      descriptionKey: 'faculties.telecom.description' },
    { id: 'tv_tech', nameKey: 'faculties.tvTech.name', 
      descriptionKey: 'faculties.tvTech.description' },
    { id: 'radio_mobile', nameKey: 'faculties.radioMobile.name', 
      descriptionKey: 'faculties.radioMobile.description' },
    { id: 'economics', nameKey: 'faculties.economics.name', 
      descriptionKey: 'faculties.economics.description' },
  ];

  // Данные деканов
  const people: Person[] = [
    // Факультет профессионального образования в сфере ИКТ
    { id: 1, faculty: 'prof_education', positionKey: 'positions.dean', 
      nameKey: 'people.igamberdiev', 
      photo: 'https://static.tuit.uz/uploads/1/fQ-EU47cDwGiunI9QOKwAxJFsFGkeI6j.png',
      receptionKey: 'receptions.profEducation.dean',
      phone: '(+99871) 238-65-00', email: 'igamberdiyev@gmail.com' },
    { id: 2, faculty: 'prof_education', positionKey: 'positions.youthDeputy', 
      nameKey: 'people.norbekov', 
      photo: 'https://static.tuit.uz/uploads/1/6VwOFvL43VgPFGp-9BjEQH6svdmrEvKP.png',
      receptionKey: 'receptions.profEducation.youth',
      phone: '(+99871) 238-65-08', email: 's.norbekov@gmail.com' },
    { id: 3, faculty: 'prof_education', positionKey: 'positions.academicDeputy', 
      nameKey: 'people.normatov', 
      photo: 'https://static.tuit.uz/uploads/1/1cScZKuHGZIg4dxcPrDdSMLBrcQGAtDR.png',
      receptionKey: 'receptions.profEducation.academic',
      phone: '(+99871) 238-65-08', email: 'o.normatov@gmail.com' },
    
    // Факультет компьютерной инженерии
    { id: 4, faculty: 'computer_eng', positionKey: 'positions.dean', 
      nameKey: 'people.kuchkorov', 
      photo: 'https://static.tuit.uz/uploads/1/2Xfmw6nnh30Sxp9nUGR16WcrD7b0ppuK.png',
      receptionKey: 'receptions.computerEng.dean',
      phone: '(+99871) 207-59-45', email: 't.kuchkorov@gmail.com' },
    { id: 5, faculty: 'computer_eng', positionKey: 'positions.youthDeputy', 
      nameKey: 'people.karimovAbdulatif', 
      photo: 'https://static.tuit.uz/uploads/1/Q_TQw3_-LhZ4MkJOIHMNmOSQmmeObA3Q.png',
      receptionKey: 'receptions.computerEng.youth',
      phone: '(+99871) 207-59-46', email: 'abdulatifkarimoff@gmail.com' },
    { id: 6, faculty: 'computer_eng', positionKey: 'positions.academicDeputy', 
      nameKey: 'people.karimovSardor', 
      photo: 'https://static.tuit.uz/uploads/1/pSz2gl6svgG41os7pbxE5Sf3_UdUpocC.png',
      receptionKey: 'receptions.computerEng.academic',
      phone: '(+99871) 207-59-46', email: 's.karimov@tuit.uz' },
    
    // Факультет программной инженерии
    { id: 7, faculty: 'software_eng', positionKey: 'positions.dean', 
      nameKey: 'people.ruzibaev', 
      photo: 'https://static.tuit.uz/uploads/1/CWJBU9xuPz1kIpk4yl-CboQOVLoFaAeS.png',
      receptionKey: 'receptions.softwareEng.dean',
      phone: '(+99871) 238-64-08', email: 'o.ruzibaev@gmail.com' },
    { id: 8, faculty: 'software_eng', positionKey: 'positions.academicDeputy', 
      nameKey: 'people.suvonov', 
      photo: 'https://static.tuit.uz/uploads/1/vYbwLmWLe8DBYn762Cggff-mq_4a-UKm.png',
      receptionKey: 'receptions.softwareEng.academic',
      phone: '(+99871) 238-64-42', email: 'Не указан' },
    { id: 9, faculty: 'software_eng', positionKey: 'positions.youthDeputy', 
      nameKey: 'people.shirinov', 
      photo: 'https://static.tuit.uz/uploads/1/4VAXKzrBvnw9vmcr6S2LSzEM-7cq-3sW.png',
      receptionKey: 'receptions.softwareEng.youth',
      phone: '(+99871) 238-64-42', email: 'shirinovlaziz05@gmail.com' },
    
    // Факультет кибербезопасности
    { id: 10, faculty: 'cybersecurity', positionKey: 'positions.dean', 
      nameKey: 'people.nasrullayev', 
      photo: 'https://static.tuit.uz/uploads/1/aEGs-YG5X9ckKeV402h7VoVUSoiRb2_L.png',
      receptionKey: 'receptions.cybersecurity.dean',
      phone: '(+99871) 238-64-79', email: 'n.nasrullayev@gmail.com' },
    { id: 11, faculty: 'cybersecurity', positionKey: 'positions.youthDeputy', 
      nameKey: 'people.berdiboyev', 
      photo: 'https://static.tuit.uz/uploads/1/sa6X24RAvzU2bKgehe4SifH0CxO5luzR.png',
      receptionKey: 'receptions.cybersecurity.youth',
      phone: '(+99871) 238-65-59', email: 'o.berdiboyev@gmail.com' },
    { id: 12, faculty: 'cybersecurity', positionKey: 'positions.academicDeputy', 
      nameKey: 'people.shukurov', 
      photo: 'https://static.tuit.uz/uploads/1/xx_dMT_FwNKHZAt5u3qzLn5I9T_6hAOq.png',
      receptionKey: 'receptions.cybersecurity.academic',
      phone: '(+99871) 238-65-59', email: 'o.shukurov@gmail.com' },
    
    // Факультет телекоммуникационных технологий
    { id: 13, faculty: 'telecom', positionKey: 'positions.dean', 
      nameKey: 'people.madaminov', 
      photo: 'https://static.tuit.uz/uploads/1/v0knoU0vNmuG6rOGsspX6eVYb1XIrk9W.png',
      receptionKey: 'receptions.telecom.dean',
      phone: '(+99871) 238-65-64', email: 'h.madaminov@gmail.com' },
    { id: 14, faculty: 'telecom', positionKey: 'positions.academicDeputy', 
      nameKey: 'people.usmanov', 
      photo: 'https://static.tuit.uz/uploads/1/kG2yJ5PIoMEZCm488B3AtoUuvzL1_a9W.png',
      receptionKey: 'receptions.telecom.academic',
      phone: '(+99871) 238-65-54', email: 'b.usmanov@gmail.com' },
    { id: 15, faculty: 'telecom', positionKey: 'positions.youthDeputy', 
      nameKey: 'people.ochilov', 
      photo: 'https://static.tuit.uz/uploads/1/QTzlN746ZpJOL2dO8G1sVs7YsivqacNC.png',
      receptionKey: 'receptions.telecom.youth',
      phone: '(+99871) 238-65-54', email: 'l.ochilov@gmail.com' },
    
    // Факультет телевизионных технологий
    { id: 16, faculty: 'tv_tech', positionKey: 'positions.dean', 
      nameKey: 'people.nazirova', 
      photo: 'https://static.tuit.uz/uploads/1/FjqjRMgOtPG39zg3SdZxjutHpiwYbQUC.png',
      receptionKey: 'receptions.tvTech.dean',
      phone: '(+99871) 238-65-28', email: 'e.nazirova@gmail.com' },
    { id: 17, faculty: 'tv_tech', positionKey: 'positions.youthDeputy', 
      nameKey: 'people.muminov', 
      photo: 'https://static.tuit.uz/uploads/1/O6fylzqhiDdN4pqQgm_70NcxzvlAjQHM.png',
      receptionKey: 'receptions.tvTech.youth',
      phone: '(+99871) 238-65-75', email: 's.muminov@gmail.com' },
    { id: 18, faculty: 'tv_tech', positionKey: 'positions.academicDeputy', 
      nameKey: 'people.tuyakov', 
      photo: 'https://static.tuit.uz/uploads/1/gY26Z9QWU7kWb-p9NHzSSZwYyMUN7wxo.png',
      receptionKey: 'receptions.tvTech.academic',
      phone: '(+99871) 238-65-75', email: 'o.tuyakov@gmail.com' },
    
    // Факультет радио- и мобильной связи
    { id: 19, faculty: 'radio_mobile', positionKey: 'positions.dean', 
      nameKey: 'people.sattarov', 
      photo: 'https://static.tuit.uz/uploads/1/6LFRtHPjCGpqKX3UEzYdnz6WhoKjGSL0.png',
      receptionKey: 'receptions.radioMobile.dean',
      phone: '(+99871) 238-64-21', email: 's.xurshid@gmail.com',
      extraInfoKey: 'extraInfo.sattarov' },
    { id: 20, faculty: 'radio_mobile', positionKey: 'positions.academicDeputy', 
      nameKey: 'people.teshaboyev', 
      photo: 'https://static.tuit.uz/uploads/1/4iWLiFht3wJ1eCJOd7Xdr0AlA3IPJ-Tt.png',
      receptionKey: 'receptions.radioMobile.academic',
      phone: '(+99871) 238-65-51', email: 'teshaboyev@gmail.com' },
    { id: 21, faculty: 'radio_mobile', positionKey: 'positions.youthDeputy', 
      nameKey: 'people.badalov', 
      photo: 'https://static.tuit.uz/uploads/1/YwEhDEylhjwLupCF8PB71nzKyFlNw9tA.png',
      receptionKey: 'receptions.radioMobile.youth',
      phone: '(+99871) 238-65-51', email: 'j.badalov@gmail.com' },
    
    // Факультет экономики и менеджмента
    { id: 22, faculty: 'economics', positionKey: 'positions.dean', 
      nameKey: 'people.saitkamolov', 
      photo: 'https://static.tuit.uz/uploads/1/whc7ADN4Ty_U3h20dP5RRAk2Rk0Wm5Eh.png',
      receptionKey: 'receptions.economics.dean',
      phone: '(+99871) 238-64-09', email: 'm.saitkamolov@gmail.com' },
    { id: 23, faculty: 'economics', positionKey: 'positions.academicDeputy', 
      nameKey: 'people.nurmukhamedova', 
      photo: 'https://static.tuit.uz/uploads/1/okRvdKfN4EPyXfrWMdrEvt_YKpNeXQf2.png',
      receptionKey: 'receptions.economics.academic',
      phone: '(+99871) 238-64-35', email: 'd.nurmukhamedova@gmail.com' },
    { id: 24, faculty: 'economics', positionKey: 'positions.youthDeputy', 
      nameKey: 'people.zaripov', 
      photo: 'https://static.tuit.uz/uploads/1/1jNrOVVV6MAAVzMl_A63uOdx_lkXfksH.png',
      receptionKey: 'receptions.economics.youth',
      phone: '(+99871) 238-64-35', email: 'zaripov.a@gmail.com',
      extraInfoKey: 'extraInfo.zaripov' },
  ];

  const filteredPeople = people.filter(person => person.faculty === activeFaculty);
  const currentFaculty = faculties.find(f => f.id === activeFaculty);

  // Логика как в RectoratePage - аккордеон
  const toggleCard = (id: number) => {
    setActiveCard(activeCard === id ? null : id);
  };

  const handleFacultyChange = (facultyId: string) => {
    setActiveFaculty(facultyId);
    setActiveCard(null); // Сбрасываем активную карточку при смене факультета
  };

  // Функция для получения перевода
  const getTranslation = (key: string) => {
    return t(`dekanat.${key}`);
  };

  return (
    <div className="dekanat-container">
      <h1 className="page-title fade-in">{getTranslation('pageTitle')}</h1>
      <p className="page-subtitle fade-in">{getTranslation('pageSubtitle')}</p>

      <div className="faculty-tabs">
        {faculties.map(faculty => (
          <button 
            key={faculty.id}
            className={`faculty-tab ${activeFaculty === faculty.id ? 'active' : ''}`} 
            onClick={() => handleFacultyChange(faculty.id)}
          >
            {getTranslation(faculty.nameKey)}
          </button>
        ))}
      </div>

      {currentFaculty && (
        <div className="faculty-info fade-in">
          <h2 className="faculty-name">{getTranslation(currentFaculty.nameKey)}</h2>
          <p className="faculty-description">{getTranslation(currentFaculty.descriptionKey)}</p>
        </div>
      )}

      <div className="cards-container">
        {filteredPeople.map(person => (
          <div 
            key={person.id} 
            className={`person-card fade-in ${activeCard === person.id ? 'active' : ''}`} // Изменили здесь
            onClick={() => toggleCard(person.id)}
          >
            <div className="person-photo">
              <img src={person.photo} alt={getTranslation(person.nameKey)} />
            </div>
            <div className="expand-icon">
              {activeCard === person.id // Изменили здесь
                ? getTranslation('expandCollapse.collapse') 
                : getTranslation('expandCollapse.expand')}
            </div>
            <div className="person-info">
              <div className="person-position">{getTranslation(person.positionKey)}</div>
              <h2 className="person-name">{getTranslation(person.nameKey)}</h2>
              <div className={`person-details ${activeCard === person.id ? 'active' : ''}`}> {/* Изменили здесь */}
                <div className="detail-item">
                  <span className="detail-label">{getTranslation('details.reception')}:</span>
                  <span className="detail-value">{getTranslation(person.receptionKey)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{getTranslation('details.phone')}:</span>
                  <span className="detail-value">{person.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{getTranslation('details.email')}:</span>
                  <span className="detail-value">
                    {person.email !== 'Не указан' ? (
                      <a href={`mailto:${person.email}`} className="email-link" onClick={(e) => e.stopPropagation()}>
                        {person.email}
                      </a>
                    ) : (
                      getTranslation('notSpecified')
                    )}
                  </span>
                </div>
                {person.extraInfoKey && (
                  <div className="detail-item">
                    <span className="detail-label">{getTranslation('details.additional')}:</span>
                    <span className="detail-value">{getTranslation(person.extraInfoKey)}</span>
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

export default DekanatPage;