import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, api } from '../../../../../../contexts/AuthContext';
import './AssignDutyForm.css';

interface Student {
  id: number;
  name: string;
  surname: string;
  n_room?: number;
  role: string;
}

interface Duty {
  id: number;
  duty_type: string;
  room_number: number;
  floor: number;
  assigned_to: Student[];
  date_assigned: string;
  date_due: string;
  status: string;
  assigned_by?: Student; 
}

interface AssignDutyFormProps {
  onDutyAssigned: (duty: Duty) => void;
}

const AssignDutyForm = ({ onDutyAssigned }: AssignDutyFormProps) => {
  const { t } = useTranslation();
  const { fetchUsers, user } = useAuth();

  const [dutyType, setDutyType] = useState('kitchen');
  const [floor, setFloor] = useState(2);
  const [roomNumber, setRoomNumber] = useState('201');
  const [dueDate, setDueDate] = useState('');
  const [currentRoomStudents, setCurrentRoomStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const floors = [2, 3, 4, 5, 6, 7, 8, 9];
  const dutyTypes = [
    { value: 'kitchen', label: t('assignDutyForm.dutyTypes.kitchen') },
    { value: 'shower', label: t('assignDutyForm.dutyTypes.shower') },
    { value: 'sink', label: t('assignDutyForm.dutyTypes.sink') },
  ];

  const generateRooms = (floorNum: number) =>
    Array.from({ length: 12 }, (_, i) => (floorNum * 100 + i + 1).toString());

  const rooms = generateRooms(floor);

  // загрузка студентов комнаты
  const loadStudentsByRoom = async (room: string) => {
    setLoading(true);
    try {
      const users = await fetchUsers();
      const roomNum = Number(room);

      const students = users.filter(
        u =>
          u.n_room === roomNum &&
          (u.role.toLowerCase() === 'student' || u.role.toLowerCase() === 'admin')
      );

      setCurrentRoomStudents(students);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role.toLowerCase() === 'admin' && user.floor) {
      setFloor(user.floor);
    }
  }, [user]);

  useEffect(() => {
    loadStudentsByRoom(roomNumber);
  }, [roomNumber]);

  useEffect(() => {
    setRoomNumber(String(floor * 100 + 1));
  }, [floor]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // назначение дежурства
  const handleAssignDuty = async () => {
    if (!dueDate || currentRoomStudents.length === 0) {
      alert(t('assignDutyForm.errors.selectDate'));
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/duties/', {
        duty_type: dutyType,
        floor,
        room_number: Number(roomNumber),
        date_due: `${dueDate}T00:00:00`,
        status: 'assigned',
      });

      const data = res.data;

      const newDuty = {
        ...data,
        assigned_to: data.assigned_to,
      };

      onDutyAssigned(newDuty);
      setDueDate('');
    } catch {
      alert(t('assignDutyForm.errors.assignError'));
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения перевода кнопки этажа
  const getFloorButtonText = (floorNum: number) => {
    return `${floorNum} ${t('assignDutyForm.labels.floorButton')}`;
  };

  return (
    <div className="assign-duty-form">
      <h2>{t('assignDutyForm.title')}</h2>
      
      <div className="form-grid3">
        {/* Выбор типа дежурства */}
        <div className="form-group3">
          <label>{t('assignDutyForm.labels.dutyType')}</label>
          <div className="duty-type-selector">
            {dutyTypes.map(type => (
              <button
                key={type.value}
                type="button"
                className={`duty-type-btn ${dutyType === type.value ? 'active' : ''}`}
                onClick={() => setDutyType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Выбор этажа */}
        <div className="form-group3">
          <label>{t('assignDutyForm.labels.floor')}</label>
          <div className="floor-selector">
            {floors.map(f => {
              return (
                <button
                  key={f}
                  type="button"
                  className={`floor-btn ${floor === f ? 'active' : ''}`}
                  onClick={() => setFloor(f)}
                >
                  {getFloorButtonText(f)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Выбор комнаты */}
        <div className="form-group3">
          <label>{t('assignDutyForm.labels.room')}</label>
          <div className="room-selector">
            {rooms.map(r => (
              <button
                key={r}
                type="button"
                className={`room-btn ${roomNumber === r ? 'active' : ''}`}
                onClick={() => setRoomNumber(r)}
              >
                {r}
              </button>
            ))}
          </div>
          
          {/* Информация о студентах в комнате */}
          {currentRoomStudents.length > 0 && (
            <div className="room-students-info">
              <small>
                <strong>{t('assignDutyForm.rooms.studentsInRoom')}</strong><br />
                {currentRoomStudents.map((s, index) => (
                  <span key={s.id}>
                    {s.name} {s.surname}
                    {index < currentRoomStudents.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </small>
            </div>
          )}
        </div>

        {/* Выбор даты */}
        <div className="form-group3">
          <label>{t('assignDutyForm.labels.dueDate')}</label>
          <input
            className="date-input"
            type="date"
            value={dueDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Информация о назначаемом дежурстве */}
      {currentRoomStudents.length > 0 && roomNumber && dueDate && (
        <div className="duty-info-summary">
          <p>
            <strong>{t('assignDutyForm.summary.dutyWillBeAssigned')}</strong><br />
            {t('assignDutyForm.summary.type')}: {dutyTypes.find(t => t.value === dutyType)?.label}<br />
            {t('assignDutyForm.summary.floor')}: {floor}<br />
            {t('assignDutyForm.summary.room')}: {roomNumber}<br />
            {t('assignDutyForm.summary.date')}: {formatDate(dueDate + 'T00:00:00')}<br />
            {t('assignDutyForm.summary.students')}: {currentRoomStudents.length}
          </p>
        </div>
      )}

      {/* Кнопка назначения */}
      <button 
        className="assign-btn4"
        onClick={handleAssignDuty} 
        disabled={loading || !dueDate || currentRoomStudents.length === 0}
      >
        {loading ? t('assignDutyForm.buttons.assigning') : t('assignDutyForm.buttons.assignDuty')}
      </button>
    </div>
  );
};

export default AssignDutyForm;