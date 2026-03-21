import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, authApi } from '../../contexts/AuthContext';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import './Notifications.css';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  linkTab: 'my_duties' | 'all_duties';
  dutyId?: number;
  date_due?: string;
  date_assigned?: string;
}

interface NotificationsProps {
  onOpenTab: (tab: 'my_duties' | 'all_duties', dutyId?: number) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onOpenTab }) => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    const fetchNotifications = async () => {
      try {
        const today = new Date();
        const inFourDays = new Date();
        inFourDays.setDate(today.getDate() + 4);

        let allNotifications: NotificationItem[] = [];

        if (user.role === 'commandant') {
          // Только уведомления о проверке
          const { data } = await authApi.get('/duty-reports/pending', {
            headers: { Authorization: `Bearer ${token}` },
          });

          allNotifications = data.map((r: any) => ({
            id: r.id,
            title: t('notifications.reportCheck'),
            message: `${t('notifications.room')}: ${r.room_number}`,
            linkTab: 'all_duties',
            dutyId: r.duty_id,
            date_assigned: r.submitted_at,
          }));
        } else if (user.role === 'student' || user.role === 'admin'){
          // Личные дежурства
          const { data: studentDuties } = await authApi.get(
  `/duties/room/${user.n_room}`, 
  { headers: { Authorization: `Bearer ${token}` } }
);

          const getDutyTypeLabel = (type: string) => {
            if (type === 'cleaning') return t('notifications.dutyType.cleaning');
            return t('notifications.dutyType.default');
          };

          const upcomingStudent = studentDuties
            .filter((d: any) => d.status === 'pending' && new Date(d.date_due) <= inFourDays)
            .map((d: any) => ({
              id: d.id,
              title: t('notifications.roomDuty'),
              message: `${t('dutyPage.title')}: ${getDutyTypeLabel(d.duty_type)}`,
              linkTab: 'my_duties' as const,
              dutyId: d.id,
              date_due: d.date_due,
            }));

          // Глобальные дежурства
          const { data: globalDuties } = await authApi.get(`/global-duties/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const getGlobalDutyTypeLabel = (type: string) => {
            if (type === 'general_cleaning') return t('notifications.dutyType.general_cleaning');
            return t('notifications.dutyType.community_work');
          };

          const upcomingGlobal = globalDuties
            .filter((d: any) => new Date(d.date_assigned) >= today)
            .map((d: any) => ({
              id: 10000 + d.id,
              title: t('notifications.allRoomsDuty'),
              message: `${t('dutyPage.title')}: ${getGlobalDutyTypeLabel(d.duty_type)}`,
              linkTab: 'all_duties' as const,
              dutyId: d.id,
              date_assigned: d.date_assigned,
            }));

          allNotifications = [...upcomingStudent, ...upcomingGlobal].sort((a, b) => {
            const dateA = a.date_due ? new Date(a.date_due) : new Date(a.date_assigned || '');
            const dateB = b.date_due ? new Date(b.date_due) : new Date(b.date_assigned || '');
            return dateA.getTime() - dateB.getTime();
          });
        }

        setNotifications(allNotifications);
      } catch (err) {
        console.error(t('notifications.error'), err);
      }
    };

    fetchNotifications();
  }, [token, user, t]);

  const unreadCount = notifications.length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getNotificationTypeLabel = (linkTab: 'my_duties' | 'all_duties') => {
    return linkTab === 'my_duties' ? t('notifications.personal') : t('notifications.global');
  };

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button
        className="notification-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('notifications.ariaLabel')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <NotificationsIcon fontSize="large" />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} ${t('notifications.title')}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="notification-dropdown"
          role="menu"
          aria-label={t('notifications.title')}
        >
          <h3 className="notification-dropdown-title">{t('notifications.title')}</h3>
          {notifications.length === 0 ? (
            <p className="no-notifications-text">{t('notifications.noNotifications')}</p>
          ) : (
            <div className="notification-list" role="list">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className="notification-item"
                  onClick={() => {
                    onOpenTab(notification.linkTab, notification.dutyId);
                    setIsOpen(false);
                  }}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onOpenTab(notification.linkTab, notification.dutyId);
                      setIsOpen(false);
                    }
                  }}
                  aria-label={`${notification.title}, ${notification.message}`}
                  data-index={index}
                >
                  <div className="notification-header">
                    <strong className="notification-title">{notification.title}</strong>
                    <span className={`notification-type ${notification.linkTab}`}>
                      {getNotificationTypeLabel(notification.linkTab)}
                    </span>
                  </div>
                  <p className="notification-message2">{notification.message}</p>
                  {(notification.date_due || notification.date_assigned) && (
                    <p className="notification-date">
                      <span className="date-label">{t('notifications.date')}:</span>
                      <span className="date-value2">
                        {formatDate(notification.date_due || notification.date_assigned)}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
