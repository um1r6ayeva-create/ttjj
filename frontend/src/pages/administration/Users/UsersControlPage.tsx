import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, Check, X, Search, Filter } from 'lucide-react';
import './UsersControlPage.css';

const UsersControlPage: React.FC = () => {
  const { fetchUsers, approveUser, rejectUser } = useAuth();
  const { t } = useTranslation();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      // Сортируем: сначала неактивные
      const sorted = [...data].sort((a, b) => {
        if (a.is_active === b.is_active) return 0;
        return a.is_active ? 1 : -1;
      });
      setUsers(sorted);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    try {
      await approveUser(userId);
      await loadUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Ошибка при подтверждении';
      alert(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number) => {
    if (!window.confirm('Вы уверены, что хотите отклонить регистрацию? Пользователь будет удален.')) return;
    
    setActionLoading(userId);
    try {
      await rejectUser(userId);
      await loadUsers();
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Ошибка при удалении';
      alert(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? !u.is_active :
      u.is_active;
    
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
      
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="users-control-container">
      <div className="users-header">
        <h1>{t('profilePage.usersControl')}</h1>
        <p>Управление доступом студентов и старост к системе</p>
      </div>

      <div className="users-tools">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Поиск по имени или логину..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            {filter === 'pending' && <Filter size={16} />} Ожидают ({users.filter(u => !u.is_active).length})
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''} 
            onClick={() => setFilter('active')}
          >
            Активные
          </button>
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Все
          </button>
        </div>
      </div>

      {loading ? (
        <div className="users-loading">
          <div className="spinner"></div>
          <p>Загрузка пользователей...</p>
        </div>
      ) : (
        <div className="users-list-wrapper">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <User size={48} />
              <p>Пользователи не найдены</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Группа / Комната</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className={!u.is_active ? 'pending-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {u.name[0]}{u.surname[0]}
                        </div>
                        <div className="user-info-text">
                          <div className="user-full-name">{u.name} {u.surname}</div>
                          <div className="user-phone">{u.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="group-room-cell">
                        <div>{u.user_group || '—'}</div>
                        <div className="room-sub">{u.n_room ? `Комната ${u.n_room}` : '—'}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-tag ${u.role}`}>
                        {u.role === 'admin' ? 'Староста' : 'Студент'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.is_active ? 'active' : 'pending'}`}>
                        {u.is_active ? 'Активен' : 'Ожидает'}
                      </span>
                    </td>
                    <td>
                      <div className="user-actions">
                        {!u.is_active && (
                          <button 
                            className="approve-btn"
                            disabled={actionLoading === u.id}
                            onClick={() => handleApprove(u.id)}
                            title="Подтвердить"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button 
                          className="reject-btn"
                          disabled={actionLoading === u.id}
                          onClick={() => handleReject(u.id)}
                          title={u.is_active ? "Удалить" : "Отклонить"}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default UsersControlPage;
