import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { Eye, EyeOff, Phone, Lock, LogIn, AlertCircle } from 'lucide-react';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();

  useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
    window.history.pushState({}, '', '/login');
    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  const formatPhone = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (!digits.startsWith('998')) digits = '998' + digits;
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

  useEffect(() => {
    if (user && user.id) navigate('/profile');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || phone.replace(/\D/g, '').length < 12) {
      setError('Введите корректный номер телефона');
      return;
    }
    if (!password || password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    setIsSubmitting(true);
    try {
      const payloadPhone = phone.replace(/\D/g, '');
      await login(payloadPhone, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе в систему');
      if (err.message.includes('Неверный номер телефона или пароль')) setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-icon"><LogIn /></div>
        <h1>Вход в систему</h1>
        <p>ТУИТ - Система управления общежитием</p>

        {error && (
          <div className="error-msg">
            <AlertCircle />
            <div>
              <p>Неверный номер или пароль </p>
              
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="login-label"><Phone /> Номер телефона</label>
            <input
              type="tel"
              value={phone}
              maxLength={17}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="input-field"
              placeholder="+998 XX XXX-XX-XX"
              required
            />
          </div>

          <div>
            <label className="login-label"><Lock /> Пароль</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Введите пароль"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? <span className="spinner"></span> : 'Войти в систему'}
          </button>
        </form>

        <div className="login-footer">
          <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
          <p><Link to="/">← Вернуться на главную</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
