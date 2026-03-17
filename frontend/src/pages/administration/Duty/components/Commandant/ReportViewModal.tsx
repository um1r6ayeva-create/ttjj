import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Close, 
  ArrowBack, 
  ArrowForward, 
  CheckCircle,
  Cancel,
  Person,
  Description,
  PhotoLibrary,
  Warning,
  BrokenImage
} from '@mui/icons-material';
import './CommandantDutyInterface.css';

interface Photo {
  id: number;
  photo_url: string;
  file_name: string;
  uploaded_at: string;
}

interface DutyReport {
  id: number;
  duty_id: number;
  duty_type?: string;
  room_number?: number;
  floor?: number;
  student_id: number;
  description: string;
  submitted_at: string;
  status: 'waiting' | 'confirmed' | 'rejected';
  reviewed_at: string | null;
  reviewed_by: number | null;
  review_notes: string | null;
  photos?: Photo[];
  student_name?: string;
}

interface ReportViewModalProps {
  report: DutyReport;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
  api: any;
}

const ReportViewModal: React.FC<ReportViewModalProps> = ({ 
  report, 
  onClose, 
  onConfirm, 
  onReject,
  api 
}) => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>(report.photos || []);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadReportDetails = async () => {
      try {
        setLoadingPhotos(true);
        const response = await api.get(`/duty-reports/${report.id}`);
        if (response.data.photos) {
          setPhotos(response.data.photos);
        }
      } catch (error) {
        console.error(t('reportViewModal.errorLoadingPhotos'), error);
      } finally {
        setLoadingPhotos(false);
      }
    };

    if (!report.photos || report.photos.length === 0) {
      loadReportDetails();
    }
  }, [report.id, api, report.photos, t]);

  const getDutyTypeText = (type?: string): string => {
  if (!type) return t('reportViewModal.dutyTypes.default');

  const dutyKey = String(type).toLowerCase();
  return t(`reportViewModal.dutyTypes.${dutyKey}`, {
    defaultValue: t('reportViewModal.dutyTypes.default'),
  });
};

  const formatDateTime = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      } as Intl.DateTimeFormatOptions);
    } catch {
      return dateString;
    }
  };
const getStatusText = (status: string): string => {
  const statusKey = String(status).toLowerCase();
  return t(`reportViewModal.statuses.${statusKey}`, {
    defaultValue: status,
  });
};

  const handleImageError = (photoId: number) => {
    setImageErrors(prev => new Set(prev).add(photoId));
  };

  const normalizeImagePath = (path: string): string => {
    if (!path) return '';

    // если уже полный URL
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const cleaned = path
      .replace(/\\/g, '/')
      .replace(/^\/+/, '');

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/${cleaned}`;
  };

  const getImageUrl = (photo: Photo): string => {
    if (imageErrors.has(photo.id)) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f7fafc"/><text x="200" y="150" font-family="Arial" font-size="16" text-anchor="middle" fill="%23718096">${t('reportViewModal.imageError')}</text></svg>`;
    }
    
    if (photo.photo_url) {
      return normalizeImagePath(photo.photo_url);
    }
    
    return normalizeImagePath(`uploads/duty_reports/${report.id}/${photo.file_name || photo.id}.jpg`);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderPlaceholder = (width: number, height: number) => (
    <div 
      className="image-placeholder"
      style={{ width, height }}
    >
      <BrokenImage className="placeholder-icon" />
      <span>{t('reportViewModal.imageError')}</span>
    </div>
  );

  return (
    <div className="report-modal-overlay" onClick={handleOverlayClick}>
      <div className="report-modal">
        {/* Заголовок */}
        <div className="report-modal-header">
          <div className="modal-title-section">
            <h2>{getDutyTypeText(report.duty_type)}</h2>
            {report.room_number && (
              <span className="room-badge44">
                {t('reportViewModal.room')} {report.room_number}
                {report.floor ? `, ${report.floor} ${t('reportViewModal.floor')}` : ''}
              </span>
            )}
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label={t('reportViewModal.close')}
          >
            <Close />
          </button>
        </div>

        <div className="report-modal-content">
          {/* Информация об отчете */}
          <div className="report-info-section">
            <h3>
              <Person /> {t('reportViewModal.reportInfo')}
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">{t('reportViewModal.student')}:</span>
                <span className="info-value">{report.student_name || `ID: ${report.student_id}`}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('reportViewModal.submitted')}:</span>
                <span className="info-value">{formatDateTime(report.submitted_at)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('reportViewModal.status')}:</span>
                <span className={`status-badge status-${report.status}`}>
                  {getStatusText(report.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Описание работы */}
          <div className="description-section">
            <h3>
              <Description /> {t('reportViewModal.workDescription')}
            </h3>
            <div className="description-text">
              {report.description}
            </div>
          </div>

          {/* Фотографии */}
          {photos.length > 0 && (
            <div className="photos-section">
              <h3>
                <PhotoLibrary /> {t('reportViewModal.photos')} ({photos.length})
              </h3>
              
              {loadingPhotos ? (
                <div className="photos-loading">
                  <div className="loader"></div>
                  <p>{t('reportViewModal.loadingPhotos')}</p>
                </div>
              ) : (
                <>
                  {/* Основное фото */}
                  <div className="main-photo-container">
                    <button 
                      className="photo-nav prev-btn"
                      onClick={prevPhoto}
                      disabled={photos.length <= 1}
                      aria-label={t('reportViewModal.prevPhoto')}
                    >
                      <ArrowBack />
                    </button>
                    
                    <div className="main-photo">
                      {photos[currentPhotoIndex] ? (
                        <img 
                          src={getImageUrl(photos[currentPhotoIndex])}
                          alt={`${t('reportViewModal.photo')} ${currentPhotoIndex + 1}`}
                          onError={() => handleImageError(photos[currentPhotoIndex].id)}
                          loading="lazy"
                        />
                      ) : (
                        renderPlaceholder(400, 300)
                      )}
                      <div className="photo-info">
                        <span>
                          {t('reportViewModal.photo')} {currentPhotoIndex + 1} {t('reportViewModal.of')} {photos.length}
                        </span>
                        {photos[currentPhotoIndex]?.file_name && (
                          <span className="file-name">
                            • {photos[currentPhotoIndex].file_name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      className="photo-nav next-btn"
                      onClick={nextPhoto}
                      disabled={photos.length <= 1}
                      aria-label={t('reportViewModal.nextPhoto')}
                    >
                      <ArrowForward />
                    </button>
                  </div>

                  {/* Миниатюры */}
                  {photos.length > 1 && (
                    <div className="thumbnails">
                      {photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
                          onClick={() => setCurrentPhotoIndex(index)}
                          aria-label={`${t('reportViewModal.photo')} ${index + 1}`}
                        >
                          {imageErrors.has(photo.id) ? (
                            <div className="thumbnail-placeholder">
                              <BrokenImage />
                            </div>
                          ) : (
                            <img 
                              src={getImageUrl(photo)}
                              alt={`${t('reportViewModal.photo')} ${index + 1}`}
                              onError={() => handleImageError(photo.id)}
                              loading="lazy"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Сообщение если нет фотографий */}
          {!loadingPhotos && photos.length === 0 && (
            <div className="no-photos">
              <PhotoLibrary className="no-photos-icon" />
              <p>{t('reportViewModal.noPhotos')}</p>
            </div>
          )}

          {/* Заметки проверки (если есть) */}
          {report.review_notes && (
            <div className="review-notes-section">
              <h3>
                <Warning /> {t('reportViewModal.reviewNotes')}
              </h3>
              <div className="review-notes">
                {report.review_notes}
              </div>
            </div>
          )}
        </div>

        {/* Кнопки действий (только для ожидающих отчетов) */}
        {report.status === 'waiting' && (
          <div className="report-modal-footer">
            <button 
              className="btn cancel-btn" 
              onClick={onClose}
              aria-label={t('reportViewModal.cancel')}
            >
              {t('reportViewModal.cancel')}
            </button>
            <div className="action-buttons">
              <button 
                className="btn reject-btn" 
                onClick={onReject}
                aria-label={t('reportViewModal.reject')}
              >
                <Cancel /> {t('reportViewModal.reject')}
              </button>
              <button 
                className="btn confirm-btn" 
                onClick={onConfirm}
                aria-label={t('reportViewModal.confirm')}
              >
                <CheckCircle /> {t('reportViewModal.confirm')}
              </button>
            </div>
          </div>
        )}

        {/* Только кнопка закрытия для подтвержденных/отклоненных отчетов */}
        {report.status !== 'waiting' && (
          <div className="report-modal-footer">
            <button 
              className="btn primary-btn" 
              onClick={onClose}
              aria-label={t('reportViewModal.close')}
            >
              {t('reportViewModal.close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportViewModal;