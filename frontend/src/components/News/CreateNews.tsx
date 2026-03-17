import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../contexts/AuthContext';

interface Props {
  token: string | null;
  onSuccess?: () => void;
}

// Только категории, которые есть на бекенде
const CATEGORIES = [
  "Общежитие",
  "Учеба",
  "Спорт",
  "Мероприятия",
  "Важное",
];

const ICONS: Record<string, string> = {
  "Общежитие": "home",
  "Учеба": "graduation-cap",
  "Спорт": "running",
  "Мероприятия": "calendar-alt",
  "Важное": "exclamation-circle",
};

const LANGS = ["ru", "uz", "en"] as const;

const CreateNews: React.FC<Props> = ({ token, onSuccess }) => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    title_ru: "",
    title_uz: "",
    title_en: "",
    content_ru: "",
    content_uz: "",
    content_en: "",
    category: CATEGORIES[0],
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isValid = LANGS.every(lang =>
    form[`title_${lang}`].trim() && form[`content_${lang}`].trim()
  );

  const submit = async () => {
    if (!token) return alert(t('news.errors.noToken'));
    if (!isValid) return alert(t('news.errors.fillAllLanguages'));

    try {
      await authApi.post(
        '/news/',
        {
          ...form,
          icon: `fas fa-${ICONS[form.category]}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForm({
        title_ru: "",
        title_uz: "",
        title_en: "",
        content_ru: "",
        content_uz: "",
        content_en: "",
        category: CATEGORIES[0],
      });

      alert(t('news.success.added'));
      onSuccess?.();
    } catch (error: any) {
      console.error(error);
      alert(t('news.errors.add'));
    }
  };

  return (
    <div className="create-news">
      <h3>{t('news.form.add')}</h3>

      <div className="language-sections">
        {LANGS.map(lang => (
          <div key={lang} className="language-section">
            <div className="language-header">
              <span className="flag">
                {lang === "ru" ? "🇷🇺" : lang === "uz" ? "🇺🇿" : "🇺🇸"}
              </span>
              <h4>{lang === "ru" ? "Русский" : lang === "uz" ? "O'zbekcha" : "English"}</h4>
            </div>

            <div className="form-group">
              <label>{t(`news.form.title_${lang}`) || "Заголовок"}</label>
              <input
                type="text"
                value={form[`title_${lang}`]}
                onChange={e => handleChange(`title_${lang}`, e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{t(`news.form.content_${lang}`) || "Текст новости"}</label>
              <textarea
                value={form[`content_${lang}`]}
                onChange={e => handleChange(`content_${lang}`, e.target.value)}
                className="form-textarea"
                rows={4}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="common-fields">
        <div className="form-group">
          <label>{t('news.form.category')}</label>
          <select
            value={form.category}
            onChange={e => handleChange('category', e.target.value)}
            className="form-select"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="submit-section">
        <button onClick={submit} className="submit-btn" disabled={!isValid}>
          {t('news.form.publish')}
        </button>
        <div className="validation-info">
          {isValid ? (
            <span className="text-success">✓ Все поля заполнены</span>
          ) : (
            <span className="text-warning">❗ Заполните все поля на всех языках</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateNews;
