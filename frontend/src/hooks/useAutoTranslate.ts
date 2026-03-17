import { authApi } from '../contexts/AuthContext';

// Кэш для предотвращения повторных запросов
const translationCache = new Map<string, string>();

export const useAutoTranslate = () => {
  const translate = async (text: string, targetLang: string): Promise<string> => {
    if (!text.trim() || targetLang === 'ru' || targetLang.startsWith('ru-')) {
      return text;
    }

    const mainLang = targetLang.split('-')[0].toLowerCase();
    const cacheKey = `${text}_${mainLang}`;

    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    const supportedLangs = ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'ru', 'ja', 'zh'];
    if (!supportedLangs.includes(mainLang)) {
      return text;
    }

    try {
      // Отправка запроса на наш FastAPI, который использует DeepSeek
      const { data } = await authApi.post('/translate', {
        text,
        target: mainLang,
      });
if (data.error) {
  console.error('Translation error:', data.message);
  return text; // возвращаем оригинал
}
      translationCache.set(cacheKey, data.translated);
      return data.translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const translateBatch = async (texts: string[], targetLang: string): Promise<string[]> => {
    if (targetLang === 'ru' || targetLang.startsWith('ru-')) {
      return texts;
    }
    return Promise.all(texts.map(text => translate(text, targetLang)));
  };

  const clearCache = () => {
    translationCache.clear();
  };

  return { translate, translateBatch, clearCache };
};
