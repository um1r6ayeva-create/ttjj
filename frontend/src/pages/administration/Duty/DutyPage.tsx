import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import AdminDutyInterface from './components/Starosta/AdminDuty/AdminDutyInterface';
import CommandantDutyInterface from './components/Commandant/CommandantDutyInterface';
import StudentDutyInterface from './components/Student/StudentDutyInterface';
import GlobalDutyInterface from './components/Commandant/GlobalDutyInterface';
import './DutyPage.css';
import { ClipboardList } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("DutyPage ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const DutyPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const getUserRole = () => {
    if (!user || !user.role) {
      console.warn("DutyPage: user or user.role is missing", user);
      return 'student';
    }

    const role = String(user.role).toLowerCase();

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
    elder: t('dutyPage.elderSubtitle', { defaultValue: t('dutyPage.studentSubtitle') })
  };

  return (
    <ErrorBoundary fallback={<div className="error-fallback">{t('dutyPage.renderError')}</div>}>
      <div className="duty-page">
        <div className="duty-header">
          <h1 className="duty-title">
            <ClipboardList className="duty-icon" />
            {t('dutyPage.title')}
          </h1>
          <p className="duty-subtitle">{subtitleMap[userRole] || t('dutyPage.studentSubtitle')}</p>
        </div>

        <div className="duty-content">
            {userRole === 'admin' && (
              <ErrorBoundary fallback={<div className="component-error">{t('dutyPage.componentError')}</div>}>
                <AdminDutyInterface />
              </ErrorBoundary>
            )}

            {userRole === 'commandant' && (
              <>
                {/* Глобальное дежурство */}
                <section className="global-duty-section">
                  <h2 className="section-title">{t('dutyPage.globalDuty')}</h2>
                  <ErrorBoundary fallback={<div className="component-error">{t('dutyPage.componentError')}</div>}>
                    <GlobalDutyInterface />
                  </ErrorBoundary>
                </section>

                {/* Обычные дежурства */}
                <section className="commandant-duty-section">
                  <h2 className="section-title">{t('dutyPage.regularDuty')}</h2>
                  <ErrorBoundary fallback={<div className="component-error">{t('dutyPage.componentError')}</div>}>
                    <CommandantDutyInterface />
                  </ErrorBoundary>
                </section>
              </>
            )}

            {(userRole === 'admin' || userRole === 'student' || userRole === 'elder') && (
              <ErrorBoundary fallback={<div className="component-error">{t('dutyPage.componentError')}</div>}>
                <StudentDutyInterface />
              </ErrorBoundary>
            )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DutyPage;