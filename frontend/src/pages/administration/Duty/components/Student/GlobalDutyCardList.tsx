import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../../contexts/AuthContext';
import Modal from '../../../../../components/comon/Modal';
import { CalendarMonth } from '@mui/icons-material';
import './GlobalDutyCardList.css';

interface GlobalDuty {
  id: number;
  duty_type: 'general_cleaning' | 'community_work';
  date_assigned: string;
  notes?: string;
}

interface Props {
  token: string | null;
}


const GlobalDutyCardList: React.FC<Props> = ({ token }) => {
  const { t } = useTranslation();
  const [duties, setDuties] = useState<GlobalDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDuty, setSelectedDuty] = useState<GlobalDuty | null>(null);
  const [modalOpen, setModalOpen] = useState(false);


  const fetchDuties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/global-duties/');
      setDuties(res.data);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка загрузки глобальных дежурств:', err);
      setError(t('globalDuty.error'));
      setDuties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuties();
  }, [token]);

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
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedDuty(duty);
                  setModalOpen(true);
                }
              }}
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

      {selectedDuty && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={t('globalDuty.modalTitle')}
          type="info"
        >
          <div className="duty-details">
            <p>
              <strong>{t('globalDuty.dutyType')}:</strong> {getDutyLabel(selectedDuty.duty_type)}
            </p>
            <p>
              <strong>{t('globalDuty.date')}:</strong> {formatDate(selectedDuty.date_assigned)}
            </p>
            {selectedDuty.notes && (
              <p>
                <strong>{t('globalDuty.notes')}:</strong> {selectedDuty.notes}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GlobalDutyCardList;