import { useState, useEffect } from 'react';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<'ru' | 'en' | 'uz'>(() => {
    const savedLang = localStorage.getItem('preferredLanguage') as 'ru' | 'en' | 'uz';
    return savedLang || 'ru';
  });

  const changeLanguage = (lang: 'ru' | 'en' | 'uz') => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    
    // Показываем уведомление
    showLanguageNotification(lang);
  };

  const showLanguageNotification = (lang: 'ru' | 'en' | 'uz') => {
    const messages = {
      ru: 'Язык изменен на Русский',
      en: 'Language changed to English',
      uz: "Til O'zbekchaga o'zgartirildi"
    };
    
    // Создаем временное уведомление (можно заменить на toast)
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #4fc3f7, #002147);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = messages[lang];
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  useEffect(() => {
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return { currentLanguage, changeLanguage };
};