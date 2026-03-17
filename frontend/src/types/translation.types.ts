export interface Translation {
  // Основные
  mainPage: string;
  rectorate: string;
  deansOffice: string;
  staff: string;
  duty: string;
  applications: string;
  content: string;
  
  // Профиль
  profile: string;
  changePassword: string;
  logout: string;
  
  // Уведомления
  notificationsTitle: string;
  clearNotifications: string;
  viewAllNotifications: string;
  
  // Дежурство
  dutyNotifications: Array<{
    time: string;
    title: string;
    message: string;
  }>;
  
  // Герой-секция
  heroTitle: string;
  heroSubtitle: string;
  newsBtn: string;
  officialSiteBtn: string;
  newsSectionTitle: string;
  
  // Новости
  newsTitle1: string;
  newsDate1: string;
  newsCategory1: string;
  newsText1: string;
  authorName1: string;
  authorPosition1: string;
  
  newsTitle2: string;
  newsDate2: string;
  newsCategory2: string;
  newsText2: string;
  authorName2: string;
  authorPosition2: string;
  
  newsTitle3: string;
  newsDate3: string;
  newsCategory3: string;
  newsText3: string;
  authorName3: string;
  authorPosition3: string;
  
  readMoreBtn1: string;
  readMoreBtn2: string;
  readMoreBtn3: string;
  moreNewsBtn: string;
  
  // Уведомления тоста
  toastTitle: string;
  toastMessage: string;
  dutyDorm: string;
  dutyFloor: string;
  dutyRoom: string;
  dutyPlace: string;
  dutyTime: string;
  
  // Футер
  universityName: string;
  universitySubtitle: string;
  socialTitle: string;
  copyrightText: string;
  
  // Для дежурства
  addReportTitle: string;
  reportsHistoryTitle: string;
  dutyTitles: {
    kitchen: string;
    shower: string;
    cleaning: string;
    saturday: string;
  };
  
  // Для статей новостей
  newsText?: string;
  newsDate?: string;
  newsCategory?: string;
  authorName?: string;
  authorPosition?: string;
}

export interface Translations {
  ru: Translation;
  en: Translation;
  uz: Translation;
}