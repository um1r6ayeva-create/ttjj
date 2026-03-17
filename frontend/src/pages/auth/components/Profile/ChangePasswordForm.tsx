import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../contexts/AuthContext';
import { X } from 'lucide-react';

interface ChangePasswordFormProps {
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onClose,
  onSuccess,
  onError,
  setLoading,
  loading
}) => {
  const { t } = useTranslation();
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (passwordData.new_password !== passwordData.confirm_password) {
      onError(t('changePassword.passwordsMismatch'));
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      onError(t('changePassword.passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      await api.put('/users/change-password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      
      onSuccess();
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      onError(error.response?.data?.detail || t('changePassword.changeError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <h3>{t('changePassword.title')}</h3>
        <button onClick={onClose} className="close-button">
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group md:col-span-2">
            <label className="form-label">{t('changePassword.oldPassword')}</label>
            <input
              type="password"
              value={passwordData.old_password}
              onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('changePassword.newPassword')}</label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
              className="form-input"
              required
            />
            <p className="hint-text">{t('changePassword.passwordHint')}</p>
          </div>

          <div className="form-group">
            <label className="form-label">{t('changePassword.confirmPassword')}</label>
            <input
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="form-button cancel">
            {t('changePassword.cancel')}
          </button>
          <button type="submit" disabled={loading} className="form-button change">
            {loading ? (
              <div className="spinner">
                <div className="spinner-circle" />
                {t('changePassword.changing')}
              </div>
            ) : (
              t('changePassword.changePassword')
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;