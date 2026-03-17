export const newsCategories = {
  ru: {
    dormitory: "Общежитие",
    study: "Учеба",
    sport: "Спорт",
    events: "Мероприятия",
    important: "Важное",
    kitchen: "Кухня",
    shower: "Душевая",
    cleaning: "Уборка",
    repair: "Ремонт",
    other: "Другое"
  },
  en: {
    dormitory: "Dormitory",
    study: "Study",
    sport: "Sports",
    events: "Events",
    important: "Important",
    kitchen: "Kitchen",
    shower: "Shower",
    cleaning: "Cleaning",
    repair: "Repair",
    other: "Other"
  },
  uz: {
    dormitory: "Turar joy",
    study: "Ta'lim",
    sport: "Sport",
    events: "Tadbirlar",
    important: "Muhim",
    kitchen: "Oshxona",
    shower: "Dush",
    cleaning: "Tozalash",
    repair: "Ta'mirlash",
    other: "Boshqa"
  }
};

// Интерфейс для категорий
export interface NewsCategory {
  key: string;
  ru: string;
  uz: string;
  en: string;
  icon: string;
}

// Список всех категорий с их переводами и иконками
export const ALL_CATEGORIES: NewsCategory[] = [
  {
    key: 'dormitory',
    ru: 'Общежитие',
    uz: 'Turar joy',
    en: 'Dormitory',
    icon: 'fas fa-home'
  },
  {
    key: 'study',
    ru: 'Учеба',
    uz: 'Ta\'lim',
    en: 'Study',
    icon: 'fas fa-graduation-cap'
  },
  {
    key: 'sport',
    ru: 'Спорт',
    uz: 'Sport',
    en: 'Sports',
    icon: 'fas fa-running'
  },
  {
    key: 'events',
    ru: 'Мероприятия',
    uz: 'Tadbirlar',
    en: 'Events',
    icon: 'fas fa-calendar-alt'
  },
  {
    key: 'important',
    ru: 'Важное',
    uz: 'Muhim',
    en: 'Important',
    icon: 'fas fa-exclamation-circle'
  },
  {
    key: 'kitchen',
    ru: 'Кухня',
    uz: 'Oshxona',
    en: 'Kitchen',
    icon: 'fas fa-utensils'
  },
  {
    key: 'shower',
    ru: 'Душевая',
    uz: 'Dush',
    en: 'Shower',
    icon: 'fas fa-shower'
  },
  {
    key: 'cleaning',
    ru: 'Уборка',
    uz: 'Tozalash',
    en: 'Cleaning',
    icon: 'fas fa-broom'
  },
  {
    key: 'repair',
    ru: 'Ремонт',
    uz: 'Ta\'mirlash',
    en: 'Repair',
    icon: 'fas fa-tools'
  },
  {
    key: 'other',
    ru: 'Другое',
    uz: 'Boshqa',
    en: 'Other',
    icon: 'fas fa-lightbulb'
  }
];

// Функция для получения категории по ключу
export const getCategoryByKey = (key: string, language: string = 'ru'): string => {
  const category = ALL_CATEGORIES.find(cat => cat.key === key);
  if (!category) return 'Другое';
  
  switch (language) {
    case 'ru': return category.ru;
    case 'uz': return category.uz;
    case 'en': return category.en;
    default: return category.ru;
  }
};

// Функция для получения иконки по ключу категории
export const getCategoryIcon = (key: string): string => {
  const category = ALL_CATEGORIES.find(cat => cat.key === key);
  return category ? category.icon : 'fas fa-lightbulb';
};