import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../../contexts/AuthContext';
import Modal from '../../../../../components/comon/Modal';
import './GlobalDutyInterface.css';

interface GlobalDuty {
  id: number;
  duty_type: 'general_cleaning' | 'community_work';
  date_assigned: string;
  notes?: string;
}


const GlobalDutyInterface = () => {
  const { t } = useTranslation();
  const [duties, setDuties] = useState<GlobalDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Форма создания
  const [dutyType, setDutyType] = useState<'general_cleaning' | 'community_work'>('general_cleaning');
  const [dateAssigned, setDateAssigned] = useState('');
  const [notes, setNotes] = useState('');

  // Форма редактирования
  const [editingDuty, setEditingDuty] = useState<GlobalDuty | null>(null);
  const [editDutyType, setEditDutyType] = useState<'general_cleaning' | 'community_work'>('general_cleaning');
  const [editDateAssigned, setEditDateAssigned] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Модалки
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'info'>('info');

  // Модалка подтверждения удаления
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dutyToDelete, setDutyToDelete] = useState<GlobalDuty | null>(null);


  const fetchDuties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/global-duties/');
      setDuties(res.data);
      setError(null);
    } catch (err: any) {
      console.error(t('globalDutyInterface.modal.loadError'), err);
      setError(err.response?.data?.detail || t('globalDutyInterface.modal.loadError'));
      setDuties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuties();
  }, []);

  const showModal = (title: string, content: string, type: 'success' | 'error' | 'info') => {
    setModalTitle(title);
    setModalContent(content);
    setModalType(type);
    setModalOpen(true);
  };

  const createDuty = async () => {
    if (!dateAssigned) {
      return showModal(
        t('globalDutyInterface.modal.error'),
        t('globalDutyInterface.modal.selectDate'),
        'error'
      );
    }

    try {
      await api.post('/global-duties/', {
        duty_type: dutyType,
        date_assigned: dateAssigned,
        notes: notes || '',
      });
      setDutyType('general_cleaning');
      setDateAssigned('');
      setNotes('');
      fetchDuties();
      showModal(
        t('globalDutyInterface.modal.success'),
        t('globalDutyInterface.modal.dutyCreated'),
        'success'
      );
    } catch (err: any) {
      console.error(t('globalDutyInterface.modal.createError'), err);
      showModal(
        t('globalDutyInterface.modal.error'),
        err.response?.data?.detail || t('globalDutyInterface.modal.createError'),
        'error'
      );
    }
  };

  const startEditDuty = (duty: GlobalDuty) => {
    setEditingDuty(duty);
    setEditDutyType(duty.duty_type);
    setEditDateAssigned(duty.date_assigned.split('T')[0]);
    setEditNotes(duty.notes || '');
  };

  const cancelEdit = () => {
    setEditingDuty(null);
    setEditDutyType('general_cleaning');
    setEditDateAssigned('');
    setEditNotes('');
  };

  const updateDuty = async () => {
    if (!editingDuty) return;
    if (!editDateAssigned) {
      return showModal(
        t('globalDutyInterface.modal.error'),
        t('globalDutyInterface.modal.selectDate'),
        'error'
      );
    }

    try {
      await api.put(`/global-duties/${editingDuty.id}`, {
        duty_type: editDutyType,
        date_assigned: editDateAssigned,
        notes: editNotes || '',
      });
      fetchDuties();
      cancelEdit();
      showModal(
        t('globalDutyInterface.modal.success'),
        t('globalDutyInterface.modal.dutyUpdated'),
        'success'
      );
    } catch (err: any) {
      console.error(t('globalDutyInterface.modal.updateError'), err);
      showModal(
        t('globalDutyInterface.modal.error'),
        err.response?.data?.detail || t('globalDutyInterface.modal.updateError'),
        'error'
      );
    }
  };

  const confirmDeleteDuty = (duty: GlobalDuty) => {
    setDutyToDelete(duty);
    setDeleteModalOpen(true);
  };

  const deleteDuty = async () => {
    if (!dutyToDelete) return;

    try {
      await api.delete(`/global-duties/${dutyToDelete.id}`);
      fetchDuties();
      showModal(
        t('globalDutyInterface.modal.success'),
        t('globalDutyInterface.modal.dutyDeleted'),
        'success'
      );
    } catch (err: any) {
      console.error(t('globalDutyInterface.modal.deleteError'), err);
      showModal(
        t('globalDutyInterface.modal.error'),
        err.response?.data?.detail || t('globalDutyInterface.modal.deleteError'),
        'error'
      );
    } finally {
      setDeleteModalOpen(false);
      setDutyToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getDutyTypeLabel = (type: 'general_cleaning' | 'community_work') => {
    return t(`globalDutyInterface.dutyTypes.${type}`);
  };

  if (loading) return <p className="loading-text">{t('globalDutyInterface.loading')}</p>;
  if (error) return <p className="error-text">{t('globalDutyInterface.error')} {error}</p>;

  return (
    <div className="global-duty-interface">
      <header className="page-header">
        <h1>{t('globalDutyInterface.title')}</h1>
      </header>

      {/* Форма создания */}
      <section className="create-duty">
        <h2>{t('globalDutyInterface.createDuty')}</h2>
        <div className="form-row">
          <label>{t('globalDutyInterface.dutyType')}:</label>
          <select
            value={dutyType}
            onChange={(e) => setDutyType(e.target.value as 'general_cleaning' | 'community_work')}
            aria-label={t('globalDutyInterface.dutyType')}
          >
            <option value="general_cleaning">{getDutyTypeLabel('general_cleaning')}</option>
            <option value="community_work">{getDutyTypeLabel('community_work')}</option>
          </select>
        </div>
        <div className="form-row">
          <label>{t('globalDutyInterface.date')}:</label>
          <input
            type="date"
            value={dateAssigned}
            onChange={(e) => setDateAssigned(e.target.value)}
            aria-label={t('globalDutyInterface.date')}
          />
        </div>
        <div className="form-row">
          <label>{t('globalDutyInterface.notes')}:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label={t('globalDutyInterface.notes')}
            rows={3}
            placeholder={t('globalDutyInterface.notes')}
          />
        </div>
        <button
          className="btn primary-btn"
          onClick={createDuty}
          aria-label={t('globalDutyInterface.createButton')}
        >
          {t('globalDutyInterface.createButton')}
        </button>
      </section>

      {/* Форма редактирования */}
      {editingDuty && (
        <section className="edit-duty">
          <h2>{t('globalDutyInterface.editDuty')}</h2>
          <div className="form-row">
            <label>{t('globalDutyInterface.dutyType')}:</label>
            <select
              value={editDutyType}
              onChange={(e) => setEditDutyType(e.target.value as 'general_cleaning' | 'community_work')}
              aria-label={t('globalDutyInterface.dutyType')}
            >
              <option value="general_cleaning">{getDutyTypeLabel('general_cleaning')}</option>
              <option value="community_work">{getDutyTypeLabel('community_work')}</option>
            </select>
          </div>
          <div className="form-row">
            <label>{t('globalDutyInterface.date')}:</label>
            <input
              type="date"
              value={editDateAssigned}
              onChange={(e) => setEditDateAssigned(e.target.value)}
              aria-label={t('globalDutyInterface.date')}
            />
          </div>
          <div className="form-row">
            <label>{t('globalDutyInterface.notes')}:</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              aria-label={t('globalDutyInterface.notes')}
              rows={3}
              placeholder={t('globalDutyInterface.notes')}
            />
          </div>
          <div className="button-group">
            <button
              className="btn success-btn"
              onClick={updateDuty}
              aria-label={t('globalDutyInterface.saveChanges')}
            >
              {t('globalDutyInterface.saveChanges')}
            </button>
            <button
              className="btn secondary-btn"
              onClick={cancelEdit}
              aria-label={t('globalDutyInterface.cancel')}
            >
              {t('globalDutyInterface.cancel')}
            </button>
          </div>
        </section>
      )}

      {/* Список дежурств */}
      <section className="duties-list">
        <h2>{t('globalDutyInterface.dutiesList')}</h2>
        {duties.length > 0 ? (
          <ul className="duties-ul" role="list">
            {duties.map((duty) => (
              <li key={duty.id} className="duty-item">
                <span className="duty-info">
                  {getDutyTypeLabel(duty.duty_type)} — {formatDate(duty.date_assigned)}
                  {duty.notes && <span className="duty-notes"> ({duty.notes})</span>}
                </span>
                <div className="duty-actions">
                  <button
                    className="btn edit-btn"
                    onClick={() => startEditDuty(duty)}
                    title={t('globalDutyInterface.edit')}
                    aria-label={`${t('globalDutyInterface.edit')} ${getDutyTypeLabel(duty.duty_type)}`}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn delete-btn"
                    onClick={() => confirmDeleteDuty(duty)}
                    title={t('globalDutyInterface.delete')}
                    aria-label={`${t('globalDutyInterface.delete')} ${getDutyTypeLabel(duty.duty_type)}`}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-duties-message">{t('globalDutyInterface.noDuties')}</p>
        )}
      </section>

      {/* Модалка для уведомлений */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        type={modalType}
      >
        {modalContent}
      </Modal>

      {/* Модалка подтверждения удаления */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDutyToDelete(null);
        }}
        title={t('globalDutyInterface.deleteConfirmation')}
        type="error"
      >
        <p className="delete-confirmation-message">{t('globalDutyInterface.deleteMessage')}</p>
        <div className="button-group">
          <button
            className="btn error-btn"
            onClick={deleteDuty}
            aria-label={t('globalDutyInterface.deleteButton')}
          >
            {t('globalDutyInterface.deleteButton')}
          </button>
          <button
            className="btn secondary-btn"
            onClick={() => setDeleteModalOpen(false)}
            aria-label={t('globalDutyInterface.cancelButton')}
          >
            {t('globalDutyInterface.cancelButton')}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GlobalDutyInterface;