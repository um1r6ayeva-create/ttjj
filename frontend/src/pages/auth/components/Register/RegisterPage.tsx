// frontend/src/pages/auth/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { Link} from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import RegisterStep1 from '../Register/RegisterStep1';
import RegisterStep2 from '../Register/RegisterStep2';
import RegisterStep3 from '../Register/RegisterStep3';
import RegisterHeader from '../Register/RegisterHeader';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const { register, isLoading: authLoading } = useAuth();

  // Обновите тип n_room на number
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '+998',
    email: '',
    password: '',
    confirmPassword: '',
    user_group: '',
    n_room: 0, // Измените на number
    role_id: 3
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Скрываем Header и Footer при монтировании
  useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  // Валидация шагов
  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.surname.trim()) {
      setError('Введите имя и фамилию');
      return false;
    }
    
    // Проверяем формат телефона +998 XX XXX-XX-XX
    const phoneRegex = /^\+998 \d{2} \d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Введите корректный номер телефона в формате +998 XX XXX-XX-XX');
      return false;
    }
    
    // Проверяем email если он заполнен
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Введите корректный email адрес');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    // Проверяем формат группы 222-22
    const groupRegex = /^\d{3}-\d{2}$/;
    if (!groupRegex.test(formData.user_group)) {
      setError('Группа должна быть в формате 222-22');
      return false;
    }
    
    // Проверяем номер комнаты (201-912)
    if (!formData.n_room || formData.n_room < 201 || formData.n_room > 912) {
      setError('Введите корректный номер комнаты (201-912)');
      return false;
    }
    
    // Проверяем, что комната существует на выбранном этаже
    const floor = Math.floor(formData.n_room / 100);
    const roomOnFloor = formData.n_room % 100;
    
    if (floor < 2 || floor > 9) {
      setError('Номер комнаты должен начинаться с цифры 2-9');
      return false;
    }
    
    if (roomOnFloor < 1 || roomOnFloor > 12) {
      setError(`На ${floor} этаже номера комнат должны быть от ${floor}01 до ${floor}12`);
      return false;
    }
    
    return true;
  };

  const validateStep3 = () => {
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    
    return true;
  };

  const nextStep = () => {
    setError('');
    
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateStep3()) return;

    setLoading(true);
    try {
      // Подготовка данных для отправки
      const registerData = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        // Убираем все нецифровые символы кроме + и оставляем только 12 цифр после +998
        phone: `+998${formData.phone.replace(/\D/g, '').slice(-9)}`,
        email: formData.email.trim() || undefined,
        password: formData.password,
        user_group: formData.user_group || undefined,
        n_room: formData.n_room > 0 ? formData.n_room : undefined,
        role_id: formData.role_id
      };

      console.log('Отправка данных на регистрацию:', registerData);
      
      await register(registerData);
      // Редирект происходит внутри AuthContext после успешной регистрации
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);
      
      // Пытаемся получить более детальное сообщение об ошибке
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.message || 
                          'Ошибка регистрации. Проверьте введенные данные.';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string | number) => {
    // Конвертируем role_id и n_room в числа
    if (name === 'role_id' || name === 'n_room') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: Number(value) 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <RegisterStep1 formData={formData} onChange={handleChange} />;
      case 2:
        return <RegisterStep2 formData={formData} onChange={handleChange} />;
      case 3:
        return (
          <RegisterStep3 
            formData={formData} 
            onChange={handleChange}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <RegisterHeader step={step} />

        {error && (
          <div className="error-message">
            <div className="error-icon"></div>
            <div className="error-text">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {renderStep()}

          <div className="form-actions">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="form-button secondary"
                disabled={loading || authLoading}
              >
                <span className="button-icon">←</span>
                Назад
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="form-button primary"
                disabled={loading || authLoading}
              >
                Далее
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || authLoading}
                className="form-button submit"
              >
                {loading || authLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner-circle"></div>
                    Регистрация...
                  </div>
                ) : (
                  'Зарегистрироваться'
                )}
              </button>
            )}
          </div>
        </form>

        <div className="register-footer">
          <p className="footer-text">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="footer-link">
              Войти
            </Link>
          </p>
          <Link to="/" className="back-link">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;