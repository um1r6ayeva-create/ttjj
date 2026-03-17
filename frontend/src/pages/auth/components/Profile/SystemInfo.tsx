import React from 'react';
import { useTranslation } from 'react-i18next';

interface UserType {
  role: string;
  is_active: boolean;
}

interface SystemInfoProps {
  user: UserType;
}

const SystemInfo: React.FC<SystemInfoProps> = ({ user }) => {
  const { t } = useTranslation();

  return (
    <div className="system-card23">
      <h3>{t('systemInfo.title')}</h3>
      <div className="system-grid">
        <div className="system-section">
          <h4>{t('systemInfo.privileges')}</h4>
          <ul className="privilege-list">
            <li className="privilege-item">
              <div className="status-dot active"></div>
              {t('systemInfo.scheduleView')}
            </li>
            <li className="privilege-item">
              <div className="status-dot active"></div>
              {t('systemInfo.repairRequest')}
            </li>
            {user.role === 'admin' && (
              <li className="privilege-item">
                <div className="status-dot active"></div>
                {t('systemInfo.userManagement')}
              </li>
            )}
            {user.role === 'commandant' && (
              <li className="privilege-item">
                <div className="status-dot active"></div>
                {t('systemInfo.roomManagement')}
              </li>
            )}
          </ul>
        </div>

        <div className="system-section">
          <h4>{t('systemInfo.statistics')}</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm">{t('systemInfo.accountStatus')}:</p>
              <div className="flex items-center gap-2">
                <div className={`status-dot ${user.is_active ? 'active' : 'inactive'}`}></div>
                <span className="text-white">
                  {user.is_active ? t('systemInfo.active') : t('systemInfo.inactive')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;