import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save } from 'lucide-react';
import { api } from '../../../../contexts/AuthContext';

interface UserType {
  name: string;
  surname: string;
  email?: string;
  phone: string;
  user_group?: string;
  n_room?: number;
  role: string;
}

interface EditProfileFormProps {
  user: UserType;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  user,
  onClose,
  onSuccess,
  onError,
  setLoading,
  loading
}) => {
  const { t } = useTranslation();
  const [editData, setEditData] = useState({
    name: user.name || '',
    surname: user.surname || '',
    email: user.email || '',
    phone: user.phone || '',
    user_group: user.user_group || '',
    n_room: user.n_room?.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData: any = {};
      if (editData.email !== user.email) updateData.email = editData.email || null;
      if (editData.phone !== user.phone) updateData.phone = editData.phone || null;

      if (user.role !== 'commandant') {
        if (editData.user_group !== user.user_group) updateData.user_group = editData.user_group || null;
        if (parseInt(editData.n_room) !== user.n_room) updateData.n_room = parseInt(editData.n_room) || null;
      }
      
      await api.put('/users/me', updateData);
      onSuccess();
    } catch (error: any) {
      onError(error.response?.data?.detail || t('editProfile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <h3>{t('editProfile.title')}</h3>
        <button onClick={onClose} className="close-button">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Имя и Фамилия только для чтения */}
          <div className="form-group">
            <label className="form-label">{t('editProfile.firstName')}</label>
            <input
              type="text"
              value={editData.name}
              readOnly
              className="form-input bg-gray-200 cursor-not-allowed"
              title={t('editProfile.readOnly')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('editProfile.lastName')}</label>
            <input
              type="text"
              value={editData.surname}
              readOnly
              className="form-input bg-gray-200 cursor-not-allowed"
              title={t('editProfile.readOnly')}
            />
          </div>

          <div className="form-group md:col-span-2">
            <label className="form-label">{t('editProfile.email')}</label>
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({...editData, email: e.target.value})}
              className="form-input"
              placeholder={t('editProfile.emailPlaceholder')}
            />
          </div>

          <div className="form-group md:col-span-2">
            <label className="form-label">{t('editProfile.phone')}</label>
            <input
              type="text"
              value={editData.phone}
              onChange={(e) => setEditData({...editData, phone: e.target.value})}
              className="form-input"
              placeholder={t('editProfile.phonePlaceholder')}
            />
          </div>

          {/* Группа и комната только если не commandant */}
          {user.role !== 'commandant' && (
            <>
              <div className="form-group">
                <label className="form-label">{t('editProfile.group')}</label>
                <input
                  type="text"
                  value={editData.user_group}
                  onChange={(e) => setEditData({...editData, user_group: e.target.value})}
                  className="form-input"
                  placeholder={t('editProfile.groupPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('editProfile.room')}</label>
                <input
                  type="number"
                  value={editData.n_room}
                  onChange={(e) => setEditData({...editData, n_room: e.target.value})}
                  className="form-input"
                  placeholder={t('editProfile.roomPlaceholder')}
                />
              </div>
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="form-button cancel">
            {t('editProfile.cancel')}
          </button>
          <button type="submit" disabled={loading} className="form-button save">
            {loading ? (
              <div className="spinner">
                <div className="spinner-circle" />
                {t('editProfile.saving')}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                {t('editProfile.save')}
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;