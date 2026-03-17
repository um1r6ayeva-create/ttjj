import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, authApi } from '../../../../../contexts/AuthContext';
import './StudentDutyInterface.css';

// Импортируем иконки
import { 
  Kitchen, 
  Shower, 
  CalendarMonth, 
  LocationOn, 
  Assignment, 
  CheckCircle, 
  Cancel, 
  Pending, 
  Upload, 
  PhotoCamera, 
  History, 
  ArrowBack,
  Warning,
  Info,
  Close} from '@mui/icons-material';
import GlobalDutyCardList from './GlobalDutyCardList';
import type { studentDuty } from '../../../../../i18n/studentDuty';

// Типы для дежурств
interface Duty {
  id: number;
  duty_type: string;
  room_number: number;
  floor: number;
  date_assigned: string;
  date_due: string;
  status: 'pending' | 'submitted' | 'confirmed' | 'rejected';
  notes?: string;
  assigned_by_id: number;
}

// Типы для уведомлений
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

interface ConfirmDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const StudentDutyInterface: React.FC = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my_duties' | 'submit_report' | 'history' | 'all_duties'>('my_duties');
  const [selectedDuty, setSelectedDuty] = useState<Duty | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [studentDuties, setStudentDuties] = useState<Duty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentRoom, setStudentRoom] = useState<string>('');
  
  // Уведомления
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Диалог подтверждения
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    confirmText: t('studentDuty.confirm'),
    cancelText: t('studentDuty.cancel')
  });

  const fetchDuties = async () => {
    if (!token || !user) return;
    
    setIsLoading(true);
    try {
      const { data } = await authApi.get(`/duties/room/${user.n_room}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudentDuties(data);

      if (user.n_room) {
        setStudentRoom(user.n_room.toString());
      } else if (data.length > 0) {
        setStudentRoom(data[0].room_number.toString());
      } else {
        setStudentRoom('-');
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки дежурств:', err);
      setError(t('studentDuty.error.loadDuties'));
      showNotification('error', t('studentDuty.error.loadDuties'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDuties();
  }, [token, user]);

  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  // --- Функции для уведомлений ---
  const showNotification = (type: NotificationType, message: string) => {
    const id = Date.now();
    const newNotification: Notification = { id, message, type };
    setNotifications(prev => [...prev, newNotification]);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // --- Функция для диалога подтверждения ---
  const showConfirmDialog = (
    title: string, 
    message: string, 
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        onConfirm();
      },
      onCancel: () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        onCancel?.();
      },
      confirmText,
      cancelText
    });
  };

  // --- Основные обработчики ---
  const validateReport = (): { isValid: boolean; message?: string } => {
    if (!selectedDuty) {
      return { isValid: false, message: t('studentDuty.validation.noDutySelected') };
    }
    if (!reportDescription.trim()) {
      return { isValid: false, message: t('studentDuty.validation.noDescription') };
    }
    if (photos.length < 3) {
      return { isValid: false, message: t('studentDuty.validation.minPhotos') };
    }
    if (photos.length > 5) {
      return { isValid: false, message: t('studentDuty.validation.maxPhotos') };
    }
    return { isValid: true };
  };

  const handleSubmitReport = async () => {
    const validation = validateReport();
    if (!validation.isValid) {
      showNotification('warning', validation.message!);
      return;
    }

    if (!token || !user) {
      showNotification('error', t('studentDuty.error.authError'));
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('duty_id', selectedDuty!.id.toString());
      formData.append('description', reportDescription);
      formData.append('student_id', user.id.toString());
      photos.forEach(photo => formData.append('photos', photo));

      await authApi.post('/duty-reports/', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        },
      });

      showNotification('success', t('studentDuty.success.reportSubmitted'));
      
      await fetchDuties();

      // Сброс формы
      setReportDescription('');
      setPhotos([]);
      setPreviewUrls([]);
      setSelectedDuty(null);
      setActiveTab('my_duties');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || t('studentDuty.error.submitReport');
      console.error('Ошибка отправки отчета:', err);
      showNotification('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    if (photos.length + filesArray.length > 5) {
      showNotification('warning', t('studentDuty.validation.maxPhotos'));
      return;
    }

    // Проверка типа файлов
    const invalidFiles = filesArray.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      showNotification('warning', t('studentDuty.validation.fileType'));
      return;
    }

    // Проверка размера файлов (максимум 5MB)
    const oversizedFiles = filesArray.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showNotification('warning', t('studentDuty.validation.fileSize'));
      return;
    }

    const newPhotos = [...photos, ...filesArray];
    const newPreviewUrls = [...previewUrls, ...filesArray.map(f => URL.createObjectURL(f))];
    
    setPhotos(newPhotos);
    setPreviewUrls(newPreviewUrls);
    
    if (newPhotos.length >= 3) {
      showNotification('info', t('studentDuty.success.uploadProgress', { count: newPhotos.length }));
    }
  };

  const removePhoto = (index: number) => {
    showConfirmDialog(
      t('studentDuty.deletePhotoConfirm'),
      t('studentDuty.deletePhotoMessage'),
      () => {
        const newPhotos = [...photos];
        const newPreviewUrls = [...previewUrls];
        
        URL.revokeObjectURL(newPreviewUrls[index]);
        newPhotos.splice(index, 1);
        newPreviewUrls.splice(index, 1);
        
        setPhotos(newPhotos);
        setPreviewUrls(newPreviewUrls);
        showNotification('info', t('studentDuty.success.photoDeleted'));
      }
    );
  };

  const getDutyIcon = (duty: Duty) => {
    const icons: Record<string, React.ReactNode> = {
      kitchen: <Kitchen className="duty-icon kitchen-icon" />,
      shower: <Shower className="duty-icon shower-icon" />,
    };
    return icons[duty.duty_type.toLowerCase()] || <Assignment className="duty-icon default-icon" />;
  };

  const getDutyDescription = (duty: Duty) => {
    const dutyKey = duty.duty_type.toLowerCase() as keyof typeof studentDuty.ru.dutyDescriptions;
    const descriptions = t(`studentDuty.dutyDescriptions.${dutyKey}`, 
      { defaultValue: t('studentDuty.dutyDescriptions.default') });
    return duty.notes || descriptions;
  };

  const canSubmitReport = (duty: Duty) => {
    const today = new Date();
    const dueDate = new Date(duty.date_due);

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(23, 59, 59, 999);

    return duty.status === 'pending' && today <= dueDate;
  };

  const getStatusConfig = (status: string) => {
    const statusMap = {
      pending: { 
        text: t('studentDuty.status.pending'), 
        className: 'status-pending',
        icon: <Pending />
      },
      submitted: { 
        text: t('studentDuty.status.submitted'), 
        className: 'status-submitted',
        icon: <Upload />
      },
      confirmed: { 
        text: t('studentDuty.status.confirmed'), 
        className: 'status-confirmed',
        icon: <CheckCircle />
      },
      rejected: { 
        text: t('studentDuty.status.rejected'), 
        className: 'status-rejected',
        icon: <Cancel />
      },
    };

    return statusMap[status as keyof typeof statusMap] || { 
      text: status, 
      className: '', 
      icon: null 
    };
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

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return <CheckCircle />;
      case 'error': return <Warning />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <Info />;
    }
  };

  return (
    <div className="student-interface">
      {/* Уведомления */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification notification-${notification.type}`}
          >
            <div className="notification-content">
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-message">
                {notification.message}
              </div>
              <button 
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
              >
                <Close />
              </button>
            </div>
            <div className="notification-progress"></div>
          </div>
        ))}
      </div>

      {/* Диалог подтверждения */}
      {confirmDialog.isOpen && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <h3>{confirmDialog.title}</h3>
              <button 
                className="confirm-dialog-close"
                onClick={confirmDialog.onCancel}
              >
                <Close />
              </button>
            </div>
            <div className="confirm-dialog-body">
              <div className="confirm-dialog-icon">
                <Warning />
              </div>
              <p>{confirmDialog.message}</p>
            </div>
            <div className="confirm-dialog-footer">
              <button 
                className="confirm-dialog-btn cancel"
                onClick={confirmDialog.onCancel}
              >
                {confirmDialog.cancelText}
              </button>
              <button 
                className="confirm-dialog-btn confirm"
                onClick={confirmDialog.onConfirm}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="interface-header">
        <h1>{t('studentDuty.title')}</h1>
        <div className="room-badge">
          <LocationOn />
          <span>{t('studentDuty.roomLabel')}: {studentRoom}</span>
        </div>
      </div>

      {/* Вкладки */}
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'my_duties' ? 'active' : ''}`} 
            onClick={() => setActiveTab('my_duties')}
          >
            <Assignment className="tab-icon" />
            <span>{t('studentDuty.currentDuties')}</span>
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'submit_report' ? 'active' : ''}`} 
            onClick={() => {
              if (!selectedDuty) {
                showNotification('info', t('studentDuty.info.selectDuty'));
              } else {
                setActiveTab('submit_report');
              }
            }}
          >
            <Upload className="tab-icon" />
            <span>{t('studentDuty.submitReport')}</span>
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
          >
            <History className="tab-icon" />
            <span>{t('studentDuty.history')}</span>
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'all_duties' ? 'active' : ''}`} 
            onClick={() => setActiveTab('all_duties')}
          >
            <Assignment className="tab-icon" />
            <span>{t('studentDuty.globalDuties')}</span>
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="tab-content">
        {/* Список дежурств */}
        {activeTab === 'my_duties' && (
          <div className="my-duties">
            <div className="section-header2">
              <h2>{t('studentDuty.currentDuties')}</h2>
              <button 
                className="refresh-btn5"
                onClick={fetchDuties}
                disabled={isLoading}
              >
                {isLoading ? t('studentDuty.refresh') + '...' : t('studentDuty.refresh')}
              </button>
            </div>

            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>{t('studentDuty.loadingDuties')}</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <Warning className="error-icon" />
                <p>{error}</p>
                <button 
                  className="retry-btn"
                  onClick={fetchDuties}
                >
                  {t('studentDuty.retry')}
                </button>
              </div>
            ) : studentDuties.length === 0 ? (
              <div className="empty-state">
                <Info className="empty-icon" />
                <p>{t('studentDuty.noDuties')}</p>
              </div>
            ) : (
              <div className="duties-grid">
                {studentDuties.map(duty => {
                  const status = getStatusConfig(duty.status);
                  const description = getDutyDescription(duty);
                  const isReportable = canSubmitReport(duty);

                  return (
                    <div key={duty.id} className={`duty-card2 ${duty.status}`}>
                      <div className="duty-card2-header">
                        {getDutyIcon(duty)}
                        <div className="duty-title">
                          <h3>{description}</h3>
                          <div className="duty-meta">
                            <span className="meta-item">
                              <LocationOn className="meta-icon" />
                              {t('studentDuty.roomLabel')} {duty.room_number}, {duty.floor} {t('studentDuty.floorLabel')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="duty-dates">
                        <div className="date-item">
                          <CalendarMonth className="date-icon" />
                          <div>
                            <span className="date-label">{t('studentDuty.dueDate')}:</span>
                            <span className="date-value">{formatDate(duty.date_due)}</span>
                          </div>
                        </div>
                        <div className="date-item">
                          <Assignment className="date-icon" />
                          <div>
                            <span className="date-label">{t('studentDuty.assignedDate')}:</span>
                            <span className="date-value">{formatDate(duty.date_assigned)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="duty-card2-footer">
                        <div className={`status-badge ${status.className}`}>
                          {status.icon}
                          <span>{status.text}</span>
                        </div>
                        
                        <div className="duty-actions7">
                          {isReportable && (
                            <button
                              className="report-btn7"
                              onClick={() => {
                                setSelectedDuty(duty);
                                setActiveTab('submit_report');
                                showNotification('info', t('studentDuty.info.fillReportForm'));
                              }}
                            >
                              <Upload />
                              <span>{t('studentDuty.submitReport')}</span>
                            </button>
                          )}
                          
                          {duty.status === 'submitted' && (
                            <div className="waiting-review">
                              <Pending className="waiting-icon" />
                              <span>{t('studentDuty.status.waitingReview')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Форма отчета */}
        {activeTab === 'submit_report' && selectedDuty && (
          <div className="submit-report">
            <div className="report-header">
              <button 
                className="back-btn"
                onClick={() => {
                  if (reportDescription.trim() || photos.length > 0) {
                    showConfirmDialog(
                      t('studentDuty.warning.unsavedChangesTitle'),
                      t('studentDuty.warning.unsavedChangesMessage'),
                      () => {
                        setActiveTab('my_duties'); 
                        setSelectedDuty(null); 
                        setPhotos([]); 
                        setPreviewUrls([]); 
                        setReportDescription('');
                      }
                    );
                  } else {
                    setActiveTab('my_duties'); 
                    setSelectedDuty(null);
                  }
                }}
              >
                <ArrowBack />
                {t('studentDuty.backToList')}
              </button>
              <h2>{t('studentDuty.reportTitle')}</h2>
            </div>
            
            <div className="duty-info-card">
              <div className="duty-info-header">
                {getDutyIcon(selectedDuty)}
                <div>
                  <h3>{getDutyDescription(selectedDuty)}</h3>
                  <p className="duty-location">
                    <LocationOn />
                    {t('studentDuty.roomLabel')} {selectedDuty.room_number}, {selectedDuty.floor} {t('studentDuty.floorLabel')}
                  </p>
                </div>
              </div>
              <div className="duty-info-dates">
                <div className="info-date">
                  <CalendarMonth />
                  <span>{t('studentDuty.dueDate')}: {formatDate(selectedDuty.date_due)}</span>
                </div>
              </div>
            </div>
            
            <div className="report-form">
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  {t('studentDuty.descriptionLabel')}
                </label>
                <textarea 
                  id="description"
                  value={reportDescription} 
                  onChange={e => setReportDescription(e.target.value)} 
                  placeholder={t('studentDuty.descriptionPlaceholder')} 
                  rows={5} 
                  maxLength={1000}
                  className="form-textarea"
                />
                <div className="char-count">
                  {reportDescription.length}{t('studentDuty.charCount')}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  {t('studentDuty.photosLabel')}
                </label>
                <div className="photo-upload-section">
                  <div className="upload-area">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      style={{ display: 'none' }} 
                      id="photo-upload" 
                    />
                    <label htmlFor="photo-upload" className="upload-btn">
                      <PhotoCamera className="upload-icon" />
                      <span>{t('studentDuty.choosePhotos')}</span>
                      <span className="upload-hint">{t('studentDuty.photosHint')}</span>
                    </label>
                    
                    {photos.length > 0 && (
                      <div className="photos-count">
                        <span>{t('studentDuty.selectedCount')}: {photos.length}/5</span>
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
                            aria-label={t('studentDuty.deletePhotoConfirm')}
                          >
                            <Cancel />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Валидация фотографий */}
                {photos.length > 0 && photos.length < 3 && (
                  <div className="validation-warning">
                    <Warning />
                    <span>{t('studentDuty.validation.minPhotos')}</span>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    if (reportDescription.trim() || photos.length > 0) {
                      showConfirmDialog(
                        t('studentDuty.warning.cancelSubmitTitle'),
                        t('studentDuty.warning.cancelSubmitMessage'),
                        () => {
                          setActiveTab('my_duties'); 
                          setSelectedDuty(null); 
                          setPhotos([]); 
                          setPreviewUrls([]); 
                          setReportDescription('');
                          showNotification('info', t('studentDuty.info.reportCancelled'));
                        }
                      );
                    } else {
                      setActiveTab('my_duties'); 
                      setSelectedDuty(null);
                    }
                  }}
                >
                  {t('studentDuty.cancel')}
                </button>
                <button 
                  className="submit-btn primary"
                  onClick={() => {
                    const validation = validateReport();
                    if (validation.isValid) {
                      showConfirmDialog(
                        t('studentDuty.warning.confirmSubmitTitle'),
                        t('studentDuty.warning.confirmSubmitMessage'),
                        handleSubmitReport,
                        undefined,
                        t('studentDuty.submitReportButton'),
                        t('studentDuty.confirm')
                      );
                    } else {
                      showNotification('warning', validation.message!);
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="btn-spinner"></div>
                      <span>{t('studentDuty.submitReportButton')}...</span>
                    </>
                  ) : (
                    <>
                      <Upload />
                      <span>{t('studentDuty.submitReportButton')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="requirements-card">
              <h4>{t('studentDuty.requirements')}</h4>
              <ul className="requirements-list">
                {(t('studentDuty.requirementsList', { returnObjects: true }) as string[]).map((item, index) => (
  <li key={index}>{item}</li>
))}

              </ul>
            </div>
          </div>
        )}

        {/* История */}
        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="section-header2">
              <h2>{t('studentDuty.history')}</h2>
              <div className="room-badge small">
                <LocationOn />
                <span>{t('studentDuty.roomLabel')} {studentRoom}</span>
              </div>
            </div>
            
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>{t('studentDuty.loadingHistory')}</p>
              </div>
            ) : studentDuties.length === 0 ? (
              <div className="empty-state">
                <Info className="empty-icon" />
                <p>{t('studentDuty.noHistory')}</p>
              </div>
            ) : (
              <div className="history-list">
                {studentDuties
                  .filter(duty => duty.status === 'confirmed' || duty.status === 'rejected')
                  .map(duty => {
                    const status = getStatusConfig(duty.status);
                    return (
                      <div key={duty.id} className="history-item">
                        <div className="history-item-header">
                          {getDutyIcon(duty)}
                          <div className="history-item-info">
                            <h4>{getDutyDescription(duty)}</h4>
                            <div className="history-meta">
                              <span className="meta-item">
                                <CalendarMonth />
                                {formatDate(duty.date_due)}
                              </span>
                              <span className="meta-item">
                                <LocationOn />
                                {t('studentDuty.roomLabel')} {duty.room_number}
                              </span>
                            </div>
                          </div>
                          <div className={`status-badge ${status.className}`}>
                            {status.icon}
                            <span>{status.text}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
                
                {studentDuties.filter(duty => duty.status === 'confirmed' || duty.status === 'rejected').length === 0 && (
                  <div className="empty-state">
                    <Info className="empty-icon" />
                    <p>{t('studentDuty.noCompletedDuties')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Глобальные дежурства */}
        {activeTab === 'all_duties' && (
          <GlobalDutyCardList token={token} />
        )}
      </div>
    </div>
  );
};

export default StudentDutyInterface;