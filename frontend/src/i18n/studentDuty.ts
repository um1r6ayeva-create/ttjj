// i18n/studentDuty.ts
export const studentDuty = {
  ru: {
    // Заголовки
    title: 'Система дежурств',
    currentDuties: 'Текущие дежурства',
    submitReport: 'Отправить отчет',
    history: 'История',
    globalDuties: 'Общие дежурства',
    reportTitle: 'Отчет о дежурстве',
    
    // Статусы
    status: {
      pending: 'Ожидает выполнения',
      submitted: 'Отчет отправлен',
      confirmed: 'Подтверждено',
      rejected: 'Отклонено',
      waitingReview: 'Ожидает проверки'
    },
    
    // Описания дежурств
    dutyDescriptions: {
      kitchen: 'Дежурство на кухне',
      shower: 'Дежурство в душевой',
      default: 'Дежурство'
    },
    
    // Форма отчета
    roomLabel: 'Комната',
    floorLabel: 'этаж',
    dueDate: 'Срок выполнения',
    assignedDate: 'Назначено',
    
    // Описание формы
    descriptionLabel: 'Описание выполненной работы',
    descriptionPlaceholder: 'Опишите, какую работу вы выполнили, какие средства использовали и т.д.',
    charCount: '/1000 символов',
    
    // Фотографии
    photosLabel: 'Фотографии работы',
    choosePhotos: 'Выбрать фото',
    photosHint: 'минимум 3, максимум 5',
    selectedCount: 'Выбрано',
    deletePhotoConfirm: 'Удалить фотографию',
    deletePhotoMessage: 'Вы уверены, что хотите удалить эту фотографию?',
    
    // Требования к отчету
    requirements: 'Требования к отчету',
    requirementsList: [
      'Минимум 3 фотографии выполненной работы',
      'Подробное описание выполненных действий',
      'Отчет проверяется командантом в течение 1-2 дней',
      'Фотографии должны быть четкими и показывать результат работы'
    ],
    
    // Кнопки
    refresh: 'Обновить',
    submitReportButton: 'Отправить отчет',
    backToList: 'Назад к списку',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    retry: 'Попробовать снова',
    
    // Уведомления и ошибки
    loadingDuties: 'Загрузка дежурств...',
    loadingHistory: 'Загрузка истории...',
    noDuties: 'Нет назначенных дежурств для вашей комнаты',
    noHistory: 'Нет данных о дежурствах',
    noCompletedDuties: 'Нет завершенных дежурств',
    
    // Ошибки валидации
    validation: {
      noDutySelected: 'Дежурство не выбрано',
      noDescription: 'Добавьте описание выполненной работы',
      minPhotos: 'Необходимо минимум 3 фотографии',
      maxPhotos: 'Можно загрузить максимум 5 фотографий',
      fileType: 'Можно загружать только изображения',
      fileSize: 'Размер файла не должен превышать 5MB'
    },
    
    // Успешные сообщения
    success: {
      reportSubmitted: 'Отчет успешно отправлен на проверку!',
      photoDeleted: 'Фотография удалена',
      uploadProgress: 'Фотография загружено'
    },
    
    // Предупреждения
    warning: {
      unsavedChangesTitle: 'Вернуться к списку',
      unsavedChangesMessage: 'У вас есть несохраненные изменения. Вы уверены, что хотите вернуться?',
      cancelSubmitTitle: 'Отмена отправки',
      cancelSubmitMessage: 'У вас есть несохраненные изменения. Вы уверены, что хотите отменить отправку?',
      confirmSubmitTitle: 'Отправить отчет',
      confirmSubmitMessage: 'Вы уверены, что хотите отправить отчет на проверку? После отправки вы не сможете изменить данные.'
    },
    
    // Информационные сообщения
    info: {
      selectDuty: 'Выберите дежурство для отправки отчета',
      fillReportForm: 'Заполните форму отчета о выполненном дежурстве',
      reportCancelled: 'Отправка отчета отменена'
    },
    
    // Ошибки
    error: {
      loadDuties: 'Не удалось загрузить список дежурств',
      authError: 'Ошибка авторизации',
      submitReport: 'Ошибка при отправке отчета'
    }
  },
  en: {
    // Заголовки
    title: 'Duty System',
    currentDuties: 'Current Duties',
    submitReport: 'Submit Report',
    history: 'History',
    globalDuties: 'Community Duties',
    reportTitle: 'Duty Report',
    
    // Статусы
    status: {
      pending: 'Pending',
      submitted: 'Report Submitted',
      confirmed: 'Confirmed',
      rejected: 'Rejected',
      waitingReview: 'Awaiting Review'
    },
    
    // Описания дежурств
    dutyDescriptions: {
      kitchen: 'Kitchen Duty',
      shower: 'Shower Duty',
      default: 'Duty'
    },
    
    // Форма отчета
    roomLabel: 'Room',
    floorLabel: 'floor',
    dueDate: 'Due Date',
    assignedDate: 'Assigned',
    
    // Описание формы
    descriptionLabel: 'Description of work performed',
    descriptionPlaceholder: 'Describe what work you have done, what tools you used, etc.',
    charCount: '/1000 characters',
    
    // Фотографии
    photosLabel: 'Work Photos',
    choosePhotos: 'Choose Photos',
    photosHint: 'minimum 3, maximum 5',
    selectedCount: 'Selected',
    deletePhotoConfirm: 'Delete Photo',
    deletePhotoMessage: 'Are you sure you want to delete this photo?',
    
    // Требования к отчету
    requirements: 'Report Requirements',
    requirementsList: [
      'Minimum 3 photos of completed work',
      'Detailed description of actions taken',
      'Report is reviewed by commandant within 1-2 days',
      'Photos should be clear and show the result of work'
    ],
    
    // Кнопки
    refresh: 'Refresh',
    submitReportButton: 'Submit Report',
    backToList: 'Back to List',
    cancel: 'Cancel',
    confirm: 'Confirm',
    retry: 'Try Again',
    
    // Уведомления и ошибки
    loadingDuties: 'Loading duties...',
    loadingHistory: 'Loading history...',
    noDuties: 'No duties assigned for your room',
    noHistory: 'No duty data',
    noCompletedDuties: 'No completed duties',
    
    // Ошибки валидации
    validation: {
      noDutySelected: 'No duty selected',
      noDescription: 'Add description of work performed',
      minPhotos: 'Minimum 3 photos required',
      maxPhotos: 'Maximum 5 photos allowed',
      fileType: 'Only images can be uploaded',
      fileSize: 'File size should not exceed 5MB'
    },
    
    // Успешные сообщения
    success: {
      reportSubmitted: 'Report successfully submitted for review!',
      photoDeleted: 'Photo deleted',
      uploadProgress: 'photos uploaded'
    },
    
    // Предупреждения
    warning: {
      unsavedChangesTitle: 'Return to list',
      unsavedChangesMessage: 'You have unsaved changes. Are you sure you want to return?',
      cancelSubmitTitle: 'Cancel submission',
      cancelSubmitMessage: 'You have unsaved changes. Are you sure you want to cancel submission?',
      confirmSubmitTitle: 'Submit Report',
      confirmSubmitMessage: 'Are you sure you want to submit the report for review? You will not be able to change the data after submission.'
    },
    
    // Информационные сообщения
    info: {
      selectDuty: 'Select duty to submit report',
      fillReportForm: 'Fill out the duty report form',
      reportCancelled: 'Report submission cancelled'
    },
    
    // Ошибки
    error: {
      loadDuties: 'Failed to load duty list',
      authError: 'Authorization error',
      submitReport: 'Error submitting report'
    }
  },
  uz: {
    // Заголовки
    title: 'Navbatchilik tizimi',
    currentDuties: 'Joriy navbatchiliklar',
    submitReport: 'Hisobot topshirish',
    history: 'Tarix',
    globalDuties: 'Hashar navbatchiliklari',
    reportTitle: 'Navbatchilik hisoboti',
    
    // Статусы
    status: {
      pending: 'Bajarilish kutilmoqda',
      submitted: 'Hisobot yuborildi',
      confirmed: 'Tasdiqlandi',
      rejected: 'Rad etildi',
      waitingReview: 'Ko\'rib chiqish kutilmoqda'
    },
    
    // Описания дежурств
    dutyDescriptions: {
      kitchen: 'Oshxonada navbatchilik',
      shower: 'Dushxonada navbatchilik',
      default: 'Navbatchilik'
    },
    
    // Форма отчета
    roomLabel: 'Xona',
    floorLabel: 'qavat',
    dueDate: 'Muddati',
    assignedDate: 'Belgilangan',
    
    // Описание формы
    descriptionLabel: 'Bajarilgan ishlarning tavsifi',
    descriptionPlaceholder: 'Qanday ishlarni bajardingiz, qaysi vositalardan foydalandingiz va h.k.',
    charCount: '/1000 belgi',
    
    // Фотографии
    photosLabel: 'Ish fotosuratlari',
    choosePhotos: 'Foto tanlash',
    photosHint: 'kamida 3, ko\'pi bilan 5',
    selectedCount: 'Tanlangan',
    deletePhotoConfirm: 'Fotosuratni o\'chirish',
    deletePhotoMessage: 'Ushbu fotosuratni o\'chirishni istaysizmi?',
    
    // Требования к отчету
    requirements: 'Hisobot talablari',
    requirementsList: [
      'Bajarilgan ishning kamida 3 ta fotosurati',
      'Bajarilgan harakatlarning batafsil tavsifi',
      'Hisobot komendant tomonidan 1-2 kun ichida ko\'rib chiqiladi',
      'Fotosuratlar aniq bo\'lishi va ish natijasini ko\'rsatishi kerak'
    ],
    
    // Кнопки
    refresh: 'Yangilash',
    submitReportButton: 'Hisobot yuborish',
    backToList: 'Ro\'yxatga qaytish',
    cancel: 'Bekor qilish',
    confirm: 'Tasdiqlash',
    retry: 'Qayta urinish',
    
    // Уведомления и ошибки
    loadingDuties: 'Navbatchiliklar yuklanmoqda...',
    loadingHistory: 'Tarix yuklanmoqda...',
    noDuties: 'Sizning xonangiz uchun navbatchilik belgilanmagan',
    noHistory: 'Navbatchilik ma\'lumotlari yo\'q',
    noCompletedDuties: 'Yakunlangan navbatchiliklar yo\'q',
    
    // Ошибки валидации
    validation: {
      noDutySelected: 'Navbatchilik tanlanmagan',
      noDescription: 'Bajarilgan ishlarni tavsiflang',
      minPhotos: 'Kamida 3 ta fotosurat talab qilinadi',
      maxPhotos: 'Maksimum 5 ta fotosurat yuklash mumkin',
      fileType: 'Faqat rasmlar yuklanishi mumkin',
      fileSize: 'Fayl hajmi 5MB dan oshmasligi kerak'
    },
    
    // Успешные сообщения
    success: {
      reportSubmitted: 'Hisobot ko\'rib chiqish uchun muvaffaqiyatli yuborildi!',
      photoDeleted: 'Fotosurat o\'chirildi',
      uploadProgress: ' fotosurat yuklandi'
    },
    
    // Предупреждения
    warning: {
      unsavedChangesTitle: 'Ro\'yxatga qaytish',
      unsavedChangesMessage: 'Saqlanmagan o\'zgarishlar bor. Qaytishni istaysizmi?',
      cancelSubmitTitle: 'Yuborishni bekor qilish',
      cancelSubmitMessage: 'Saqlanmagan o\'zgarishlar bor. Yuborishni bekor qilishni istaysizmi?',
      confirmSubmitTitle: 'Hisobot yuborish',
      confirmSubmitMessage: 'Hisobotni ko\'rib chiqish uchun yuborishni istaysizmi? Yuborganingizdan keyin ma\'lumotlarni o\'zgartira olmaysiz.'
    },
    
    // Информационные сообщения
    info: {
      selectDuty: 'Hisobot yuborish uchun navbatchilik tanlang',
      fillReportForm: 'Bajarilgan navbatchilik hisoboti shaklini to\'ldiring',
      reportCancelled: 'Hisobot yuborish bekor qilindi'
    },
    
    // Ошибки
    error: {
      loadDuties: 'Navbatchiliklar ro\'yxatini yuklab bo\'lmadi',
      authError: 'Avtorizatsiya xatosi',
      submitReport: 'Hisobot yuborishda xatolik'
    }
  }
};