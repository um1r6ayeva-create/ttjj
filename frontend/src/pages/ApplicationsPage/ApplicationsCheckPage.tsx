import { useState, useEffect, useCallback } from 'react';
import './ApplicationsCheckPage.css';
import Modal from '../../components/comon/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import React from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

interface Statistics {
  total: number;
  sent: number;
  viewed: number;
  approved: number;
  rejected: number;
}

const ITEMS_PER_PAGE = 10;

const ApplicationsCheckPage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, token } = useAuth();
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationData[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({ total: 0, sent: 0, viewed: 0, approved: 0, rejected: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'commandant') {
      fetchApplications();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterApplications();
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
  }, [applications, selectedStatus, selectedType, searchTerm]);

  const showModal = (message: string, type: 'success' | 'error' = 'success') => {
    setModalMessage(message);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE_URL}/api/v1/applications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error('Ошибка при загрузке заявок');
      const data = await resp.json();
      setApplications(data);
      calculateStatistics(data);
    } catch (err) {
      console.error(err);
      showModal(t('applicationsCheckPage.errorLoad'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = useCallback((apps: ApplicationData[]) => {
    const stats: Statistics = {
      total: apps.length,
      sent: apps.filter(app => app.status === 'sent').length,
      viewed: apps.filter(app => app.status === 'viewed').length,
      approved: apps.filter(app => app.status === 'approved').length,
      rejected: apps.filter(app => app.status === 'rejected').length,
    };
    setStatistics(stats);
  }, []);

  const filterApplications = useCallback(() => {
    let filtered = [...applications];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(app => app.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(app => app.type === selectedType);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(term) ||
        app.surname.toLowerCase().includes(term) ||
        app.n_room.toString().includes(term) ||
        app.phone.includes(term)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, selectedStatus, selectedType, searchTerm]);

  const updateStatus = async (app: ApplicationData, status: ApplicationData['status']) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/v1/applications/${app.id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({ status }),
      });
      if (!resp.ok) throw new Error('Не удалось обновить статус');
      const updated = await resp.json();
      setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
      
      const statusTranslations: Record<string, string> = {
        sent: t('applicationsCheckPage.statusSent'),
        viewed: t('applicationsCheckPage.statusViewed'),
        approved: t('applicationsCheckPage.statusApproved'),
        rejected: t('applicationsCheckPage.statusRejected'),
      };
      
      const statusText = statusTranslations[updated.status] || updated.status;
      const message = t('applicationsCheckPage.successUpdate', { status: statusText });
      showModal(message, 'success');
    } catch (err) {
      console.error(err);
      showModal(t('applicationsCheckPage.errorUpdate'), 'error');
    }
  };

  const downloadDocument = (application: ApplicationData) => {
    if (!application.file_path) {
      showModal(t('applicationsCheckPage.errorDownload'), 'error');
      return;
    }
    const filePath = application.file_path.replace(/\\/g, '/');
    const fileUrl = `${API_BASE_URL}/uploads/${filePath}`;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = application.file_name || 'document';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getStatusIcon = (status: string) => {
    const map: Record<string, string> = {
      sent: '⏳',
      viewed: '👁️',
      approved: '✅',
      rejected: '❌',
    };
    return map[status] || '';
  };

  const getTypeIcon = (type: string) => {
    return type === 'guarantee' ? '📄' : '📝';
  };

  const getTypeText = (type: string) => {
    return type === 'guarantee' 
      ? t('applicationsCheckPage.typeGuarantee')
      : t('applicationsCheckPage.typeApplication');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const toggleCardExpand = (id: number) => {
    // Исправляем: передаем только id и используем предыдущее состояние
    setExpandedCard(prev => prev === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      sent: 'var(--status-sent)',
      viewed: 'var(--status-viewed)',
      approved: 'var(--status-approved)',
      rejected: 'var(--status-rejected)',
    };
    return colors[status] || '#666';
  };

  // Пагинация
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = filteredApplications.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Сбрасываем открытую карточку при смене страницы
    setExpandedCard(null);
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      sent: t('applicationsCheckPage.statusSent'),
      viewed: t('applicationsCheckPage.statusViewed'),
      approved: t('applicationsCheckPage.statusApproved'),
      rejected: t('applicationsCheckPage.statusRejected'),
    };
    return map[status] || status;
  };

  if (!isAuthenticated || user?.role !== 'commandant') {
    return (
      <div className="applications-check-not-authorized">
        <div className="applications-check-not-authorized-content">
          <div className="applications-check-lock-icon">🔒</div>
          <h2>{t('applicationsCheckPage.noAccessTitle')}</h2>
          <p>{t('applicationsCheckPage.noAccessMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-check-page">
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalType === 'success' ? t('modal.success') : t('modal.error')}
        type={modalType}
      >
        <p>{modalMessage}</p>
        <button className="modal-btn modal-btn-primary" onClick={closeModal}>
          {t('modal.close')}
        </button>
      </Modal>

      <div className="applications-check-header">
        <div className="applications-check-header-content">
          <h1 className="applications-check-title">{t('applicationsCheckPage.title')}</h1>
          <p className="applications-check-subtitle">{t('applicationsCheckPage.subtitle')}</p>
        </div>
        <div className="applications-check-header-actions">
          <button 
            className="applications-check-btn-refresh" 
            onClick={fetchApplications} 
            disabled={loading}
          >
            {loading ? '🔄' : '🔄'} {t('applicationsCheckPage.refreshButton')}
          </button>
        </div>
      </div>

      <div className="applications-check-stats">
        <div className="applications-check-stat-card total">
          <div className="applications-check-stat-icon">📊</div>
          <div className="applications-check-stat-info">
            <div className="applications-check-stat-value">{statistics.total}</div>
            <div className="applications-check-stat-label">{t('applicationsCheckPage.statsTotal')}</div>
          </div>
        </div>
        <div className="applications-check-stat-card sent">
          <div className="applications-check-stat-icon">⏳</div>
          <div className="applications-check-stat-info">
            <div className="applications-check-stat-value">{statistics.sent}</div>
            <div className="applications-check-stat-label">{t('applicationsCheckPage.statsSent')}</div>
          </div>
        </div>
        <div className="applications-check-stat-card viewed">
          <div className="applications-check-stat-icon">👁️</div>
          <div className="applications-check-stat-info">
            <div className="applications-check-stat-value">{statistics.viewed}</div>
            <div className="applications-check-stat-label">{t('applicationsCheckPage.statsViewed')}</div>
          </div>
        </div>
        <div className="applications-check-stat-card approved">
          <div className="applications-check-stat-icon">✅</div>
          <div className="applications-check-stat-info">
            <div className="applications-check-stat-value">{statistics.approved}</div>
            <div className="applications-check-stat-label">{t('applicationsCheckPage.statsApproved')}</div>
          </div>
        </div>
        <div className="applications-check-stat-card rejected">
          <div className="applications-check-stat-icon">❌</div>
          <div className="applications-check-stat-info">
            <div className="applications-check-stat-value">{statistics.rejected}</div>
            <div className="applications-check-stat-label">{t('applicationsCheckPage.statsRejected')}</div>
          </div>
        </div>
      </div>

      <div className="applications-check-controls">
        <div className="applications-check-search">
          <input
            type="text"
            placeholder={t('applicationsCheckPage.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="applications-check-search-input"
          />
          <span className="applications-check-search-icon">🔍</span>
        </div>

        <div className="applications-check-filters">
          <div className="applications-check-filter-group">
            <label>{t('applicationsCheckPage.filterStatus')}</label>
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="applications-check-filter-select"
            >
              <option value="all">{t('applicationsCheckPage.filterAllStatuses')}</option>
              <option value="sent">{t('applicationsCheckPage.statusSent')}</option>
              <option value="viewed">{t('applicationsCheckPage.statusViewed')}</option>
              <option value="approved">{t('applicationsCheckPage.statusApproved')}</option>
              <option value="rejected">{t('applicationsCheckPage.statusRejected')}</option>
            </select>
          </div>

          <div className="applications-check-filter-group">
            <label>{t('applicationsCheckPage.filterType')}</label>
            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="applications-check-filter-select"
            >
              <option value="all">{t('applicationsCheckPage.filterAllTypes')}</option>
              <option value="application">{t('applicationsCheckPage.typeApplication')}</option>
              <option value="guarantee">{t('applicationsCheckPage.typeGuarantee')}</option>
            </select>
          </div>

          <div className="applications-check-filter-group">
            <span className="applications-check-results">
              {t('applicationsCheckPage.resultsCount', { count: filteredApplications.length })}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="applications-check-loading">
          <div className="applications-check-loading-spinner"></div>
          <p>{t('applicationsCheckPage.loading')}</p>
        </div>
      ) : (
        <>
          <div className="applications-check-grid">
            {currentApplications.length === 0 ? (
              <div className="applications-check-no-results">
                <div className="applications-check-no-results-icon">📭</div>
                <h3>{t('applicationsCheckPage.noResultsTitle')}</h3>
                <p>{t('applicationsCheckPage.noResultsMessage')}</p>
              </div>
            ) : (
              currentApplications.map(app => (
                <div 
                  key={app.id} 
                  className={`applications-check-card ${expandedCard === app.id ? 'applications-check-card-expanded' : ''}`}
                >
                  <div className="applications-check-card-header">
                    <div className="applications-check-applicant-info">
                      <div className="applications-check-applicant-name">
                        <span className="applications-check-name">{app.surname} {app.name}</span>
                        <span className="applications-check-room">
                          {t('applicationsCheckPage.roomBadge', { room: app.n_room })}
                        </span>
                      </div>
                      <div className="applications-check-applicant-meta">
                        <span className="applications-check-phone">📱 {app.phone}</span>
                      </div>
                    </div>
                    <div 
                      className="applications-check-status" 
                      style={{ backgroundColor: getStatusColor(app.status) }}
                    >
                      {getStatusIcon(app.status)} {getStatusText(app.status)}
                    </div>
                  </div>

                  <div className="applications-check-card-content">
                    <div className="applications-check-type">
                      <span className="applications-check-type-icon">{getTypeIcon(app.type)}</span>
                      <span className="applications-check-type-text">{getTypeText(app.type)}</span>
                    </div>
                    
                    <div className="applications-check-dates">
                      <div className="applications-check-date">
                        <span className="applications-check-date-label">{t('applicationsCheckPage.createdDate')}</span>
                        <span className="applications-check-date-value">{formatDate(app.created_at)}</span>
                      </div>
                      {app.updated_at !== app.created_at && (
                        <div className="applications-check-date">
                          <span className="applications-check-date-label">{t('applicationsCheckPage.updatedDate')}</span>
                          <span className="applications-check-date-value">{formatDate(app.updated_at)}</span>
                        </div>
                      )}
                    </div>

                    {expandedCard === app.id && (
                      <div className="applications-check-expanded">
                        <div className="applications-check-file">
                          <span className="applications-check-file-label">{t('applicationsCheckPage.documentLabel')}</span>
                          <span className="applications-check-file-name">
                            {app.file_name || t('applicationsCheckPage.documentNoName')}
                          </span>
                        </div>
                        <div className="applications-check-expanded-actions">
                          <button 
                            className="applications-check-btn-download"
                            onClick={() => downloadDocument(app)}
                          >
                            {t('applicationsCheckPage.downloadButton')}
                          </button>
                          
                          <div className="applications-check-status-actions">
                            <span className="applications-check-actions-label">
                              {t('applicationsCheckPage.statusActions')}
                            </span>
                            <div className="applications-check-action-buttons">
                              {app.status === 'sent' && (
                                <>
                                  <button 
                                    className="applications-check-status-btn viewed"
                                    onClick={() => updateStatus(app, 'viewed')}
                                  >
                                    {t('applicationsCheckPage.actionViewed')}
                                  </button>
                                  <button 
                                    className="applications-check-status-btn approved"
                                    onClick={() => updateStatus(app, 'approved')}
                                  >
                                    {t('applicationsCheckPage.actionApprove')}
                                  </button>
                                  <button 
                                    className="applications-check-status-btn rejected"
                                    onClick={() => updateStatus(app, 'rejected')}
                                  >
                                    {t('applicationsCheckPage.actionReject')}
                                  </button>
                                </>
                              )}
                              {app.status === 'viewed' && (
                                <>
                                  <button 
                                    className="applications-check-status-btn approved"
                                    onClick={() => updateStatus(app, 'approved')}
                                  >
                                    {t('applicationsCheckPage.actionApprove')}
                                  </button>
                                  <button 
                                    className="applications-check-status-btn rejected"
                                    onClick={() => updateStatus(app, 'rejected')}
                                  >
                                    {t('applicationsCheckPage.actionReject')}
                                  </button>
                                  <button 
                                    className="applications-check-status-btn sent"
                                    onClick={() => updateStatus(app, 'sent')}
                                  >
                                    {t('applicationsCheckPage.actionReturn')}
                                  </button>
                                </>
                              )}
                              {(app.status === 'approved' || app.status === 'rejected') && (
                                <button 
                                  className="applications-check-status-btn sent"
                                  onClick={() => updateStatus(app, 'sent')}
                                >
                                  {t('applicationsCheckPage.actionReturn')}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="applications-check-card-footer">
                    <div className="applications-check-footer-actions">
                      <button 
                        className="applications-check-btn-expand"
                        onClick={() => toggleCardExpand(app.id)}
                      >
                        {expandedCard === app.id 
                          ? t('applicationsCheckPage.collapseButton')
                          : t('applicationsCheckPage.expandButton')}
                      </button>
                      <button 
                        className="applications-check-btn-quick-download"
                        onClick={() => downloadDocument(app)}
                        title={t('applicationsCheckPage.downloadButton')}
                      >
                        {t('applicationsCheckPage.quickDownload')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="applications-check-pagination">
              <button
                className="applications-check-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← {t('common.previous')}
              </button>
              
              <div className="applications-check-pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (totalPages <= 7) return true;
                    if (page === 1 || page === totalPages) return true;
                    if (page >= currentPage - 2 && page <= currentPage + 2) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="applications-check-pagination-ellipsis">...</span>
                          <button
                            className={`applications-check-pagination-number ${currentPage === page ? 'applications-check-pagination-active' : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return (
                      <button
                        key={page}
                        className={`applications-check-pagination-number ${currentPage === page ? 'applications-check-pagination-active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
              </div>
              
              <button
                className="applications-check-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {t('common.next')} →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApplicationsCheckPage;