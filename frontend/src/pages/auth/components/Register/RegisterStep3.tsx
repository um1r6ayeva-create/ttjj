// frontend/src/pages/auth/components/RegisterStep3.tsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface RegisterStep3Props {
  formData: {
    password: string;
    confirmPassword: string;
  };
  onChange: (name: string, value: string) => void;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

const RegisterStep3: React.FC<RegisterStep3Props> = ({
  formData,
  onChange,
  showPassword,
  showConfirmPassword,
  onTogglePassword,
  onToggleConfirmPassword
}) => {
  return (
    <div className="form-section">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Пароль</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => onChange('password', e.target.value)}
              className="form-input"
              placeholder="Введите пароль"
              required
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="toggle-password"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="input-hint">Минимум 6 символов</p>
        </div>

        <div className="form-group">
          <label className="form-label">Подтверждение пароля</label>
          <div className="password-input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              className="form-input"
              placeholder="Повторите пароль"
              required
            />
            <button
              type="button"
              onClick={onToggleConfirmPassword}
              className="toggle-password"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep3;