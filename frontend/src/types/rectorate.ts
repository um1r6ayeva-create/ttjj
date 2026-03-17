export interface RectoratePerson {
  id: number;
  position: string;
  name: string;
  degree: string;
  receptionTime: string;
  phone: string;
  email: string;
  responsibilities: string;
  imageUrl?: string;
}

export interface Translation {
  title: string;
  pageTitle: string;
  pageSubtitle: string;
  backBtn: string;
  expandText: string;
  hideText: string;
  timeLabel: string;
  phoneLabel: string;
  emailLabel: string;
  dutiesLabel: string;
  profileBtn: string;
  mainPage: string;
  rectorate: string;
  deansOffice: string;
  staff: string;
  duty: string;
  applications: string;
  content: string;
  universityName: string;
  universitySubtitle: string;
  socialTitle: string;
  copyrightText: string;
}

export interface Translations {
  ru: Translation;
  en: Translation;
  uz: Translation;
}

// Добавим интерфейс для данных персонала
export interface PersonData {
  position: string;
  name: string;
  degree: string;
  receptionTime: string;
  phone: string;
  email: string;
  responsibilities: string;
  imageUrl?: string;
}