export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  
  // Если это не стандартный номер телефона (12 цифр, начинающихся с 998), 
  // возвращаем как есть (логин пользователя)
  if (digits.length !== 12 || !digits.startsWith('998')) {
    return phone;
  }
  
  const part1 = digits.slice(3, 5);
  const part2 = digits.slice(5, 8);
  const part3 = digits.slice(8, 10);
  const part4 = digits.slice(10, 12);

  let formatted = '+998';
  if (part1) formatted += ` ${part1}`;
  if (part2) formatted += ` ${part2}`;
  if (part3) formatted += `-${part3}`;
  if (part4) formatted += `-${part4}`;

  return formatted;
};

export const formatPhoneForBackend = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  
  // Если это логин (буквы) или неполный номер, отправляем как есть
  if (digits.length < 9) {
    return phone;
  }
  
  return '+998' + digits.slice(-9);
};

export const isValidUzPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('998');
};