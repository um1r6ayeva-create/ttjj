import React, { useEffect, useState } from 'react';
import { authApi } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/comon/Modal';
import ConfirmModal from '../../components/comon/ConfirmModal';
import './News.css';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  icon: string;
  created_at: string;
  author_name?: string;
  author_position?: string;
}

// Интерфейс для формы создания/редактирования (все языки)
interface NewsFormData {
  title_ru: string;
  title_uz: string;
  title_en: string;
  content_ru: string;
  content_uz: string;
  content_en: string;
  category: string;
  icon: string;
}

const News: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullContent, setShowFullContent] = useState<number | null>(null);
  
  // Состояния для создания новости
  const [newsForm, setNewsForm] = useState<NewsFormData>({
    title_ru: '',
    title_uz: '',
    title_en: '',
    content_ru: '',
    content_uz: '',
    content_en: '',
    category: 'Общежитие',
    icon: 'fas fa-lightbulb'
  });
  
  // Состояния для редактирования
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [editForm, setEditForm] = useState<NewsFormData>({
    title_ru: '',
    title_uz: '',
    title_en: '',
    content_ru: '',
    content_uz: '',
    content_en: '',
    category: 'Общежитие',
    icon: 'fas fa-lightbulb'
  });

  // Состояния для модальных окон
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null);

  const isAdmin = user?.role === 'commandant';

  const categoryIcons: Record<string, string> = {
    'Общежитие': 'fas fa-home',
    'Учеба': 'fas fa-graduation-cap',
    'Спорт': 'fas fa-running',
    'Мероприятия': 'fas fa-calendar-alt',
    'Важное': 'fas fa-exclamation-circle'
  };

  const loadNews = async () => {
    try {
      setIsLoading(true);
      const res = await authApi.get('/news/', {
        params: { lang: i18n.language }
      });
      const sortedNews = res.data.sort((a: NewsItem, b: NewsItem) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNews(sortedNews);
    } catch (error) {
      console.error('Ошибка при загрузке новостей:', error);
      showModal(t('news.errors.load'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFullNewsForEdit = async (id: number) => {
    try {
      const res = await authApi.get(`/news/${id}/full`);
      const newsData = res.data;
      
      setEditForm({
        title_ru: newsData.title_ru,
        title_uz: newsData.title_uz,
        title_en: newsData.title_en,
        content_ru: newsData.content_ru,
        content_uz: newsData.content_uz,
        content_en: newsData.content_en,
        category: newsData.category,
        icon: newsData.icon
      });
    } catch (error) {
      console.error('Ошибка при загрузке полной новости:', error);
    }
  };

  useEffect(() => {
    loadNews();
  }, [i18n.language]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return t('news.date.today', { hours, minutes });
    } else if (diffDays === 1) {
      return t('news.date.yesterday');
    } else if (diffDays === 2) {
      return t('news.date.dayBeforeYesterday');
    } else {
      return date.toLocaleDateString(i18n.language, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const showModal = (message: string, type: 'success' | 'error' = 'success') => {
    setModalMessage(message);
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
  };

  const openDeleteConfirm = (newsItem: NewsItem) => {
    setNewsToDelete(newsItem);
    setIsConfirmModalOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsConfirmModalOpen(false);
    setNewsToDelete(null);
  };

  const addNews = async () => {
    // Проверяем заполнение всех языковых полей
    const requiredFields = [
      'title_ru', 'title_uz', 'title_en',
      'content_ru', 'content_uz', 'content_en'
    ];
    
    const emptyFields = requiredFields.filter(field => !newsForm[field as keyof NewsFormData]?.trim());
    
    if (emptyFields.length > 0) {
      showModal(t('news.errors.fillAllLanguages'), 'error');
      return;
    }

    try {
      await authApi.post('/news/', {
        ...newsForm,
        icon: categoryIcons[newsForm.category] || 'fas fa-info-circle'
      });
      
      // Сбрасываем форму
      setNewsForm({
        title_ru: '',
        title_uz: '',
        title_en: '',
        content_ru: '',
        content_uz: '',
        content_en: '',
        category: 'Общежитие',
        icon: 'fas fa-lightbulb'
      });
      
      loadNews();
      showModal(t('news.success.added'));
    } catch (error) {
      console.error('Ошибка при добавлении новости:', error);
      showModal(t('news.errors.add'), 'error');
    }
  };

  const deleteNews = async () => {
    if (!newsToDelete) return;

    try {
      await authApi.delete(`/news/${newsToDelete.id}`);
      loadNews();
      closeDeleteConfirm();
      showModal(t('news.success.deleted'));
    } catch (error) {
      console.error('Ошибка при удалении новости:', error);
      closeDeleteConfirm();
      showModal(t('news.errors.delete'), 'error');
    }
  };

  const startEditing = async (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    await loadFullNewsForEdit(newsItem.id);
  };

  const cancelEditing = () => {
    setEditingNews(null);
    setEditForm({
      title_ru: '',
      title_uz: '',
      title_en: '',
      content_ru: '',
      content_uz: '',
      content_en: '',
      category: 'Общежитие',
      icon: 'fas fa-lightbulb'
    });
  };

  const updateNews = async () => {
    if (!editingNews) return;

    // Проверяем заполнение всех языковых полей
    const requiredFields = [
      'title_ru', 'title_uz', 'title_en',
      'content_ru', 'content_uz', 'content_en'
    ];
    
    const emptyFields = requiredFields.filter(field => !editForm[field as keyof NewsFormData]?.trim());
    
    if (emptyFields.length > 0) {
      showModal(t('news.errors.fillAllLanguages'), 'error');
      return;
    }

    try {
      await authApi.put(`/news/${editingNews.id}`, {
        ...editForm,
        icon: categoryIcons[editForm.category] || 'fas fa-info-circle'
      });
      
      cancelEditing();
      loadNews();
      showModal(t('news.success.updated'));
    } catch (error) {
      console.error('Ошибка при обновлении новости:', error);
      showModal(t('news.errors.update'), 'error');
    }
  };

  const toggleFullContent = (id: number) => {
    setShowFullContent(prev => prev === id ? null : id);
  };

  const getInitials = (name: string) => {
    if (!name) return 'АО';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleFormChange = (field: keyof NewsFormData, value: string) => {
    if (editingNews) {
      setEditForm(prev => ({ ...prev, [field]: value }));
    } else {
      setNewsForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const getCurrentForm = () => editingNews ? editForm : newsForm;

  // Функция для отображения трех колонок
  const renderLanguageColumns = () => {
    const currentForm = getCurrentForm();

    return (
      <div className="language-columns">
        {/* Русская колонка */}
        <div className="language-column">
          <div className="language-header">
            <span className="flag">🇷🇺</span>
            <h4>Русский</h4>
          </div>
          
          <div className="form-group">
            <label>Заголовок (RU)</label>
            <input
              type="text"
              placeholder="Заголовок на русском"
              value={currentForm.title_ru}
              onChange={e => handleFormChange('title_ru', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Текст новости (RU)</label>
            <textarea
              placeholder="Текст новости на русском"
              value={currentForm.content_ru}
              onChange={e => handleFormChange('content_ru', e.target.value)}
              className="form-textarea"
              rows={4}
            />
          </div>
        </div>

        {/* Узбекская колонка */}
        <div className="language-column">
          <div className="language-header">
            <span className="flag">🇺🇿</span>
            <h4>O'zbekcha</h4>
          </div>
          
          <div className="form-group">
            <label>Sarlavha (UZ)</label>
            <input
              type="text"
              placeholder="Sarlavha o'zbekcha"
              value={currentForm.title_uz}
              onChange={e => handleFormChange('title_uz', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Yangilik matni (UZ)</label>
            <textarea
              placeholder="Yangilik matni o'zbekcha"
              value={currentForm.content_uz}
              onChange={e => handleFormChange('content_uz', e.target.value)}
              className="form-textarea"
              rows={4}
            />
          </div>
        </div>

        {/* Английская колонка */}
        <div className="language-column">
          <div className="language-header">
            <span className="flag">🇺🇸</span>
            <h4>English</h4>
          </div>
          
          <div className="form-group">
            <label>Title (EN)</label>
            <input
              type="text"
              placeholder="Title in English"
              value={currentForm.title_en}
              onChange={e => handleFormChange('title_en', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>News content (EN)</label>
            <textarea
              placeholder="News content in English"
              value={currentForm.content_en}
              onChange={e => handleFormChange('content_en', e.target.value)}
              className="form-textarea"
              rows={4}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="news-section fade-in" id="news">
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalType === 'success' ? t('modal.success') : t('modal.warning')}
        type={modalType}
      >
        <div className="modal-message">
          <i className={`fas fa-${modalType === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          <p>{modalMessage}</p>
        </div>
        <div className="modal-actions">
          <button 
            className={`btn ${modalType === 'success' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={closeModal}
          >
            {t('modal.understand')}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeDeleteConfirm}
        onConfirm={deleteNews}
        title={t('news.confirm.deleteTitle')}
        message={newsToDelete ? (
          <>
            {t('news.confirm.deleteMessage')}
            <br /><br />
            <strong>{t('news.form.title')}:</strong> {newsToDelete.title}
            <br />
            <strong>{t('news.form.category')}:</strong> {newsToDelete.category}
            <br />
            <strong>{t('news.form.date')}:</strong> {formatDate(newsToDelete.created_at)}
          </>
        ) : null}
        confirmText={t('news.form.delete')}
        cancelText={t('modal.cancel')}
        type="error" 
        children={undefined}
      />

      <h2 className="section-title">{t('news.title')}</h2>

      {isAdmin && (
        <div className="news-add-form">
          <h3>{editingNews ? t('news.form.edit') : t('news.form.add')}</h3>
          
          {/* Три колонки вместо табов */}
          {renderLanguageColumns()}
          
          <div className="common-fields">
            <div className="form-group">
              <label>{t('news.form.category')}</label>
              <select
                value={getCurrentForm().category}
                onChange={e => handleFormChange('category', e.target.value)}
                className="form-select"
              >
                <option value="Общежитие">{t('news.categories.dormitory')}</option>
                <option value="Учеба">{t('news.categories.study')}</option>
                <option value="Спорт">{t('news.categories.sport')}</option>
                <option value="Мероприятия">{t('news.categories.events')}</option>
                <option value="Важное">{t('news.categories.important')}</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            {editingNews ? (
              <>
                <button 
                  onClick={updateNews} 
                  className="save-news-btn"
                  disabled={
                    !editForm.title_ru.trim() || !editForm.title_uz.trim() || !editForm.title_en.trim() ||
                    !editForm.content_ru.trim() || !editForm.content_uz.trim() || !editForm.content_en.trim()
                  }
                >
                  <i className="fas fa-save"></i> {t('news.form.save')}
                </button>
                <button 
                  onClick={cancelEditing} 
                  className="cancel-edit-btn"
                >
                  <i className="fas fa-times"></i> {t('modal.cancel')}
                </button>
              </>
            ) : (
              <button 
                onClick={addNews} 
                className="add-news-btn"
                disabled={
                  !newsForm.title_ru.trim() || !newsForm.title_uz.trim() || !newsForm.title_en.trim() ||
                  !newsForm.content_ru.trim() || !newsForm.content_uz.trim() || !newsForm.content_en.trim()
                }
              >
                <i className="fas fa-plus"></i> {t('news.form.add')}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="news-container">
        {isLoading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
            <p>{t('news.loading')}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="no-news">
            <i className="fas fa-newspaper fa-3x"></i>
            <h3>{t('news.noNews')}</h3>
            <p>{t('news.noNewsDescription')}</p>
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="news-card">
              <div className="news-header">
                <div className="news-icon">
                  <i className={item.icon || 'fas fa-info-circle'}></i>
                </div>
                <div className="news-card-title">{item.title}</div>
              </div>
              
              <div className="news-date">
                <i className="far fa-calendar-alt"></i>
                <span>{formatDate(item.created_at)}</span>
              </div>
              
              <div className="news-category">{item.category}</div>
              
              <div className="news-content">
                <p className="news-text">
                  {showFullContent === item.id || item.content.length <= 150
                    ? item.content
                    : `${item.content.substring(0, 150)}...`
                  }
                </p>
                {item.content.length > 150 && (
                  <button 
                    className="read-more-btn"
                    onClick={() => toggleFullContent(item.id)}
                  >
                    {showFullContent === item.id ? t('news.readLess') : t('news.readMore')}
                  </button>
                )}
              </div>
              
              <div className="news-footer">
                <div className="news-author">
                  <div className="author-avatar">
                    {getInitials(t('news.admin'))}
                  </div>
                  <div className="author-info">
                    <div className="author-name">
                      {t('news.admin')}
                    </div>
                    <div className="author-position">
                      {t('news.adminPosition')}
                    </div>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="news-actions">
                    <button 
                      className="edit-news-btn"
                      onClick={() => startEditing(item)}
                      title={t('news.form.edit')}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="delete-news-btn"
                      onClick={() => openDeleteConfirm(item)}
                      title={t('news.form.delete')}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {news.length > 3 && (
        <button className="more-news-btn">
          <i className="fas fa-list-alt"></i> {t('news.allNews')}
        </button>
      )}
    </section>
  );
};

export default News;