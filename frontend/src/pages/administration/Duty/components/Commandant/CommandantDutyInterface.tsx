import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../../contexts/AuthContext';
import './CommandantDutyInterface.css';
import ReportViewModal from './ReportViewModal';

export interface CompletedReport {
  id: number;
  duty_id?: number;
  global_duty_id?: number;
  room_number?: number;
  floor?: number;
  student_name: string;
  duty_type: string;
  submitted_at: string;
  reviewed_at: string;
  status: 'confirmed' | 'rejected';
  isGlobal?: boolean;
  reviewer_name?: string;
  review_notes: string | null;
  description: string;
}

export interface DutyReport {
  id: number;
  duty_id?: number;
  global_duty_id?: number;
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
  photos: Array<{
    id: number;
    photo_url: string;
    file_name: string;
    uploaded_at: string;
  }>;
  student_name?: string;
  isGlobal?: boolean;
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

const CommandantDutyInterface = () => {
  const { t } = useTranslation();
  const [duties, setDuties] = useState<DutyWithReport[]>([]);
  const [reports, setReports] = useState<DutyReport[]>([]);
  const [globalReports, setGlobalReports] = useState<any[]>([]);
  const [completedReports, setCompletedReports] = useState<any[]>([]);
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
    isGlobal?: boolean;
  } | null>(null);
  const [openingModalId, setOpeningModalId] = useState<number | null>(null);
  
  // Уведомления
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });


  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dutiesRes = await api.get('/duties/commandant/pending');
      const reportsRes = await api.get('/duty-reports/pending');
      const globalReportsRes = await api.get('/global-duty-reports/pending');
      const completedRes = await api.get('/duties/commandant/completed');
      const globalCompletedRes = await api.get('/global-duty-reports/history');
      
      console.log("CommandantDutyInterface: Data fetched successfully", {
        duties: dutiesRes.data,
        reports: reportsRes.data,
        global: globalReportsRes.data,
        completed: completedRes.data,
        globalHistory: globalCompletedRes.data
      });

      setDuties(Array.isArray(dutiesRes.data) ? dutiesRes.data : []);
      setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
      setGlobalReports(Array.isArray(globalReportsRes.data) ? globalReportsRes.data : []);
      
      const getSafeTime = (dateStr: any) => {
        if (!dateStr) return 0;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };

      const completedData = Array.isArray(completedRes.data) ? completedRes.data : [];
      const globalHistoryData = Array.isArray(globalCompletedRes.data) ? globalCompletedRes.data : [];

      const combinedHistory: CompletedReport[] = [
        ...(Array.isArray(completedData) ? completedData : [])
          .filter(Boolean)
          .map((r: any) => ({ ...r, isGlobal: false })),
        ...(Array.isArray(globalHistoryData) ? globalHistoryData : [])
          .filter(Boolean)
          .map((r: any) => ({ ...r, isGlobal: true }))
      ].sort((a, b) => {
        const timeA = getSafeTime(a?.reviewed_at || a?.submitted_at);
        const timeB = getSafeTime(b?.reviewed_at || b?.submitted_at);
        return timeB - timeA;
      });
      
      console.log("CommandantDutyInterface: Combined history", combinedHistory);
      setCompletedReports(combinedHistory);
      
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

  const dutiesWithReports = useMemo((): DutyWithReport[] => {
    if (!Array.isArray(duties)) return [];
    return duties
      .filter((duty): duty is DutyWithReport => duty !== null && duty !== undefined)
      .map(duty => {
        const reportsList = Array.isArray(reports) ? reports : [];
        const dutyReports = reportsList.filter(report => report && report.duty_id === duty.id);
        return {
          ...duty,
          report: dutyReports[0] || undefined
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

  const reviewReport = async (reportId: number, status: 'confirmed' | 'rejected', reviewNotes?: string, isGlobal: boolean = false) => {
    try {
      const endpoint = isGlobal 
        ? `/global-duty-reports/${reportId}/review`
        : `/duty-reports/${reportId}/review`;

      await api.post(endpoint, {
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

  const openViewReportModal = async (report: DutyReport, isGlobal: boolean = false) => {
    try {
      setOpeningModalId(report.id);
      const endpoint = isGlobal 
        ? `/global-duty-reports/${report.id}`
        : `/duty-reports/${report.id}`;
      const response = await api.get(endpoint);
      setSelectedReport({ ...response.data, isGlobal });
      setIsViewReportModalOpen(true);
    } catch (err: any) {
      console.error(t('commandantDuty.notifications.errorLoadingReport'), err);
      showNotification('error', t('commandantDuty.notifications.errorLoadingReport'));
    } finally {
      setOpeningModalId(null);
    }
  };

  const openConfirmDialog = (reportId: number, isGlobal: boolean = false) => {
    setCurrentAction({ type: 'confirm', reportId, isGlobal });
    setIsConfirmDialogOpen(true);
  };

  const openRejectDialog = (reportId: number, isGlobal: boolean = false) => {
    setCurrentAction({ type: 'reject', reportId, isGlobal });
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReport = async () => {
    if (currentAction?.type === 'confirm' && currentAction.reportId) {
      await reviewReport(currentAction.reportId, 'confirmed', '', !!currentAction.isGlobal);
    }
    setIsConfirmDialogOpen(false);
  };

  const handleRejectReport = async (rejectNotes: string) => {
    if (currentAction?.type === 'reject' && currentAction.reportId) {
      await reviewReport(currentAction.reportId, 'rejected', rejectNotes, !!currentAction.isGlobal);
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
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('ru-RU', {
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

  const renderDutyCard = (duty: DutyWithReport) => {
    if (!duty) return null;
    return (
      <div key={duty.id} className={`duty-card ${duty.status || 'pending'}`}>
        <div className="duty-card-header">
          <div className="duty-type">
            <h3>{getDutyTypeText(duty.duty_type || 'default')}</h3>
            <span className="room-info">
              {t('commandantDuty.dutyCard.room')} {duty.room_number || '?'}, {duty.floor || '?'} {t('commandantDuty.dutyCard.floor')}
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
                  <strong>{t('commandantDuty.dutyCard.student')}:</strong> {duty.report.student_name || t('commandantDuty.completedReports.unknown')}
                </p>
                <p>
                  <strong>{t('commandantDuty.dutyCard.submitted')}:</strong> {formatDate(duty.report.submitted_at || '')}
                </p>
                <p className="description-preview">
                  <strong>{t('commandantDuty.dutyCard.description')}:</strong> {(duty.report.description || '').substring(0, 150)}...
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
                    disabled={openingModalId === (duty.report?.id)}
                    aria-label={t('commandantDuty.actions.viewReport')}
                  >
                    {openingModalId === (duty.report?.id) ? <div className="loader-small"></div> : t('commandantDuty.actions.viewReport')}
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
  };

  const renderGlobalReportCard = (report: any) => {
    if (!report) return null;
    const reportId = report.id || Math.random();
    return (
      <div key={`global-${reportId}`} className="duty-card waiting">
        <div className="duty-card-header">
          <div className="duty-type">
            <h3>{getDutyTypeText(report.duty_type)}</h3>
            <span className="room-info">
              {t('commandantDuty.dutyCard.floorOnly')}: {report.floor}
            </span>
          </div>
          <span className="status-badge status-submitted">
            {t('commandantDuty.reportStatuses.waiting')}
          </span>
        </div>
        
        <div className="duty-info">
          <div className="report-section">
            <div className="report-info">
              <p>
                <strong>{t('commandantDuty.dutyCard.student')}:</strong> {report.student_name}
              </p>
              <p>
                <strong>{t('commandantDuty.dutyCard.submitted')}:</strong> {formatDate(report.submitted_at)}
              </p>
              <p className="description-preview">
                <strong>{t('commandantDuty.dutyCard.description')}:</strong> {(report.description || '').substring(0, 150)}...
              </p>
              
              {report.photos && Array.isArray(report.photos) && report.photos.length > 0 && (
                <p>
                  <strong>{t('commandantDuty.dutyCard.photos')}:</strong> {report.photos.length} {t('commandantDuty.dutyCard.photosCount')}
                </p>
              )}
            </div>
            
            <div className="action-buttons">
              <button 
                className="btn view-btn"
                onClick={() => openViewReportModal(report, true)}
                disabled={openingModalId === report.id}
                aria-label={t('commandantDuty.actions.viewReport')}
              >
                {openingModalId === report.id ? <div className="loader-small"></div> : t('commandantDuty.actions.viewReport')}
              </button>
              
              <button 
                className="btn confirm-btn"
                onClick={() => openConfirmDialog(report.id, true)}
                aria-label={t('commandantDuty.actions.confirmReport')}
              >
                {t('commandantDuty.actions.confirmReport')}
              </button>
              
              <button 
                className="btn reject-btn"
                onClick={() => openRejectDialog(report.id, true)}
                aria-label={t('commandantDuty.actions.rejectReport')}
              >
                {t('commandantDuty.actions.rejectReport')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderCompletedReportCard = (report: CompletedReport) => {
    if (!report) return null;
    const reportKey = `completed-${report.isGlobal ? 'global' : 'room'}-${report.id || Math.random()}`;
    return (
      <div key={reportKey} className="completed-report-card">
        <div className="completed-header">
          <div>
            <h4>{getDutyTypeText(report.duty_type)}</h4>
            <span className="room-info">
               {report.isGlobal 
                 ? `${t('commandantDuty.dutyCard.floorOnly')}: ${report.floor || '?'}`
                 : `${t('commandantDuty.completedReports.room')} ${report.room_number || '?'}`
               }
            </span>
          </div>
          <span className={`report-status status-${report.status || 'unknown'}`}>
            {report.status === 'confirmed' 
              ? t('commandantDuty.reportStatuses.confirmed')
              : report.status === 'rejected'
              ? t('commandantDuty.reportStatuses.rejected')
              : t('commandantDuty.reportStatuses.unknown', { defaultValue: report.status || '?' })
            }
          </span>
        </div>
        
        <div className="completed-info">
          <div className="info-row">
            <span className="label">
              {report.isGlobal ? t('commandantDuty.dutyCard.floorOnly') : t('commandantDuty.completedReports.room')}:
            </span>
            <span className="value">
              {report.isGlobal ? (report.floor || '—') : (report.room_number || '—')}
            </span>
          </div>
          
          <div className="info-row">
            <span className="label">{t('commandantDuty.completedReports.submittedAt')}:</span>
            <span className="value">{formatDateTime(report.submitted_at)}</span>
          </div>
          
          <div className="info-row">
            <span className="label">{t('commandantDuty.completedReports.checkedBy')}:</span>
            <span className="value">{report.reviewer_name || t('commandantDuty.completedReports.unknown')}</span>
          </div>
          
          {report.review_notes && (
            <div className="info-row">
              <span className="label">{t('commandantDuty.dutyCard.notes')}:</span>
              <span className="value notes">{report.review_notes}</span>
            </div>
          )}
          
          <div className="description">
            <p>{(report.description || '').substring(0, 200)}{report.description?.length > 200 ? '...' : ''}</p>
          </div>
        </div>
      </div>
    );
  };

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
          onConfirm={() => selectedReport && openConfirmDialog(selectedReport.id, !!selectedReport.isGlobal)}
          onReject={() => selectedReport && openRejectDialog(selectedReport.id, !!selectedReport.isGlobal)}
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
            <span className="stat-value">{waitingReports.length + globalReports.length}</span>
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

        {/* Секция для общих дежурств */}
        <section className="duty-section">
          <div className="section-header">
            <h2>{t('commandantDuty.globalReports')}</h2>
            <span className="count-badge">{globalReports.length}</span>
          </div>
          <div className="cards-grid">
            {globalReports.length > 0 ? globalReports.map(renderGlobalReportCard) : (
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