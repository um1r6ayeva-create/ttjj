import React, { useState, useEffect } from 'react';
import { Hash, Home, Building } from 'lucide-react';

interface RegisterStep2Props {
  formData: {
    user_group: string;
    n_room: number;
    role_id: number;
  };
  onChange: (name: string, value: string | number) => void;
}

const RegisterStep2: React.FC<RegisterStep2Props> = ({ formData, onChange }) => {
  const [selectedFloor, setSelectedFloor] = useState<number>(2);
  const [roomError, setRoomError] = useState<string>('');

  // Исправленная функция форматирования группы
  const formatGroup = (value: string) => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, '');
    
    // Ограничиваем до 5 цифр (3 цифры группы + 2 цифры подгруппы)
    const limitedDigits = digits.slice(0, 5);
    
    // Если введено 5 цифр, форматируем как XXX-XX
    if (limitedDigits.length === 5) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
    }
    
    // Если введено 4 цифры, можно добавить дефис после 3х цифр
    if (limitedDigits.length === 4) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
    }
    
    // Если меньше 4 цифр, возвращаем как есть
    return limitedDigits;
  };

  const handleGroupChange = (value: string) => {
    // Применяем форматирование и отправляем результат
    const formatted = formatGroup(value);
    onChange('user_group', formatted);
  };

  const floors = [2, 3, 4, 5, 6, 7, 8, 9];

  const getRoomRangeForFloor = (floor: number) => {
    const minRoom = floor * 100 + 1;
    const maxRoom = floor * 100 + 12;
    return { min: minRoom, max: maxRoom };
  };

  const handleFloorChange = (floor: number) => {
    setSelectedFloor(floor);
    const roomRange = getRoomRangeForFloor(floor);
    onChange('n_room', roomRange.min);
    setRoomError('');
  };

  const handleRoomChange = (value: string) => {
    const room = value.replace(/\D/g, '');
    
    if (room === '') {
      onChange('n_room', 0);
      setRoomError('');
      return;
    }

    const roomNum = parseInt(room, 10);
    const roomRange = getRoomRangeForFloor(selectedFloor);
    
    if (roomNum < roomRange.min || roomNum > roomRange.max) {
      setRoomError(`На ${selectedFloor} этаже доступны комнаты с ${roomRange.min} по ${roomRange.max}`);
      onChange('n_room', roomNum);
      return;
    }

    const roomOnFloor = roomNum % 100;
    if (roomOnFloor < 1 || roomOnFloor > 12) {
      setRoomError(`Номер комнаты должен быть от 01 до 12 (${roomRange.min}-${roomRange.max})`);
      onChange('n_room', roomNum);
      return;
    }

    setRoomError('');
    onChange('n_room', roomNum);
  };

  useEffect(() => {
    if (!formData.n_room || formData.n_room === 0) {
      const roomRange = getRoomRangeForFloor(2);
      onChange('n_room', roomRange.min);
    }
  }, []);

  return (
    <div className="form-section">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            <div className="form-label-content">
              <Hash className="w-4 h-4" />
              Группа
            </div>
          </label>
          <input
            type="text"
            value={formData.user_group}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="form-input"
            placeholder="222-22"
            required
            maxLength={6} // 3 цифры + дефис + 2 цифры = 6 символов
          />
          <p className="input-hint">Формат: 222-22, 333-11</p>
        </div>

        <div className="form-group">
          <label className="form-label">
            <div className="form-label-content">
              <Building className="w-4 h-4" />
              Этаж
            </div>
          </label>
          <div className="floor-selector">
            {floors.map(floor => (
              <button
                key={floor}
                type="button"
                className={`floor-btn ${selectedFloor === floor ? 'active' : ''}`}
                onClick={() => handleFloorChange(floor)}
              >
                {floor}
              </button>
            ))}
          </div>
          <p className="input-hint">Выберите этаж (2-9)</p>
        </div>

        <div className="form-group">
          <label className="form-label">
            <div className="form-label-content">
              <Home className="w-4 h-4" />
              Комната
            </div>
          </label>
          <input
            type="number"
            value={formData.n_room || ''}
            onChange={(e) => handleRoomChange(e.target.value)}
            min={getRoomRangeForFloor(selectedFloor).min}
            max={getRoomRangeForFloor(selectedFloor).max}
            className={`form-input ${roomError ? 'input-error' : ''}`}
            placeholder={getRoomRangeForFloor(selectedFloor).min.toString()}
            required
          />
          
          {roomError ? (
            <div className="error-message">
              <span>{roomError}</span>
            </div>
          ) : (
            <p className="input-hint">
              Диапазон: {getRoomRangeForFloor(selectedFloor).min}-{getRoomRangeForFloor(selectedFloor).max}
            </p>
          )}
        </div>
      </div>


      <div className="room-info-card">
        <h4 className="info-title">Информация о размещении:</h4>
        <ul className="info-list">
          <li>Выбран этаж: <strong>{selectedFloor}</strong></li>
          <li>Доступные комнаты: <strong>{getRoomRangeForFloor(selectedFloor).min}-{getRoomRangeForFloor(selectedFloor).max}</strong></li>
          <li>Этажи: <strong>2-9</strong>, на каждом по <strong>12</strong> комнат</li>
          <li>Пример: 2 этаж: 201-212, 3 этаж: 301-312, 9 этаж: 901-912</li>
        </ul>
      </div>
    </div>
  );
};

export default RegisterStep2;