import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { Eye, EyeOff, Lock, LogIn, AlertCircle, User as UserIcon } from 'lucide-react';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
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



  useEffect(() => {
    if (user && user.id) navigate('/profile');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (phone.length < 3) {
      setError('Логин должен содержать минимум 3 символа');
      return;
    }
    if (!password || password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(phone, password);
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
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="login-label"><UserIcon className="w-4 h-4" /> Логин</label>
            <input
              type="text"
              value={phone}
              maxLength={17}
              onChange={(e) => setPhone(e.target.value.trim())}
              className="input-field"
              placeholder="Введите логин"
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
