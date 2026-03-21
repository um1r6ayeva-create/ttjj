import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, api } from '../../../../../../contexts/AuthContext';
import './AssignedDutiesList.css';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../../../../../styles/ConfirmModal';


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
}

interface AssignedDutiesListProps {
  duties: Duty[];
  onDutiesLoaded: (duties: Duty[]) => void;
  onDutyUpdated: (updatedDuty: Duty) => void;
}

const AssignedDutiesList = ({ duties, onDutiesLoaded, onDutyUpdated }: AssignedDutiesListProps) => {
  const { t } = useTranslation();
  const { fetchUsers } = useAuth();
  const [, setLoading] = useState(false);
  const [editingDutyId, setEditingDutyId] = useState<number | null>(null);
  const [editedDuty, setEditedDuty] = useState<Partial<Duty>>({});
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});
  
  const showConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action);
    setConfirmOpen(true);
  };
  
  const dutyTypes = [
    { value: 'kitchen', label: t('assignedDutiesList.dutyTypes.kitchen') },
    { value: 'shower', label: t('assignedDutiesList.dutyTypes.shower') },
  ];

  const floors = [2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    loadAssignedDuties();
    loadAvailableStudents();
  }, []);

  const loadAssignedDuties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/duties/');
      onDutiesLoaded(res.data);
    } catch {
      toast.error(t('assignedDutiesList.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableStudents = async () => {
    try {
      const users = await fetchUsers();
      const students = users.filter(
        u => u.role.toLowerCase() === 'user' || u.role.toLowerCase() === 'admin'
      );
      setAvailableStudents(students);
    } catch {
      console.error(t('assignedDutiesList.messages.loadStudentsError'));
    }
  };

  const generateRooms = (floorNum: number) =>
    Array.from({ length: 12 }, (_, i) => (floorNum * 100 + i + 1).toString());

  const handleEditStart = (duty: Duty) => {
    setEditingDutyId(duty.id);
    setEditedDuty({
      duty_type: duty.duty_type,
      date_due: duty.date_due.split('T')[0],
      floor: duty.floor,
      room_number: duty.room_number,
    });
    
    const rooms = generateRooms(duty.floor);
    setAvailableRooms(rooms);
  };

  const handleFloorChange = (floor: number) => {
    const rooms = generateRooms(floor);
    setAvailableRooms(rooms);

    const firstRoom = parseInt(rooms[0]);

    setEditedDuty(prev => ({
      ...prev,
      floor,
      room_number: firstRoom,
    }));
  };

  const handleEditCancel = () => {
    setEditingDutyId(null);
    setEditedDuty({});
    setAvailableRooms([]);
  };

  const handleEditSave = async (dutyId: number) => {
    try {
      const dutyToUpdate = duties.find(d => d.id === dutyId);
      if (!dutyToUpdate) {
        toast.error(t('assignedDutiesList.errors.notFound'));
        return;
      }

      const updatedData = {
        ...dutyToUpdate,
        ...editedDuty,
        date_due: new Date(editedDuty.date_due!).toISOString(),
      };

      const res = await api.put(`/duties/${dutyId}`, updatedData);
      onDutyUpdated(res.data);

      setEditingDutyId(null);
      setEditedDuty({});
      setAvailableRooms([]);

      toast.success(t('assignedDutiesList.messages.updateSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('assignedDutiesList.messages.updateError'));
    }
  };

  const handleDelete = (dutyId: number) => {
    showConfirm(t('assignedDutiesList.confirmations.delete'), async () => {
      try {
        await api.delete(`/duties/${dutyId}`);

        onDutiesLoaded(duties.filter(duty => duty.id !== dutyId));
        toast.success(t('assignedDutiesList.messages.deleteSuccess'));
      } catch {
        toast.error(t('assignedDutiesList.messages.deleteError'));
      }
      setConfirmOpen(false);
    });
  };

  const handleFieldChange = (field: keyof Duty, value: any) => {
    setEditedDuty(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStudentsInRoom = (roomNumber: number) => {
    return availableStudents.filter(s => s.n_room === roomNumber);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

 const getStatusText = (status: string) => {
  // Локальный маппинг статусов
  const statusMap: Record<string, string> = {
    'pending': t('assignedDutiesList.status.pending'),
    'waiting': t('assignedDutiesList.status.waiting'),
    'confirmed': t('assignedDutiesList.status.confirmed'),
    'submitted': t('assignedDutiesList.status.submitted'),
  };
  
  return statusMap[status] || status;
};
  const canEditDuty = (duty: Duty) => {
    return duty.status !== 'confirmed' && duty.status !== 'submitted';
  };

  const canDeleteDuty = (_duty: Duty) => {
    return true;
  };

  return (
    <div className="assigned-duties-list">
      <h2>{t('assignedDutiesList.title')}</h2>

      {duties.length === 0 ? (
        <div className="no-duties">{t('assignedDutiesList.noDuties')}</div>
      ) : (
        <div className="duties-table-container">
          <table className="duties-table">
            <thead>
              <tr>
                <th>{t('assignedDutiesList.tableHeaders.type')}</th>
                <th>{t('assignedDutiesList.tableHeaders.room')}</th>
                <th>{t('assignedDutiesList.tableHeaders.floor')}</th>
                <th>{t('assignedDutiesList.tableHeaders.dateDue')}</th>
                <th>{t('assignedDutiesList.tableHeaders.status')}</th>
                <th>{t('assignedDutiesList.tableHeaders.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {[...duties]
                .sort((a, b) => new Date(a.date_due).getTime() - new Date(b.date_due).getTime())
                .map(duty => (
                <tr key={duty.id}>
                  <td>
                    {editingDutyId === duty.id ? (
                      <select
                        className="edit-select"
                        value={editedDuty.duty_type || duty.duty_type}
                        onChange={(e) => handleFieldChange('duty_type', e.target.value)}
                      >
                        {dutyTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`duty-badge ${duty.duty_type}`}>
                        {dutyTypes.find(t => t.value === duty.duty_type)?.label}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingDutyId === duty.id ? (
                      <div className="edit-room-group">
                        <select
                          className="edit-select"
                          value={editedDuty.floor || duty.floor}
                          onChange={(e) => handleFloorChange(parseInt(e.target.value))}
                        >
                          {floors.map(floor => (
                            <option key={floor} value={floor}>
                              {t('assignedDutiesList.edit.floorOption', { floor })}
                            </option>
                          ))}
                        </select>
                        <select
                          className="edit-select"
                          value={editedDuty.room_number || duty.room_number}
                          onChange={(e) => handleFieldChange('room_number', parseInt(e.target.value))}
                        >
                          {availableRooms.map(room => (
                            <option key={room} value={room}>
                              {room}
                            </option>
                          ))}
                        </select>
                        {editedDuty.room_number && (
                          <div className="room-students-info-small">
                            <small>
                              {t('assignedDutiesList.edit.studentsInRoom', { 
                                count: getStudentsInRoom(editedDuty.room_number).length 
                              })}
                            </small>
                          </div>
                        )}
                      </div>
                    ) : (
                      duty.room_number
                    )}
                  </td>
                  <td>
                    {editingDutyId === duty.id ? (
                      <span>
                        {editedDuty.floor || duty.floor}
                      </span>
                    ) : (
                      duty.floor
                    )}
                  </td>
                  <td>
                    {editingDutyId === duty.id ? (
                      <input
                        type="date"
                        className="edit-input"
                        value={editedDuty.date_due || duty.date_due.split('T')[0]}
                        onChange={(e) => handleFieldChange('date_due', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    ) : (
                      formatDate(duty.date_due)
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${duty.status}`}>
                      {getStatusText(duty.status)}
                    </span>
                  </td>
                  <td>
                    {editingDutyId === duty.id ? (
                      <div className="edit-actions">
                        <button 
                          className="action-btn save-btn"
                          onClick={() => handleEditSave(duty.id)}
                          title={t('assignedDutiesList.actions.save')}
                        >
                          💾
                        </button>
                        <button 
                          className="action-btn cancel-btn"
                          onClick={handleEditCancel}
                          title={t('assignedDutiesList.actions.cancel')}
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <div className="action-buttons3">
                        {canEditDuty(duty) && (
                          <button 
                            className="action-btn edit-btn3"
                            onClick={() => handleEditStart(duty)}
                          >
                            {t('assignedDutiesList.actions.edit')}
                          </button>
                        )}
                        {canDeleteDuty(duty) && (
                          <button 
                            className="action-btn delete-btn3"
                            onClick={() => handleDelete(duty.id)}
                          >
                            {t('assignedDutiesList.actions.delete')}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmOpen}
        message={confirmMessage}
        onConfirm={onConfirmAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default AssignedDutiesList;