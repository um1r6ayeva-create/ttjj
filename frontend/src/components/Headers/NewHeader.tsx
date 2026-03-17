// frontend/src/components/Headers/NewHeader.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './NewHeader.css';
import logo from "./logo.png";
import Notifications from './Notifications';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const NewHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [, setIsLanguageOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const mainNavItems = [
  { path: '/', label: t('header.home') },
];

const adminNavItems = [
  { path: '/rectorate', label: t('header.rectorate') },
  { path: '/dekanat', label: t('header.dekanat') },
  { path: '/staff', label: t('header.staff') },
  { path: '/duty', label: t('header.duty') },
  { path: '/applications', label: t('header.applications') },
  { path: '/content', label: t('header.content') },
];

  // Инициализация после монтирования
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Закрытие выпадающих меню при клике снаружи
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  // Показываем скелетон во время инициализации
  if (!isInitialized) {
    return (
      <header className="main-header animate-pulse">
        <div className="logo-section">
          <div className="logo bg-gray-300"></div>
          <div className="site-name bg-gray-300 h-8 w-32 rounded"></div>
        </div>
        <div className="nav-section">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="nav-btn bg-gray-300 opacity-50"></div>
          ))}
        </div>
       
      </header>
    );
  }

  return (
    <header className="main-header">
      <div className="logo-section">
        <Link to="/" className="flex items-center space-x-3">
          <div className="logo">
            <img src={logo} alt="Логотип" className="w-12 h-12 rounded-xl shadow-lg" />
          </div>
          <div className="site-name">TTJ</div>
        </Link>
      </div>
      
      <div className="nav-section">
        {mainNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
        
        {adminNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      
      <div className="header-right-section">
    <LanguageSwitcher />

<Notifications onOpenTab={(tab, dutyId) => {
  // Здесь логика перехода на нужную вкладку
  if (tab === 'my_duties') {
    navigate('/duty', { state: { activeTab: 'my_duties', dutyId } });
  } else if (tab === 'all_duties') {
    navigate('/duty', { state: { activeTab: 'all_duties' } });
  }
}} />
       
<div className="relative" ref={profileRef}>
  <button
    onClick={() => setIsProfileOpen(!isProfileOpen)}
    className="profile-btn"
  >
    <i className="fas fa-user-circle"></i>
   <span>{t('profile.my_profile')}</span>
  </button>

 {isProfileOpen && (
  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl py-2 z-50 border border-gray-100">
    {user ? (
      <>
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="font-medium text-gray-900">{user.name} {user.surname}</div>
          <div className="text-sm text-gray-500 truncate">{user.email || user.phone}</div>
        </div>
        <button
          onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
          className="dropdown-btn"
        >
          <i className="fas fa-user"></i>
          <span>Мой профиль</span>
        </button>
        <button
          onClick={handleLogout}
          className="dropdown-btn logout"
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Выйти</span>
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => { navigate('/login'); setIsProfileOpen(false); }}
          className="dropdown-btn login"
        >
          <i className="fas fa-sign-in-alt"></i>
          <span>Войти</span>
        </button>
        <button
          onClick={() => { navigate('/register'); setIsProfileOpen(false); }}
          className="dropdown-btn register"
        >
          <i className="fas fa-user-plus"></i>
          <span>Регистрация</span>
        </button>
      </>
    )}
  </div>
)}

</div>

      </div>
    </header>
  );
};

export default NewHeader;