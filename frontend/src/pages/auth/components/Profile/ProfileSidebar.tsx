import React from 'react';
import { User, Phone, Mail, Hash, Home, Calendar, Shield, Edit, Key, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserType {
  name: string;
  surname: string;
  role: string;
  phone: string;
  email?: string;
  user_group?: string;
  n_room?: number;
  is_active: boolean;
}

interface ProfileSidebarProps {
  user: UserType;
  onEditClick: () => void;
  onChangePasswordClick: () => void;
  onLogoutClick: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user,
  onEditClick,
  onChangePasswordClick,
  onLogoutClick
}) => {
  const { t } = useTranslation();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'admin';
      case 'commandant': return 'commandant';
      case 'student': return 'student';
      default: return 'student';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return t('profileSidebar.admin');
      case 'commandant': return t('profileSidebar.commandant');
      case 'student': return t('profileSidebar.student');
      default: return role;
    }
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? t('profileSidebar.active') : t('profileSidebar.inactive');
  };

  return (
    <div className="profile-card23">
      <div className="text-center">
        <div className="profile-avatar">
          <User className="w-16 h-16 text-white" />
        </div>
        <h2 className="profile-name">
          {user.name} {user.surname}
        </h2>
        <div className={`role-badge ${getRoleBadgeColor(user.role)}`}>
          <Shield className="w-4 h-4" />
          <span>{getRoleName(user.role)}</span>
        </div>
      </div>

      <div className="profile-info">
        <div className="info-item">
          <Phone className="w-5 h-5" />
          <span className="font-medium">{user.phone}</span>
          <span className="info-label">({t('profileSidebar.phone')})</span>
        </div>
        
        {user.email && (
          <div className="info-item">
            <Mail className="w-5 h-5" />
            <span>{user.email}</span>
            <span className="info-label">({t('profileSidebar.email')})</span>
          </div>
        )}
      
        {user.role !== 'commandant' && user.user_group && (
          <div className="info-item">
            <Hash className="w-5 h-5" />
            <span>{t('profileSidebar.group')}: {user.user_group}</span>
          </div>
        )}
        
        {user.role !== 'commandant' && user.n_room && (
          <div className="info-item">
            <Home className="w-5 h-5" />
            <span>{t('profileSidebar.room')}: {user.n_room}</span>
          </div>
        )}
       
        <div className="info-item">
          <Calendar className="w-5 h-5" />
          <span>{t('profileSidebar.status')}: {getStatusText(user.is_active)}</span>
        </div>
      </div>

      <div className="profile-actions">
        <button onClick={onEditClick} className="action-button edit">
          <Edit className="w-5 h-5" />
          {t('profileSidebar.editProfile')}
        </button>
        <button onClick={onChangePasswordClick} className="action-button password">
          <Key className="w-5 h-5" />
          {t('profileSidebar.changePassword')}
        </button>
        <button onClick={onLogoutClick} className="action-button logout">
          <LogOut className="w-5 h-5" />
          {t('profileSidebar.logout')}
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;