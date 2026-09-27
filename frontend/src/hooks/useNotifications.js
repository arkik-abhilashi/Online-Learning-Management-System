import { useEffect, useState } from 'react';
import api from '../services/api';
import { connectSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

export default function useNotifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.notifications.filter(n => !n.read).length);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await api.patch('/notifications/read-all');
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);

    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
