import { useState, useEffect } from 'react';
import type { User, UsersMap } from '../types/user.types';

export const useUserSystem = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UsersMap>({});

  useEffect(() => {
    const storedUsers = localStorage.getItem('tuit_users');
    const savedUser = localStorage.getItem('tuit_current_user');
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (name: string, password: string): boolean => {
    const userKey = name.toLowerCase().trim();
    
    if (users[userKey]) {
      if (users[userKey].password === password) {
        const user = { name, login: userKey, password };
        setCurrentUser(user);
        localStorage.setItem('tuit_current_user', JSON.stringify(user));
        return true;
      }
      return false;
    } else if (['1', '2', '3', '4', '5'].includes(password)) {
      const newUser = { name, password };
      const updatedUsers = { ...users, [userKey]: newUser };
      const user = { name, login: userKey, password };
      
      setUsers(updatedUsers);
      setCurrentUser(user);
      
      localStorage.setItem('tuit_users', JSON.stringify(updatedUsers));
      localStorage.setItem('tuit_current_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    if (!currentUser || currentUser.password !== currentPassword) {
      return false;
    }
    
    const updatedUser = { ...currentUser, password: newPassword };
    const updatedUsers = { ...users, [currentUser.login]: { 
      name: currentUser.name, 
      password: newPassword 
    }};
    
    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    
    localStorage.setItem('tuit_current_user', JSON.stringify(updatedUser));
    localStorage.setItem('tuit_users', JSON.stringify(updatedUsers));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tuit_current_user');
  };

  return {
    currentUser,
    users,
    login,
    changePassword,
    logout
  };
};