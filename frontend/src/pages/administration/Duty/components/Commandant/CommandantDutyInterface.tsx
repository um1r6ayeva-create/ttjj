import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './CommandantDutyInterface.css';
import ReportViewModal from './ReportViewModal';

interface CompletedReport {
  id: number;
  duty_id: number;
  duty_type: string;
  room_number: number;
  floor: number;
  student_id: number;
  student_name: string;
  description: string;
  submitted_at: string;
  reviewed_at: string;
  status: 'confirmed' | 'rejected';
  reviewer_name: string;
  review_notes: string | null;
}

interface DutyReport {
  id: number;
  duty_id: number;
  student_id: number;
  description: string;
  submitted_at: string;
  status: 'waiting' | 'confirmed' | 'rejected';
  reviewed_at: string | null;
  reviewed_by: number | null;
  review_notes: string | null;
  photos?: Array<{
    id: number;
    photo_url: string;
    file_name: string;
    uploaded_at: string;
  }>;
  student_name?: string;
}

interface Duty {
  id: number;
  duty_type: string;
  room_number: number;
  floor: number;
  date_assigned: string;
  date_due: string;
  status: 'pending' | 'submitted' | 'confirmed' | 'rejected' | 'expired';
  notes?: string;
  assigned_by_id: number;
}

interface DutyWithReport extends Duty {
  report?: DutyReport;
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'https://ttjj.onrender.com'}/api/v1`;

const CommandantDutyInterface = () => {
  const { t } = useTranslation();
  const [duties, setDuties] = useState<DutyWithReport[]>([]);
  const [reports, setReports] = useState<DutyReport[]>([]);
  const [completedReports, setCompletedReports] = useState<CompletedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для модальных окон
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DutyReport | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'confirm' | 'reject';
    reportId: number;
  } | null>(null);
  
  // Уведомления
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dutiesRes = await api.get('/duties/commandant/pending');
      const reportsRes = await api.get('/duty-reports/pending');
      const completedRes = await api.get('/duties/commandant/completed');
      
      setDuties(dutiesRes.data);
      setReports(reportsRes.data);
      setCompletedReports(completedRes.data);
      
    } catch (err: any) {
      console.error(t('commandantDuty.states.errorLoading'), err);
      setError(err.response?.data?.detail || err.message || t('commandantDuty.states.errorLoading'));
      setDuties([]);
      setReports([]);
      setCompletedReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const dutiesWithReports = useMemo(() => {
    return duties.map(duty => {
      const dutyReports = reports.filter(report => report.duty_id === duty.id);
      return {
        ...duty,
        report: dutyReports[0]
      };
    });
  }, [duties, reports]);

  const waitingReports = useMemo(
    () => dutiesWithReports.filter(d => d.report?.status === 'waiting'),
    [dutiesWithReports]
  );

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' });
    }, 3000);
  };

  const reviewReport = async (reportId: number, status: 'confirmed' | 'rejected', reviewNotes?: string) => {
    try {
      await api.post(`/duty-reports/${reportId}/review`, {
        status,
        review_notes: reviewNotes || ''
      });
      
      await fetchData();
      showNotification('success', 
        status === 'confirmed' 
          ? t('commandantDuty.notifications.reportConfirmed')
          : t('commandantDuty.notifications.reportRejected')
      );
      
    } catch (err: any) {
      console.error(t('commandantDuty.notifications.errorConfirming'), err);
      showNotification('error', 
        status === 'confirmed'
          ? t('commandantDuty.notifications.errorConfirming')
          : t('commandantDuty.notifications.errorRejecting')
      );
    }
  };

  const confirmDuty = async (dutyId: number) => {
    try {
      await api.post(`/duties/${dutyId}/confirm`);
      await fetchData();
      showNotification('success', t('commandantDuty.notifications.dutyConfirmed'));
    } catch (err: any) {
      console.error(t('commandantDuty.notifications.errorConfirmingDuty'), err);
      showNotification('error', t('commandantDuty.notifications.errorConfirmingDuty'));
    }
  };

  const openViewReportModal = async (report: DutyReport) => {
    try {
      const response = await api.get(`/duty-reports/${report.id}`);
      setSelectedReport(response.data);
      setIsViewReportModalOpen(true);
    } catch (err: any) {
      console.error(t('commandantDuty.notifications.errorLoadingReport'), err);
      showNotification('error', t('commandantDuty.notifications.errorLoadingReport'));
    }
  };

  const openConfirmDialog = (reportId: number) => {
    setCurrentAction({ type: 'confirm', reportId });
    setIsConfirmDialogOpen(true);
  };

  const openRejectDialog = (reportId: number) => {
    setCurrentAction({ type: 'reject', reportId });
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReport = async () => {
    if (currentAction?.type === 'confirm' && currentAction.reportId) {
      await reviewReport(currentAction.reportId, 'confirmed', t('commandantDuty.notifications.reportConfirmed'));
    }
    setIsConfirmDialogOpen(false);
  };

  const handleRejectReport = async (rejectNotes: string) => {
    if (currentAction?.type === 'reject' && currentAction.reportId) {
      await reviewReport(currentAction.reportId, 'rejected', rejectNotes);
    }
    setIsRejectDialogOpen(false);
  };

 const getDutyTypeText = (type: string): string => {
  const dutyKey = String(type).toLowerCase();
  return t(`commandantDuty.dutyTypes.${dutyKey}`, {
    defaultValue: t('commandantDuty.dutyTypes.default'),
  });
};

const getDutyStatusText = (status: string): string => {
  const statusKey = String(status).toLowerCase();
  return t(`commandantDuty.dutyStatuses.${statusKey}`, {
    defaultValue: status,
  });
};

const getReportStatusText = (status: string): string => {
  const statusKey = String(status).toLowerCase();
  return t(`commandantDuty.reportStatuses.${statusKey}`, {
    defaultValue: status,
  });
};
  // Исправленные функции форматирования даты
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      } as Intl.DateTimeFormatOptions);
    } catch {
      return dateString;
    }
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

  const renderDutyCard = (duty: DutyWithReport) => (
    <div key={duty.id} className={`duty-card ${duty.status}`}>
      <div className="duty-card-header">
        <div className="duty-type">
          <h3>{getDutyTypeText(duty.duty_type)}</h3>
          <span className="room-info">
            {t('commandantDuty.dutyCard.room')} {duty.room_number}, {duty.floor} {t('commandantDuty.dutyCard.floor')}
          </span>
        </div>
        <span className={`status-badge status-${duty.status}`}>
          {getDutyStatusText(duty.status)}
        </span>
      </div>
      
      <div className="duty-info">
        <div className="info-row">
          <span className="label">{t('commandantDuty.dutyCard.dueDate')}:</span>
          <span className="value">{formatDate(duty.date_due)}</span>
        </div>
        
        {duty.notes && (
          <div className="info-row">
            <span className="label">{t('commandantDuty.dutyCard.notes')}:</span>
            <span className="value notes">{duty.notes}</span>
          </div>
        )}
        
        {duty.report && (
          <div className="report-section">
            <div className="report-header">
              <h4>{t('commandantDuty.dutyCard.studentReport')}</h4>
              <span className={`report-status status-${duty.report.status}`}>
                {getReportStatusText(duty.report.status)}
              </span>
            </div>
            
            <div className="report-info">
              <p>
                <strong>{t('commandantDuty.dutyCard.student')}:</strong> {duty.report.student_name || `ID: ${duty.report.student_id}`}
              </p>
              <p>
                <strong>{t('commandantDuty.dutyCard.submitted')}:</strong> {formatDate(duty.report.submitted_at)}
              </p>
              <p className="description-preview">
                <strong>{t('commandantDuty.dutyCard.description')}:</strong> {duty.report.description.substring(0, 150)}...
              </p>
              
              {duty.report.photos && duty.report.photos.length > 0 && (
                <p>
                  <strong>{t('commandantDuty.dutyCard.photos')}:</strong> {duty.report.photos.length} {t('commandantDuty.dutyCard.photosCount')}
                </p>
              )}
            </div>
            
            {duty.report.status === 'waiting' && (
              <div className="action-buttons">
                <button 
                  className="btn view-btn"
                  onClick={() => openViewReportModal(duty.report!)}
                  aria-label={t('commandantDuty.actions.viewReport')}
                >
                  {t('commandantDuty.actions.viewReport')}
                </button>
                
                <button 
                  className="btn confirm-btn"
                  onClick={() => openConfirmDialog(duty.report!.id)}
                  aria-label={t('commandantDuty.actions.confirmReport')}
                >
                  {t('commandantDuty.actions.confirmReport')}
                </button>
                
                <button 
                  className="btn reject-btn"
                  onClick={() => openRejectDialog(duty.report!.id)}
                  aria-label={t('commandantDuty.actions.rejectReport')}
                >
                  {t('commandantDuty.actions.rejectReport')}
                </button>
              </div>
            )}
            
            {duty.report.status === 'confirmed' && duty.status !== 'confirmed' && (
              <div className="action-buttons">
                <button 
                  className="btn secondary-btn"
                  onClick={() => confirmDuty(duty.id)}
                  aria-label={t('commandantDuty.actions.confirmDuty')}
                >
                  {t('commandantDuty.actions.confirmDuty')}
                </button>
              </div>
            )}
          </div>
        )}
        
        {!duty.report && duty.status === 'submitted' && (
          <div className="no-report">
            <p>{t('commandantDuty.dutyCard.awaitingReport')}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompletedReportCard = (report: CompletedReport) => (
    <div key={report.id} className="completed-report-card">
      <div className="completed-header">
        <div>
          <h4>{getDutyTypeText(report.duty_type)}</h4>
          <span className="room-info">
            {t('commandantDuty.completedReports.room')} {report.room_number}
          </span>
        </div>
        <span className={`report-status status-${report.status}`}>
          {report.status === 'confirmed' 
            ? t('commandantDuty.reportStatuses.confirmed')
            : t('commandantDuty.reportStatuses.rejected')
          }
        </span>
      </div>
      
      <div className="completed-info">
        <div className="info-row">
          <span className="label">{t('commandantDuty.dutyCard.student')}:</span>
          <span className="value">{report.student_name}</span>
        </div>
        
        <div className="info-row">
          <span className="label">{t('commandantDuty.completedReports.submittedAt')}:</span>
          <span className="value">{formatDateTime(report.submitted_at)}</span>
        </div>
        
        <div className="info-row">
          <span className="label">{t('commandantDuty.completedReports.checkedBy')}:</span>
          <span className="value">{report.reviewer_name}</span>
        </div>
        
        {report.review_notes && (
          <div className="info-row">
            <span className="label">{t('commandantDuty.dutyCard.notes')}:</span>
            <span className="value notes">{report.review_notes}</span>
          </div>
        )}
        
        <div className="description">
          <p>{report.description.substring(0, 200)}...</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>{t('commandantDuty.states.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>{t('commandantDuty.states.errorLoading')}</h3>
        <p>{error}</p>
        <button className="btn primary-btn" onClick={fetchData}>
          {t('commandantDuty.states.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="commandant-interface">
      {/* Уведомление */}
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotification({ ...notification, show: false })}
              aria-label={t('commandantDuty.actions.close')}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Диалог подтверждения отчета */}
      {isConfirmDialogOpen && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <h3>{t('commandantDuty.dialogs.confirmTitle')}</h3>
              <button 
                className="close-btn" 
                onClick={() => setIsConfirmDialogOpen(false)}
                aria-label={t('commandantDuty.actions.close')}
              >
                ×
              </button>
            </div>
            <div className="confirm-dialog-body">
              <p>{t('commandantDuty.dialogs.confirmMessage')}</p>
            </div>
            <div className="confirm-dialog-footer">
              <button 
                className="btn cancel-btn" 
                onClick={() => setIsConfirmDialogOpen(false)}
                aria-label={t('commandantDuty.dialogs.cancel')}
              >
                {t('commandantDuty.dialogs.cancel')}
              </button>
              <button 
                className="btn confirm-btn" 
                onClick={handleConfirmReport}
                aria-label={t('commandantDuty.dialogs.confirm')}
              >
                {t('commandantDuty.dialogs.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Диалог отклонения отчета */}
      {isRejectDialogOpen && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-header">
              <h3>{t('commandantDuty.dialogs.rejectTitle')}</h3>
              <button 
                className="close-btn" 
                onClick={() => setIsRejectDialogOpen(false)}
                aria-label={t('commandantDuty.actions.close')}
              >
                ×
              </button>
            </div>
            <div className="confirm-dialog-body">
              <div className="reject-form">
                <p>{t('commandantDuty.dialogs.rejectMessage')}</p>
                <textarea 
                  id="reject-notes"
                  className="reject-textarea"
                  placeholder={t('commandantDuty.dialogs.rejectPlaceholder')}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      const target = e.target as HTMLTextAreaElement;
                      handleRejectReport(target.value);
                    }
                  }}
                  aria-label={t('commandantDuty.dialogs.rejectMessage')}
                />
              </div>
            </div>
            <div className="confirm-dialog-footer">
              <button 
                className="btn cancel-btn" 
                onClick={() => setIsRejectDialogOpen(false)}
                aria-label={t('commandantDuty.dialogs.cancel')}
              >
                {t('commandantDuty.dialogs.cancel')}
              </button>
              <button 
                className="btn reject-btn" 
                onClick={() => {
                  const textarea = document.getElementById('reject-notes') as HTMLTextAreaElement;
                  handleRejectReport(textarea.value);
                }}
                aria-label={t('commandantDuty.dialogs.reject')}
              >
                {t('commandantDuty.dialogs.reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно просмотра отчета */}
      {isViewReportModalOpen && selectedReport && (
        <ReportViewModal
          report={selectedReport}
          onClose={() => setIsViewReportModalOpen(false)}
          onConfirm={() => openConfirmDialog(selectedReport.id)}
          onReject={() => openRejectDialog(selectedReport.id)}
          api={api}
        />
      )}

      <header className="page-header">
        <div className="header-main">
          <h1>{t('commandantDuty.title')}</h1>
          <button 
            className="btn refresh-btn" 
            onClick={fetchData}
            aria-label={t('commandantDuty.refresh')}
          >
            {t('commandantDuty.refresh')}
          </button>
        </div>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">{t('commandantDuty.stats.waitingReports')}</span>
            <span className="stat-value">{waitingReports.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('commandantDuty.stats.checkHistory')}</span>
            <span className="stat-value">{completedReports.length}</span>
          </div>
        </div>
      </header>

      <div className="sections-container">
        <section className="duty-section">
          <div className="section-header">
            <h2>{t('commandantDuty.waitingReports')}</h2>
            <span className="count-badge">{waitingReports.length}</span>
          </div>
          <div className="cards-grid">
            {waitingReports.length > 0 ? waitingReports.map(renderDutyCard) : (
              <div className="empty-state">
                <p>{t('commandantDuty.states.noWaitingReports')}</p>
              </div>
            )}
          </div>
        </section>

        <section className="duty-section">
          <div className="section-header">
            <h2>{t('commandantDuty.history')}</h2>
            <span className="count-badge">{completedReports.length}</span>
          </div>
          <div className="cards-grid">
            {completedReports.length > 0 ? completedReports.map(renderCompletedReportCard) : (
              <div className="empty-state">
                <p>{t('commandantDuty.states.noHistory')}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CommandantDutyInterface;