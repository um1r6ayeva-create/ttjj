import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../../contexts/AuthContext';
import type { User } from '../../../../../contexts/AuthContext';
import Modal from '../../../../../components/comon/Modal';
import { CalendarMonth, Upload, PhotoCamera, Cancel, ArrowBack, Warning } from '@mui/icons-material';
import './GlobalDutyCardList.css';

interface GlobalDuty {
  id: number;
  duty_type: 'general_cleaning' | 'community_work';
  date_assigned: string;
  notes?: string;
}

interface Props {
  token: string | null;
  user: User | null;
}

const GlobalDutyCardList = ({ token, user }: Props) => {
  const { t } = useTranslation();
  const [duties, setDuties] = useState<GlobalDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDuty, setSelectedDuty] = useState<GlobalDuty | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Form states
  const [reportDescription, setReportDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [floorStatus, setFloorStatus] = useState<any[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<number | string>(user?.floor || '');
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'elder';

  const fetchDuties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/global-duties/');
      setDuties(res.data);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки глобальных дежурств:', err);
      setError(t('globalDuty.error') || 'Error loading global duties');
      setDuties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuties();
  }, [token]);

  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const fetchFloorStatus = async (dutyId: number) => {
    setLoadingStatus(true);
    try {
      const res = await api.get(`/global-duty-reports/duty/${dutyId}/status`);
      setFloorStatus(res.data);
    } catch (err) {
      console.error('Ошибка загрузки статуса этажей:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const getDutyLabel = (type: 'general_cleaning' | 'community_work') => {
    return t(`globalDuty.dutyTypes.${type}`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    if (photos.length + filesArray.length > 20) {
      alert(t('studentDuty.validation.maxPhotos') || 'Макс. 20 фото');
      return;
    }

    const validFiles = filesArray.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    
    if (validFiles.length < filesArray.length) {
      alert('Некоторые файлы были пропущены (неверный формат или размер больше 10MB).');
    }

    const newPhotos = [...photos, ...validFiles];
    const newPreviewUrls = [...previewUrls, ...validFiles.map(f => URL.createObjectURL(f))];
    
    setPhotos(newPhotos);
    setPreviewUrls(newPreviewUrls);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPhotos.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    setPhotos(newPhotos);
    setPreviewUrls(newPreviewUrls);
  };

  const validateReport = () => {
    if (!reportDescription.trim()) return false;
    if (photos.length < 3) return false;
    return true;
  };

  const handleSubmitReport = async () => {
    if (!validateReport() || !selectedDuty) return;

    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('global_duty_id', selectedDuty.id.toString());
      formData.append('description', reportDescription);
      formData.append('floor', selectedFloor.toString());
      photos.forEach(photo => formData.append('photos', photo));

      await api.post('/global-duty-reports/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(t('studentDuty.success.reportSubmitted') || 'Отчет успешно отправлен');
      
      setReportDescription('');
      setPhotos([]);
      setPreviewUrls([]);
      setIsSubmittingReport(false);
      // Не сбрасываем selectedDuty и modalOpen, чтобы пользователь вернулся к сетке
      fetchFloorStatus(selectedDuty.id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Ошибка отправки отчета';
      console.error('Ошибка отправки отчета:', err);
      alert(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleFloorClick = (floor: number) => {
    setSelectedFloor(floor);
    setIsSubmittingReport(true);
  };

  if (isSubmittingReport && selectedDuty) {
    return (
      <div className="submit-report global-submit-report">
        <div className="report-header">
          <button 
            className="back-btn"
            onClick={() => {
              setIsSubmittingReport(false);
              setPhotos([]);
              setPreviewUrls([]);
              setReportDescription('');
            }}
          >
            <ArrowBack />
            {t('studentDuty.backToList') || 'Назад'}
          </button>
          <h2>{t('studentDuty.reportTitle') || 'Отправить отчет'}</h2>
        </div>
        
      <div className="duty-info-card simplified">
        <div className="duty-info-header">
          <CalendarMonth />
          <div>
            <h3>{getDutyLabel(selectedDuty.duty_type)}</h3>
            <p className="duty-location">Этаж: <strong>{selectedFloor}</strong></p>
          </div>
        </div>
      </div>
        
        <div className="report-form">
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              {t('studentDuty.descriptionLabel') || 'Описание'}
            </label>
            <textarea 
              id="description"
              value={reportDescription} 
              onChange={e => setReportDescription(e.target.value)} 
              placeholder={t('studentDuty.descriptionPlaceholder') || 'Введите описание...'} 
              rows={5} 
              maxLength={1000}
              className="form-textarea"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              {t('studentDuty.photosLabel') || 'Фотографии (мин. 3, макс. 20)'}
            </label>
            <div className="photo-upload-section">
              <div className="upload-area">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  style={{ display: 'none' }} 
                  id="global-photo-upload" 
                />
                <label htmlFor="global-photo-upload" className="upload-btn">
                  <PhotoCamera className="upload-icon" />
                  <span>{t('studentDuty.choosePhotos') || 'Выбрать фото'}</span>
                </label>
                
                {photos.length > 0 && (
                  <div className="photos-count">
                    <span>Выбрано: {photos.length}/20</span>
                  </div>
                )}
              </div>
              
              {previewUrls.length > 0 && (
                <div className="photo-previews">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="photo-preview">
                      <img src={url} alt={`preview ${i + 1}`} />
                      <button 
                        className="remove-photo-btn" 
                        onClick={() => removePhoto(i)}
                      >
                        <Cancel />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {photos.length > 0 && photos.length < 3 && (
              <div className="validation-warning" style={{color: 'orange', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px'}}>
                <Warning fontSize="small" />
                <span>Минимум 3 фото</span>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              className="submit-btn primary"
              onClick={handleSubmitReport}
              disabled={submitLoading || !validateReport()}
              style={{marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center', gap: '10px'}}
            >
              {submitLoading ? (
                <span>Отправка...</span>
              ) : (
                <>
                  <Upload />
                  <span>{t('studentDuty.submitReportButton') || 'Отправить'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="global-duty-card-list">
      <h3>{t('globalDuty.title')}</h3>
      
      {loading ? (
        <p className="loading-text">{t('globalDuty.loading')}</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : duties.length === 0 ? (
        <p className="no-duties-text">{t('globalDuty.noDuties')}</p>
      ) : (
        <div className="duty-cards">
          {duties.map(duty => (
            <div 
              key={duty.id} 
              className="duty-card-small"
              onClick={() => {
                setSelectedDuty(duty);
                setModalOpen(true);
                if (isAdmin) fetchFloorStatus(duty.id);
              }}
              role="button"
              tabIndex={0}
            >
              <CalendarMonth className="duty-icon" />
              <div className="duty-info">
                <span className="duty-type">{getDutyLabel(duty.duty_type)}</span>
                <span className="duty-date">{formatDate(duty.date_assigned)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDuty && modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={getDutyLabel(selectedDuty.duty_type)}
          type="info"
        >
          <div className="duty-details simplified">
            <div className="floor-status-section">
              <div className="floor-status-grid-large">
                {floorStatus.length === 0 && !loadingStatus ? (
                   [2, 3, 4, 5, 6, 7, 8, 9].map(floor => (
                    <div 
                      key={floor} 
                      className="floor-status-item empty"
                      onClick={() => handleFloorClick(floor)}
                    >
                      <span className="floor-num">{floor} эт.</span>
                      <span className="floor-status-icon">⚪</span>
                    </div>
                   ))
                ) : (
                  floorStatus.map(fs => (
                    <div 
                      key={fs.floor} 
                      className={`floor-status-item status-${fs.status}`}
                      onClick={() => handleFloorClick(fs.floor)}
                    >
                      <span className="floor-num">{fs.floor} эт.</span>
                      <span className="floor-status-icon">
                        {fs.status === 'confirmed' ? '✅' : 
                         fs.status === 'waiting' ? '⏳' : 
                         fs.status === 'rejected' ? '❌' : '⚪'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <p className="hint-text">Нажмите на этаж, чтобы отправить отчет</p>
          </div>
        </Modal>
      )}

      {/* Переместил handleSubmitReport сюда для доступа */}
      {isSubmittingReport && selectedDuty && (
        <div style={{display: 'none'}}>{/* Вспомогательный элемент если нужно */}</div>
      )}
    </div>
  );
};

export default GlobalDutyCardList;