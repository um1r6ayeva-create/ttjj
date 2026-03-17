import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  onHomeClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onHomeClick }) => {
  const { t } = useTranslation();

  return (
    <div className="profile-header">
      <div>
        <h1>{t('profileHeader.title')}</h1>
        <p className="profile-header-subtitle">{t('profileHeader.subtitle')}</p>
      </div>
      <button onClick={onHomeClick} className="home-button">
        {t('profileHeader.homeButton')}
      </button>
    </div>
  );
};

export default ProfileHeader;