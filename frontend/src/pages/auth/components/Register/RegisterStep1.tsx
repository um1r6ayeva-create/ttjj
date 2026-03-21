// frontend/src/pages/auth/components/RegisterStep1.tsx
import React from 'react';
import { User, Mail } from 'lucide-react';

interface RegisterStep1Props {
  formData: {
    name: string;
    surname: string;
    phone: string;
    email: string;
  };
  onChange: (name: string, value: string) => void;
}

const RegisterStep1: React.FC<RegisterStep1Props> = ({ formData, onChange }) => {
  const handlePhoneChange = (value: string) => {
    onChange('phone', value.trim());
  };

  return (
    <div className="form-section">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            <div className="form-label-content">
              <User className="w-4 h-4" />
              Имя
            </div>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="form-input"
            placeholder="Иван"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Фамилия</label>
          <input
            type="text"
            value={formData.surname}
            onChange={(e) => onChange('surname', e.target.value)}
            className="form-input"
            placeholder="Иванов"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <div className="form-label-content">
              <User className="w-4 h-4" />
              Логин
            </div>
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={30}
            className="form-input"
            placeholder="Ваш логин (напр. ivanov123)"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <div className="form-label-content">
              <Mail className="w-4 h-4" />
              Email (необязательно)
            </div>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="form-input"
            placeholder="ivan@example.com"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterStep1;