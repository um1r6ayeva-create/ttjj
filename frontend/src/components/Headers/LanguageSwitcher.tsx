import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current =
    i18n.language === 'ru' ? 'Русский'
    : i18n.language === 'en' ? 'English'
    : "O'zbekcha";

  return (
    <div className="language-switcher" ref={ref}>
      <button className="language-btn" onClick={() => setOpen(!open)}>
        {current}
        <i className={`fas fa-chevron-${open ? 'up' : 'down'}`}></i>
      </button>

      {open && (
        <div className={`language-options ${open ? 'show' : ''}`}>
  <div
    className="language-option"
    onClick={() => { i18n.changeLanguage('ru'); setOpen(false); }}
  >
    Русский
  </div>
  <div
    className="language-option"
    onClick={() => { i18n.changeLanguage('uz'); setOpen(false); }}
  >
    
    O'zbekcha
  </div>
  <div
    className="language-option"
    onClick={() => { i18n.changeLanguage('en'); setOpen(false); }}
  >
   English
  </div>
</div>

      )}
    </div>
  );
};

export default LanguageSwitcher;
