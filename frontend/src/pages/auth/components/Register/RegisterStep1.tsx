// frontend/src/pages/auth/components/RegisterStep1.tsx
import React from 'react';
import { User, Phone, Mail } from 'lucide-react';

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
  const formatPhone = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (!digits.startsWith('998')) digits = '998' + digits.slice(3);
    digits = digits.slice(0, 12);

    const part1 = digits.slice(3, 5);
    const part2 = digits.slice(5, 8);
    const part3 = digits.slice(8, 10);
    const part4 = digits.slice(10, 12);

    let formatted = '+998';
    if (part1) formatted += ` ${part1}`;
    if (part2) formatted += ` ${part2}`;
    if (part3) formatted += `-${part3}`;
    if (part4) formatted += `-${part4}`;

    return formatted;
  };

  const handlePhoneChange = (value: string) => {
    onChange('phone', formatPhone(value));
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
              <Phone className="w-4 h-4" />
              Номер телефона
            </div>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={17}
            className="form-input"
            placeholder="+998 90 123-45-67"
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