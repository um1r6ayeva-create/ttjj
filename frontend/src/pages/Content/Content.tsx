import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Content.css';

interface PhotoData {
  id: number;
  imgSrc: string;
  altKey: string;
  titleKey: string;
  descriptionKey: string;
  clinicInfo?: {
    address: string;
    schedule: Array<{
      dayKey: string;
      time: string;
    }>;
    phones: {
      registry: string;
      info: string;
    };
    servicesKey: string;
  };
}

const Content: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  // Инициализация данных фотогалереи
  useEffect(() => {
    const photoData: PhotoData[] = [
      {
        id: 1,
        imgSrc: 'dormitory.jpg',
        altKey: 'photos.dormitory.alt',
        titleKey: 'photos.dormitory.title',
        descriptionKey: 'photos.dormitory.description'
      },
      {
        id: 2,
        imgSrc: 'library.jpg',
        altKey: 'photos.library.alt',
        titleKey: 'photos.library.title',
        descriptionKey: 'photos.library.description'
      },
      {
        id: 3,
        imgSrc: 'reading-room.jpg',
        altKey: 'photos.reading_room.alt',
        titleKey: 'photos.reading_room.title',
        descriptionKey: 'photos.reading_room.description'
      },
      {
        id: 4,
        imgSrc: 'manaviyat.jpg',
        altKey: 'photos.manaviyat.alt',
        titleKey: 'photos.manaviyat.title',
        descriptionKey: 'photos.manaviyat.description'
      },
      {
        id: 5,
        imgSrc: 'commandant.jpg',
        altKey: 'photos.commandant.alt',
        titleKey: 'photos.commandant.title',
        descriptionKey: 'photos.commandant.description'
      },
      {
        id: 6,
        imgSrc: 'sewing.jpg',
        altKey: 'photos.sewing.alt',
        titleKey: 'photos.sewing.title',
        descriptionKey: 'photos.sewing.description'
      },
      {
        id: 7,
        imgSrc: 'medpoint.jpg',
        altKey: 'photos.medpoint.alt',
        titleKey: 'photos.medpoint.title',
        descriptionKey: 'photos.medpoint.description'
      },
      {
        id: 8,
        imgSrc: 'procedure-room.jpg',
        altKey: 'photos.procedure_room.alt',
        titleKey: 'photos.procedure_room.title',
        descriptionKey: 'photos.procedure_room.description'
      },
      {
        id: 9,
        imgSrc: 'polyclinic.jpg',
        altKey: 'photos.polyclinic.alt',
        titleKey: 'photos.polyclinic.title',
        descriptionKey: 'photos.polyclinic.description',
        clinicInfo: {
          address: t('photos.polyclinic.clinicInfo.address'),
          schedule: [
            { dayKey: 'days.monday', time: '08:00–20:00' },
            { dayKey: 'days.tuesday', time: '08:00–20:00' },
            { dayKey: 'days.wednesday', time: '08:00–20:00' },
            { dayKey: 'days.thursday', time: '08:00–20:00' },
            { dayKey: 'days.friday', time: '08:00–20:00' },
            { dayKey: 'days.saturday', time: '08:00–20:00' },
            { dayKey: 'days.sunday', time: t('photos.polyclinic.clinicInfo.day_off') }
          ],
          phones: {
            registry: '+998 71 235 69 51',
            info: '+998 71 235 81 01'
          },
          servicesKey: 'photos.polyclinic.clinicInfo.services'
        }
      }
    ];
    setPhotos(photoData);
  }, [t]);

  const openPhotoModal = (photo: PhotoData) => {
    setSelectedPhoto(photo);
    setShowModal(true);
  };

  const closePhotoModal = () => {
    setShowModal(false);
    setSelectedPhoto(null);
  };

  const showLocation = () => {
    const mapUrl = "https://yandex.uz/maps/10335/tashkent/house/YkAYdA9iSE0HQFprfX9zeHtrZQ==/";
    window.open(mapUrl, '_blank');
  };

  return (
    <div className="content-container">
      {/* Основной контент */}
      <section className="gallery-section fade-in">
        <h2 className="section-title">{t('content.gallery_title')}</h2>
        
        <div className="gallery-container">
          {photos.map((photo) => (
            <div className="photo-card" key={photo.id}>
              <div className="photo-wrapper">
                {photo.imgSrc ? (
                  <img 
                    src={photo.imgSrc} 
                    alt={t(photo.altKey)} 
                    className="photo-img"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="photo-placeholder">
                  <i className={`fas ${
                    photo.id === 1 ? 'fa-building' :
                    photo.id === 2 || photo.id === 3 ? 'fa-book' :
                    photo.id === 4 ? 'fa-pray' :
                    photo.id === 5 ? 'fa-user-shield' :
                    photo.id === 6 ? 'fa-tshirt' :
                    photo.id === 7 || photo.id === 8 ? 'fa-clinic-medical' :
                    'fa-hospital'
                  }`}></i>
                  <span>{t(photo.titleKey)}</span>
                </div>
              </div>
              
              <div className="photo-caption">{t(photo.titleKey)}</div>
              
              <div className="photo-description">
                {photo.clinicInfo ? (
                  <div className="clinic-info">
                    <p><strong>{t('content.address')}:</strong> {photo.clinicInfo.address}</p>
                    <p><strong>{t('content.schedule')}:</strong></p>
                    <ul>
                      {photo.clinicInfo.schedule.map((item, index) => (
                        <li key={index}>{t(item.dayKey)}: {item.time}</li>
                      ))}
                    </ul>
                    <p><strong>{t('content.phones')}:</strong><br />
                      {t('content.registry')}: {photo.clinicInfo.phones.registry}<br />
                      {t('content.info_phone')}: {photo.clinicInfo.phones.info}
                    </p>
                    <p><strong>{t('content.services')}:</strong> {t(photo.clinicInfo.servicesKey)}</p>
                  </div>
                ) : (
                  t(photo.descriptionKey)
                )}
              </div>
              
              <div className="photo-actions">
                <button className="action-btn" onClick={() => openPhotoModal(photo)}>
                  <i className="fas fa-expand"></i>
                  <span>{t('content.view')}</span>
                </button>
                
                {photo.id === 9 && (
                  <button className="action-btn" onClick={showLocation}>
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{t('content.location')}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Модальное окно для просмотра фотографии */}
      {showModal && selectedPhoto && (
        <div className="photo-modal show" onClick={closePhotoModal}>
          <button className="close-modal-btn" onClick={closePhotoModal}>&times;</button>
          <div className="modal-photo-content" onClick={(e) => e.stopPropagation()}>
            {selectedPhoto.imgSrc ? (
              <img 
                src={selectedPhoto.imgSrc} 
                alt={t(selectedPhoto.altKey)} 
                className="modal-photo" 
              />
            ) : (
              <div className="modal-placeholder">
                <i className={`fas ${
                  selectedPhoto.id === 1 ? 'fa-building' :
                  selectedPhoto.id === 2 || selectedPhoto.id === 3 ? 'fa-book' :
                  selectedPhoto.id === 4 ? 'fa-pray' :
                  selectedPhoto.id === 5 ? 'fa-user-shield' :
                  selectedPhoto.id === 6 ? 'fa-tshirt' :
                  selectedPhoto.id === 7 || selectedPhoto.id === 8 ? 'fa-clinic-medical' :
                  'fa-hospital'
                }`}></i>
                <span>{t(selectedPhoto.titleKey)}</span>
              </div>
            )}
            <div className="modal-caption">{t(selectedPhoto.titleKey)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;