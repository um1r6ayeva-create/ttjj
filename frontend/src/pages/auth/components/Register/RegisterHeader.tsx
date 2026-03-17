// frontend/src/pages/auth/components/RegisterHeader.tsx
import React from 'react';
import { UserPlus } from 'lucide-react';

interface RegisterHeaderProps {
  step: number;
}

const RegisterHeader: React.FC<RegisterHeaderProps> = ({ step }) => {
  const steps = [
    { number: 1, label: 'Личные данные' },
    { number: 2, label: 'Информация' },
    { number: 3, label: 'Пароль' }
  ];

  return (
    <div className="register-header">
      <div className="header-icon">
        <UserPlus className="w-8 h-8 text-white" />
      </div>
      <h1 className="header-title">Регистрация</h1>
      <p className="header-subtitle">ТУИТ - Система управления общежитием</p>

      <div className="steps-container">
        {steps.map(({ number, label }) => (
          <div key={number} className="step-item">
            <div className={`step-circle ${
              step === number ? 'active' : step > number ? 'completed' : 'inactive'
            }`}>
              {number}
            </div>
            <span className="step-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegisterHeader;