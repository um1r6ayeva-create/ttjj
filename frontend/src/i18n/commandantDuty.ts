// i18n/commandantDuty.ts
export const commandantDuty = {
  ru: {
    // Заголовки
    title: 'Панель команданта',
    waitingReports: 'Отчеты на проверку',
    history: 'История проверок',
    refresh: 'Обновить',
    
    // Статистика
    stats: {
      waitingReports: 'Отчеты на проверку:',
      checkHistory: 'История проверок:'
    },
    
    // Типы дежурств
    dutyTypes: {
      kitchen: 'Дежурство на кухне',
      shower: 'Дежурство в душевой',
      default: 'Дежурство'
    },
    
    // Статусы
    dutyStatuses: {
      pending: 'Ожидает выполнения',
      submitted: 'Отчет отправлен',
      confirmed: 'Подтверждено',
      rejected: 'Отклонено',
      expired: 'Просрочено'
    },
    
    reportStatuses: {
      waiting: 'Ожидает проверки',
      confirmed: 'Подтвержден',
      rejected: 'Отклонен'
    },
    
    // Карточка дежурства
    dutyCard: {
      room: 'Комната',
      floor: 'этаж',
      dueDate: 'Срок выполнения',
      notes: 'Заметки',
      studentReport: 'Отчет от студента',
      student: 'Студент',
      submitted: 'Отправлен',
      description: 'Описание',
      photos: 'Фотографии',
      photosCount: 'шт.',
      awaitingReport: 'Ожидается отчет от студентов комнаты'
    },
    
    // Кнопки действий
    actions: {
      viewReport: 'Просмотр отчета',
      confirmReport: 'Подтвердить отчет',
      rejectReport: 'Отклонить отчет',
      confirmDuty: 'Подтвердить дежурство',
      close: 'Закрыть'
    },
    
    // Диалоги
    dialogs: {
      confirmTitle: 'Подтверждение отчета',
      confirmMessage: 'Вы уверены, что хотите подтвердить этот отчет?',
      rejectTitle: 'Отклонение отчета',
      rejectMessage: 'Укажите причину отклонения (необязательно):',
      rejectPlaceholder: 'Введите причину отклонения...',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      reject: 'Отклонить'
    },
    
    // Завершенные отчеты
    completedReports: {
      checkedBy: 'Проверил',
      room: 'Комната',
      submittedAt: 'Отправлен',
      checkedAt: 'Проверен'
    },
    
    // Уведомления
    notifications: {
      reportConfirmed: 'Отчет подтвержден',
      reportRejected: 'Отчет отклонен',
      dutyConfirmed: 'Дежурство подтверждено',
      errorConfirming: 'Ошибка при подтверждении отчета',
      errorRejecting: 'Ошибка при отклонении отчета',
      errorConfirmingDuty: 'Ошибка при подтверждении дежурства',
      errorLoadingReport: 'Не удалось загрузить отчет'
    },
    
    // Состояния
    states: {
      loading: 'Загрузка данных...',
      noWaitingReports: 'Нет отчетов на проверку',
      noHistory: 'Нет истории проверок',
      errorLoading: 'Ошибка загрузки',
      retry: 'Повторить попытку'
    },
    
    // Форматирование
    dateTime: {
      dateFormat: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      },
      dateTimeFormat: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    }
  },
  en: {
    // Titles
    title: 'Commandant Panel',
    waitingReports: 'Reports for Review',
    history: 'Review History',
    refresh: 'Refresh',
    
    // Statistics
    stats: {
      waitingReports: 'Reports for review:',
      checkHistory: 'Review history:'
    },
    
    // Duty types
    dutyTypes: {
      kitchen: 'Kitchen Duty',
      shower: 'Shower Duty',
      default: 'Duty'
    },
    
    // Statuses
    dutyStatuses: {
      pending: 'Pending',
      submitted: 'Report Submitted',
      confirmed: 'Confirmed',
      rejected: 'Rejected',
      expired: 'Expired'
    },
    
    reportStatuses: {
      waiting: 'Awaiting Review',
      confirmed: 'Confirmed',
      rejected: 'Rejected'
    },
    
    // Duty card
    dutyCard: {
      room: 'Room',
      floor: 'floor',
      dueDate: 'Due Date',
      notes: 'Notes',
      studentReport: 'Student Report',
      student: 'Student',
      submitted: 'Submitted',
      description: 'Description',
      photos: 'Photos',
      photosCount: 'pcs.',
      awaitingReport: 'Awaiting report from room students'
    },
    
    // Action buttons
    actions: {
      viewReport: 'View Report',
      confirmReport: 'Confirm Report',
      rejectReport: 'Reject Report',
      confirmDuty: 'Confirm Duty',
      close: 'Close'
    },
    
    // Dialogs
    dialogs: {
      confirmTitle: 'Report Confirmation',
      confirmMessage: 'Are you sure you want to confirm this report?',
      rejectTitle: 'Report Rejection',
      rejectMessage: 'Specify reason for rejection (optional):',
      rejectPlaceholder: 'Enter rejection reason...',
      cancel: 'Cancel',
      confirm: 'Confirm',
      reject: 'Reject'
    },
    
    // Completed reports
    completedReports: {
      checkedBy: 'Checked by',
      room: 'Room',
      submittedAt: 'Submitted',
      checkedAt: 'Checked'
    },
    
    // Notifications
    notifications: {
      reportConfirmed: 'Report confirmed',
      reportRejected: 'Report rejected',
      dutyConfirmed: 'Duty confirmed',
      errorConfirming: 'Error confirming report',
      errorRejecting: 'Error rejecting report',
      errorConfirmingDuty: 'Error confirming duty',
      errorLoadingReport: 'Failed to load report'
    },
    
    // States
    states: {
      loading: 'Loading data...',
      noWaitingReports: 'No reports for review',
      noHistory: 'No review history',
      errorLoading: 'Loading error',
      retry: 'Retry'
    },
    
    // Formatting
    dateTime: {
      dateFormat: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      },
      dateTimeFormat: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    }
  },
  uz: {
    // Sarlavhalar
    title: 'Komendant paneli',
    waitingReports: 'Tekshirish uchun hisobotlar',
    history: 'Tekshirish tarixi',
    refresh: 'Yangilash',
    
    // Statistika
    stats: {
      waitingReports: 'Tekshirish uchun hisobotlar:',
      checkHistory: 'Tekshirish tarixi:'
    },
    
    // Navbatchilik turlari
    dutyTypes: {
      kitchen: 'Oshxonada navbatchilik',
      shower: 'Dushxonada navbatchilik',
      default: 'Navbatchilik'
    },
    
    // Holatlar
    dutyStatuses: {
      pending: 'Bajarilish kutilmoqda',
      submitted: 'Hisobot yuborildi',
      confirmed: 'Tasdiqlandi',
      rejected: 'Rad etildi',
      expired: 'Muddati o\'tgan'
    },
    
    reportStatuses: {
      waiting: 'Tekshirish kutilmoqda',
      confirmed: 'Tasdiqlandi',
      rejected: 'Rad etildi'
    },
    
    // Navbatchilik kartasi
    dutyCard: {
      room: 'Xona',
      floor: 'qavat',
      dueDate: 'Muddati',
      notes: 'Eslatmalar',
      studentReport: 'Talabaning hisoboti',
      student: 'Talaba',
      submitted: 'Yuborilgan',
      description: 'Tavsif',
      photos: 'Fotosuratlar',
      photosCount: 'ta',
      awaitingReport: 'Xona talabalaridan hisobot kutilmoqda'
    },
    
    // Harakat tugmalari
    actions: {
      viewReport: 'Hisobotni ko\'rish',
      confirmReport: 'Hisobotni tasdiqlash',
      rejectReport: 'Hisobotni rad etish',
      confirmDuty: 'Navbatchilikni tasdiqlash',
      close: 'Yopish'
    },
    
    // Dialoglar
    dialogs: {
      confirmTitle: 'Hisobotni tasdiqlash',
      confirmMessage: 'Ushbu hisobotni tasdiqlashni istaysizmi?',
      rejectTitle: 'Hisobotni rad etish',
      rejectMessage: 'Rad etish sababini ko\'rsating (ixtiyoriy):',
      rejectPlaceholder: 'Rad etish sababini kiriting...',
      cancel: 'Bekor qilish',
      confirm: 'Tasdiqlash',
      reject: 'Rad etish'
    },
    
    // Yakunlangan hisobotlar
    completedReports: {
      checkedBy: 'Tekshirgan',
      room: 'Xona',
      submittedAt: 'Yuborilgan',
      checkedAt: 'Tekshirilgan'
    },
    
    // Bildirishnomalar
    notifications: {
      reportConfirmed: 'Hisobot tasdiqlandi',
      reportRejected: 'Hisobot rad etildi',
      dutyConfirmed: 'Navbatchilik tasdiqlandi',
      errorConfirming: 'Hisobotni tasdiqlashda xatolik',
      errorRejecting: 'Hisobotni rad etishda xatolik',
      errorConfirmingDuty: 'Navbatchilikni tasdiqlashda xatolik',
      errorLoadingReport: 'Hisobotni yuklab bo\'lmadi'
    },
    
    // Holatlar
    states: {
      loading: 'Ma\'lumotlar yuklanmoqda...',
      noWaitingReports: 'Tekshirish uchun hisobotlar yo\'q',
      noHistory: 'Tekshirish tarixi yo\'q',
      errorLoading: 'Yuklash xatosi',
      retry: 'Qayta urinish'
    },
    
    // Formatlash
    dateTime: {
      dateFormat: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      },
      dateTimeFormat: {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    }
  }
};