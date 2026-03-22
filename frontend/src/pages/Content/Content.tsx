import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
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
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
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

  const showLocation = () => {
    const mapUrl = "https://yandex.uz/maps/10335/tashkent/house/YkAYdA9iSE0HQFprfX9zeHtrZQ==/";
    window.open(mapUrl, '_blank');
  };

  const lightboxSlides = photos.map((p) => ({
    src: p.imgSrc,
    alt: t(p.altKey),
    title: t(p.titleKey),
    description: t(p.descriptionKey)
  }));

  return (
    <div className="content-container">
      {/* Основной контент */}
      <section className="gallery-section fade-in">
        <h2 className="section-title">{t('content.gallery_title')}</h2>
        
        <div className="gallery-container">
          {photos.map((photo, index) => (
            <div className="photo-card" key={photo.id}>
              {/* Делаем область фото кликабельной */}
              <div 
                className="photo-wrapper" 
                onClick={() => setLightboxIndex(index)}
                style={{ cursor: 'pointer' }}
                title={t('content.click_to_view')}
              >
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
                      {photo.clinicInfo.schedule.map((item, i) => (
                        <li key={i}>{t(item.dayKey)}: {item.time}</li>
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
              
              {/* Убрали кнопку "Просмотр", оставили только действие, если оно уникальное (например Локация для поликлиники) */}
              <div className="photo-actions" style={{ justifyContent: 'center' }}>
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

      {/* Lightbox с зумом */}
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={lightboxSlides}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 5,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          doubleClickMaxStops: 2,
          keyboardMoveDistance: 50,
          wheelZoomDistanceFactor: 100,
          pinchZoomDistanceFactor: 100,
          scrollToZoom: false,
        }}
      />
    </div>
  );
};

export default Content;