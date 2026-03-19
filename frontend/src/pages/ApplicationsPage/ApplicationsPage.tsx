import { useState, useEffect } from 'react';
import './ApplicationsPage.css';
import ApplicationForm from './ApplicationForm';
import { useAuth, api } from '../../contexts/AuthContext';
import Modal from '../../components/comon/Modal';
import ApplicationsCheckPage from './ApplicationsCheckPage';
import { useTranslation } from 'react-i18next';

interface ApplicationData {
  id: number;
  user_id: number;
  name: string;
  surname: string;
  n_room: number;
  phone: string;
  type: 'guarantee' | 'application';
  status: 'sent' | 'viewed' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  file_path: string;
  file_name: string;
}

const ApplicationsPage = () => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
    const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'guarantee' | 'application'>('guarantee');
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
if (user?.role === 'commandant') {
    return <ApplicationsCheckPage />;
  }
  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    if (isAuthenticated && user) {
      fetchUserApplications();
    }

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const updateDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    setCurrentDateTime(now.toLocaleDateString('ru-RU', options));
  };

  // Получение истории заявок с бэкенда
  const fetchUserApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/applications/user/${user?.id}`);
      setApplications(response.data);
    } catch (error) {
      console.error('Ошибка загрузки истории заявок:', error);
      showModal('Ошибка при загрузке истории заявок', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Показ модального окна с сообщением
  const showModal = (message: string, type: 'success' | 'error' = 'success') => {
    setModalMessage(message);
    setModalType(type);
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  // Открытие модального окна подтверждения удаления
  const openDeleteModal = (application: ApplicationData) => {
    setApplicationToDelete(application);
    setDeleteModalOpen(true);
  };

  // Закрытие модального окна подтверждения удаления
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setApplicationToDelete(null);
  };

  // Данные пользователя для автозаполнения формы
  const getUserDataForForm = () => {
    if (!user) return null;

    return {
      user_id: user.id,
      name: user.name || '',
      surname: user.surname || '',
      phone: user.phone || '',
      room: user.n_room ? String(user.n_room) : '',
      group: user.user_group || '',
      faculty: '',
    };
  };

  // Обработчик успешной отправки заявки
 const handleSubmitSuccess = () => {
  showModal(t('applications.submit.success'));
  fetchUserApplications();
};

  // Обработчик ошибки отправки
  const handleSubmitError = (error: string) => {
    showModal(`❌ ${error}`, 'error');
  };
  const downloadDocument = (application: ApplicationData) => {
  try {
    if (!application.file_path) {
      showModal('❌ Путь к файлу отсутствует', 'error');
      return;
    }

    // file_path в БД: applications/YYYY/MM/uuid.docx
    const filePath = application.file_path.replace(/\\/g, '/');
    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://ttjj.onrender.com').replace(/\/+$/, '');
    const fileUrl = `${API_BASE_URL}/uploads/${filePath}`;

    console.log('URL для скачивания:', fileUrl);

    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = application.file_name || '';
    a.target = '_blank'; // важно для некоторых браузеров
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (error) {
    console.error('Ошибка при скачивании документа:', error);
    showModal('❌ Не удалось скачать документ', 'error');
  }
};

  // Удаление заявки
  const deleteApplication = async () => {
    if (!applicationToDelete) return;

    try {
      await api.delete(`/applications/${applicationToDelete.id}`);

      // Обновляем список после удаления
      setApplications((prev) => prev.filter(app => app.id !== applicationToDelete.id));
      closeDeleteModal();
      showModal(t('applications.delete.success'));
    } catch (error) {
      console.error('Ошибка при удалении заявки:', error);
      closeDeleteModal();
      showModal('❌ Не удалось удалить заявку', 'error');
    }
  };

  // Получение текста статуса

  // Получение класса для статуса
  const getStatusClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      'sent': 'status-sent',
      'viewed': 'status-viewed',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return statusClasses[status] || '';
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Данные пользователя для формы
  const userFormData = getUserDataForForm();

  return (
    <div className="applications-page">
      {/* Модальное окно для сообщений */}
<Modal
  isOpen={isModalOpen}
  onClose={closeModal}
  title={modalType === 'success' 
    ? t('applications.modals.successTitle') 
    : t('applications.modals.errorTitle')}
  type={modalType}
>
  <div className="modal-message">
    <i className={`fas fa-${modalType === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
    <p>{modalMessage}</p>
  </div>
  <div className="modal-actions">
    <button 
      className={`btn ${modalType === 'success' ? 'btn-primary' : 'btn-secondary'}`} 
      onClick={closeModal}
    >
      {t('applications.modals.closeBtn')}
    </button>
  </div>
</Modal>

      {/* Модальное окно подтверждения удаления */}
      <Modal
  isOpen={deleteModalOpen}
  onClose={closeDeleteModal}
  title={t('applications.modals.deleteTitle')} 
  type="error"
>
  <div className="modal-message">
    <i className="fas fa-exclamation-triangle fa-2x"></i>
    <p style={{ textAlign: 'left' }}>
      {t('applications.deleteModal.confirmation')}
      <br /><br />
      {applicationToDelete && (
        <>
          <strong>{t('applications.deleteModal.details.type')}</strong> 
          {applicationToDelete.type === 'guarantee' 
            ? t('applications.tabs.guarantee') 
            : t('applications.tabs.application')}
          <br />
          <strong>{t('applications.deleteModal.details.fio')}</strong> 
          {applicationToDelete.surname} {applicationToDelete.name}
          <br />
          <strong>{t('applications.deleteModal.details.date')}</strong> 
          {formatDate(applicationToDelete.created_at)}
          <br />
          <strong>{t('applications.deleteModal.details.status')}</strong> 
          {t(`applications.status.${applicationToDelete.status}`)}
        </>
      )}
    </p>
  </div>
  <div className="modal-actions">
    <button 
      className="btn btn-secondary"
      onClick={closeDeleteModal}
    >
      <i className="fas fa-times"></i> {t('applications.deleteModal.cancel')}
    </button>
    <button 
      className="btn btn-danger"
      onClick={deleteApplication}
    >
      <i className="fas fa-trash-alt"></i> {t('applications.deleteModal.confirm')}
    </button>
  </div>
</Modal>

      <div className="container">
        <section className="applications-section fade-in">
          <h2 className="section-title">{t('applications.pageTitle')}</h2>
          
          <div className="current-date-time">
            <i className="far fa-calendar-alt"></i>
            <span>{currentDateTime || 'Загрузка даты и времени...'}</span>
          </div>

          {!isAuthenticated && (
            <div className="auth-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <p>
      {t('applications.authWarning.part1')} 
    <a href="/login" className="auth-link">{t('applications.authWarning.loginLink')}</a>. 
     {t('applications.authWarning.part2')}
       </p>
            </div>
          )}
          
          <div className="bot-info">
           <h3>{t('applications.telegram.title')}</h3>
           <p>{t('applications.telegram.description')}</p>
            <a href="https://t.me/taturasmiybot" className="telegram-link" target="_blank" rel="noopener noreferrer">
  <i className="fab fa-telegram-plane"></i>
  <span>@taturasmiybot</span>
</a>
          </div>

          {/* Табы для переключения между формами */}
          <div className="application-tabs">
           <button className={`tab-btn2 ${activeTab === 'guarantee' ? 'active' : ''}`} onClick={() => setActiveTab('guarantee')}>
  <i className="fas fa-file-contract"></i> {t('applications.tabs.guarantee')}
</button>
            <button 
  className={`tab-btn2 ${activeTab === 'application' ? 'active' : ''}`}
  onClick={() => setActiveTab('application')}
>
  <i className="fas fa-file-signature"></i> {t('applications.tabs.application')}
</button>
          </div>

          {/* Формы */}
          {isAuthenticated ? (
            <ApplicationForm 
              type={activeTab}
              onSuccess={handleSubmitSuccess}
              onError={handleSubmitError}
              userData={userFormData}
            />
          ) : (
            <div className="login-required">
              <div className="login-required-icon">
                <i className="fas fa-lock fa-3x"></i>
              </div>
              <h3>Требуется авторизация</h3>
              <p>Для подачи заявления необходимо войти в систему.</p>
              <div className="login-required-actions">
                <a href="/login" className="btn2 btn2-primary">
                  <i className="fas fa-sign-in-alt"></i> Войти
                </a>
                <a href="/register" className="btn2 btn2-secondary">
                  <i className="fas fa-user-plus"></i> Зарегистрироваться
                </a>
              </div>
            </div>
          )}
{/* История заявок */}
{isAuthenticated && applications.length > 0 && (
  <div className="applications-history">
    <h3 className="history-title">
      <i className="fas fa-history"></i> {t('applications.history.title')}
    </h3>
    
    {loading ? (
      <div className="loading-spinner">
        <i className="fas fa-spinner fa-spin fa-2x"></i>
        <p>{t('applications.loading')}</p>
      </div>
    ) : (
      <div className="history-list">
        {applications
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((app) => (
            <div key={app.id} className="application-item">
              <div className="application-header">
                <div className="application-type">
                  <i className={`fas fa-${app.type === 'guarantee' ? 'file-contract' : 'file-signature'}`}></i>
                  {app.type === 'guarantee' ? t('applications.tabs.guarantee') : t('applications.tabs.application')}
                </div>
                <div className="application-actions">
                  <button 
                    className="download-btn2 btn2 btn2-sm btn2-primary"
                    onClick={() => downloadDocument(app)}
                    title={t('applications.buttons.downloadTitle')}
                  >
                    <i className="fas fa-download"></i> {t('applications.buttons.downloadTitle')}
                  </button>
                  <button
                    className="delete-btn2 btn2 btn2-sm btn2-danger"
                    onClick={() => openDeleteModal(app)}
                   title={t('applications.buttons.deleteTitle')}

                  >
                    <i className="fas fa-trash-alt"></i> {t('applications.buttons.deleteTitle')}
                  </button>
                </div>
              </div>
              
              <div className="application-date">
                <i className="far fa-calendar"></i> 
                {formatDate(app.created_at)}
              </div>
              
              <div className="application-status">
                <span className={`status-badge2 ${getStatusClass(app.status)}`}>
                  <i className={`fas fa-${app.status === 'approved' ? 'check' : 
                                  app.status === 'rejected' ? 'times' : 
                                  app.status === 'viewed' ? 'eye' : 'paper-plane'}`}></i>
                  {t(`applications.status.${app.status}`)}
                </span>
              </div>
              
              <div className="application-details">
                <div className="detail-row">
                  <strong><i className="fas fa-user"></i> {t('applications.applicationDetails.fio')}:</strong> 
                  {app.surname} {app.name}
                </div>
                <div className="detail-row">
                  <strong><i className="fas fa-bed"></i> {t('applications.applicationDetails.room')}:</strong> 
                  №{app.n_room}
                </div>
                <div className="detail-row">
                  <strong><i className="fas fa-phone"></i> {t('applications.applicationDetails.phone')}:</strong> 
                  {app.phone}
                </div>
                <div className="detail-row">
                  <strong><i className="fas fa-file-alt"></i> {t('applications.applicationDetails.file')}:</strong> 
                  {app.file_name}
                </div>
              </div>
              
              {app.updated_at !== app.created_at && (
                <div className="application-updated">
                  <small>
                    <i className="fas fa-sync-alt"></i> 
                    {t('applications.applicationDetails.updated')}: {formatDate(app.updated_at)}
                  </small>
                </div>
              )}
            </div>
          ))
        }
      </div>
    )}
  </div>
)}

{isAuthenticated && applications.length === 0 && !loading && (
  <div className="no-applications">
    <div className="no-applications-icon">
      <i className="fas fa-file-alt fa-3x"></i>
    </div>
    <h3>{t('applications.noApplications.title')}</h3>
    <p>{t('applications.noApplications.description')}</p>
  </div>
)}
        </section>
      </div>
    </div>
  );
};

export default ApplicationsPage;