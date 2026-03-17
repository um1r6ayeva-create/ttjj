// frontend/src/pages/auth/ProfilePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import ProfileHeader from './ProfileHeader';
import ProfileSidebar from './ProfileSidebar';
import EditProfileForm from './EditProfileForm';
import ChangePasswordForm from './ChangePasswordForm';
import SystemInfo from './SystemInfo';
import { useTranslation } from 'react-i18next';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-container11">
      <ProfileHeader onHomeClick={() => navigate('/')} />
      
      {/* Основной контент */}
      <div className="profile-content22">
        {/* Левая колонка - Карточка профиля */}
        <ProfileSidebar
          user={user}
          onEditClick={() => setIsEditing(!isEditing)}
          onChangePasswordClick={() => setIsChangingPassword(!isChangingPassword)}
          onLogoutClick={handleLogout}
        />

        {/* Правая колонка - Формы и информация */}
        <div className="profile-right-column">
          {message && (
            <div className={`message-alert ${message.type}`}>
              <div className="message-content">
                <span className={`message-icon ${message.type}`}>
                  {message.type === 'success' ? '✓' : '!'}
                </span>
                <p className="message-text">{message.text}</p>
              </div>
            </div>
          )}

          {/* Форма редактирования профиля */}
          {isEditing && (
            <EditProfileForm
              user={user}
              onClose={() => setIsEditing(false)}
              onSuccess={() => {
                setMessage({ type: 'success', text: t('profilePage.profileUpdated') });
                setIsEditing(false);
                window.location.reload();
              }}
              onError={(error) => setMessage({ type: 'error', text: error })}
              setLoading={setLoading}
              loading={loading}
            />
          )}

          {/* Форма смены пароля */}
          {isChangingPassword && (
            <ChangePasswordForm
              onClose={() => setIsChangingPassword(false)}
              onSuccess={() => {
                setMessage({ type: 'success', text: t('profilePage.passwordChanged') });
                setIsChangingPassword(false);
              }}
              onError={(error) => setMessage({ type: 'error', text: error })}
              setLoading={setLoading}
              loading={loading}
            />
          )}

          {/* Информация о системе */}
          <SystemInfo user={user} />
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;