import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import AdminDutyInterface from './components/Starosta/AdminDuty/AdminDutyInterface';
import CommandantDutyInterface from './components/Commandant/CommandantDutyInterface';
import StudentDutyInterface from './components/Student/StudentDutyInterface';
import GlobalDutyInterface from './components/Commandant/GlobalDutyInterface';
import './DutyPage.css';
import { ClipboardList } from 'lucide-react';

const DutyPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const getUserRole = () => {
    if (!user) return 'student';

    const role = user.role.toLowerCase();

    const roleMap: Record<string, string> = {
      admin: 'admin',
      user: 'student',
      commandant: 'commandant',
      elder: 'elder'
    };

    return roleMap[role] || 'student';
  };

  const userRole = getUserRole();

  const subtitleMap: Record<string, string> = {
    admin: t('dutyPage.adminSubtitle'),
    commandant: t('dutyPage.commandantSubtitle'),
    student: t('dutyPage.studentSubtitle'),
    elder: t('dutyPage.studentSubtitle')
  };

  return (
    <div className="duty-page">
      <div className="duty-header">
        <h1 className="duty-title">
          <ClipboardList className="duty-icon" />
          {t('dutyPage.title')}
        </h1>
        <p className="duty-subtitle">{subtitleMap[userRole]}</p>
      </div>

      <div className="duty-content">
        {userRole === 'admin' && <AdminDutyInterface />}

        {userRole === 'commandant' && (
          <>
            {/* Глобальное дежурство */}
            <section className="global-duty-section">
              <h2 className="section-title">{t('dutyPage.globalDuty')}</h2>
              <GlobalDutyInterface />
            </section>

            {/* Обычные дежурства */}
            <section className="commandant-duty-section">
              <h2 className="section-title">{t('dutyPage.regularDuty')}</h2>
              <CommandantDutyInterface />
            </section>
          </>
        )}

        {(userRole === 'admin' || userRole === 'student') && <StudentDutyInterface />}
      </div>
    </div>
  );
};

export default DutyPage;