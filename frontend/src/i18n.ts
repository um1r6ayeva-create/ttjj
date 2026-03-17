import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { header } from './i18n/header'
import { footer } from './i18n/footer'
import { hero } from './i18n/hero'
import { profile } from './i18n/profile'
import { content } from './i18n/content'
import { days } from './i18n/days'
import { photos } from './i18n/photos'
import { application } from './i18n/application'
import { applications } from './i18n/applications'
import { rectorate } from './i18n/rectorate'
import { dekanat } from './i18n/dekanat'
import { staff } from './i18n/staff';
import { changePassword } from './i18n/changePassword';
import { profilePage } from './i18n/profilePage';
import { profileSidebar } from './i18n/ProfileSidebar';
import { systemInfo } from './i18n/systemInfo'; // Добавьте этот импорт
import { profileHeader } from './i18n/profileHeader'; // Добавьте этот импорт 
import { editProfile } from './i18n/editProfile'; // Добавьте этот импорт
import { dutyPage } from './i18n/dutyPage'; 
import { studentDuty } from './i18n/studentDuty'; 
import { globalDuty } from './i18n/globalDuty'; 
import { notifications } from './i18n/notifications';
import { globalDutyInterface } from './i18n/globalDutyInterface';
import {commandantDuty} from './i18n/commandantDuty';
import { reportViewModal } from './i18n/reportViewModal';
import { assignDutyForm } from './i18n/assignDutyForm';
import { assignedDutiesList } from './i18n/assignedDutiesList';
import {news} from './i18n/news';
import { modal } from './i18n/modal';
import { applicationsCheckPage } from './i18n/applicationsCheckPage';
import notFoundTranslations from './i18n/404';
i18n.use(initReactI18next).init({
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
  resources: {
    ru: {
      translation: {
        header: header.ru,
        footer: footer.ru,
        hero: hero.ru,
        profile: profile.ru,
        content: content.ru,
        days: days.ru,
        photos: photos.ru,
        application: application.ru,
        applications: applications.ru,
        rectorate:rectorate.ru,
        dekanat:dekanat.ru,
        staff: staff.ru,
        changePassword: changePassword.ru,
        profilePage: profilePage.ru,
        profileSidebar: profileSidebar.ru,
        systemInfo: systemInfo.ru, // Добавьте эту строку
        profileHeader: profileHeader.ru, // Добавьте эту строку
        editProfile: editProfile.ru, // Добавьте эту строку
        dutyPage: dutyPage.ru, // Добавьте эту строку
        studentDuty: studentDuty.ru,
        globalDuty:globalDuty.ru,
        notifications: notifications.ru,
        globalDutyInterface: globalDutyInterface.ru,
        commandantDuty:commandantDuty.ru,
        reportViewModal: reportViewModal.ru,
        assignDutyForm: assignDutyForm.ru, 
         assignedDutiesList: assignedDutiesList.ru,
         news:news.ru,
         modal: modal.ru,
         applicationsCheckPage: applicationsCheckPage.ru,
         notFound: notFoundTranslations.ru,
      },
    },
    en: {
      translation: {
        header: header.en,
        footer: footer.en,
        hero: hero.en,
        profile: profile.en,
        content: content.en,
        days: days.en,
        photos: photos.en,
        application: application.en,
        applications: applications.en,
        rectorate:rectorate.en,
        dekanat:dekanat.en,
        staff: staff.en,
        changePassword: changePassword.en,
        profilePage: profilePage.en,
        profileSidebar: profileSidebar.en,
        systemInfo: systemInfo.en, 
        profileHeader: profileHeader.en,  
         editProfile: editProfile.en, 
         dutyPage: dutyPage.en, 
         studentDuty: studentDuty.en,
         globalDuty:globalDuty.en, 
         notifications: notifications.en,
          globalDutyInterface: globalDutyInterface.en, 
          commandantDuty:commandantDuty.en,
          reportViewModal: reportViewModal.en,
          assignDutyForm: assignDutyForm.en,
           assignedDutiesList: assignedDutiesList.en,
           news:news.en,
           modal: modal.en,
           applicationsCheckPage: applicationsCheckPage.en,
           notFound: notFoundTranslations.en,
      },
    },
    uz: {
      translation: {
        header: header.uz,
        footer: footer.uz,
        hero: hero.uz,
        profile: profile.uz,
        content: content.uz,
        days: days.uz,
        photos: photos.uz,
        application: application.uz,
        applications: applications.uz,
        rectorate:rectorate.uz,
        dekanat:dekanat.uz,
        staff: staff.uz,
        changePassword: changePassword.uz,
        profilePage: profilePage.uz,
        profileSidebar: profileSidebar.uz,
        systemInfo: systemInfo.uz, 
        profileHeader: profileHeader.uz, 
        editProfile: editProfile.uz, 
        dutyPage: dutyPage.uz,
        studentDuty: studentDuty.uz, 
        globalDuty:globalDuty.uz,
        notifications: notifications.uz,
         globalDutyInterface: globalDutyInterface.uz,
         commandantDuty:commandantDuty.uz,
         reportViewModal: reportViewModal.uz,
         assignDutyForm: assignDutyForm.uz,
          assignedDutiesList: assignedDutiesList.uz, 
          news:news.uz,
          modal: modal.uz,
          applicationsCheckPage: applicationsCheckPage.uz, 
          notFound: notFoundTranslations.uz,
      },
    },
  },
})

export default i18n