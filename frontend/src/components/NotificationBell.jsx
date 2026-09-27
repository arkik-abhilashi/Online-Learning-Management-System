import { useState } from 'react';
import { FiBell } from 'react-icons/fi';
import useNotifications from '../hooks/useNotifications';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="text-2xl relative">
        <FiBell />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded shadow-lg z-50 max-h-96 overflow-y-auto p-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold">اعلان‌ها</h4>
            <button onClick={markAllAsRead} className="text-xs text-blue-500">خواندن همه</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">اعلانی وجود ندارد</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`p-2 border-b text-sm ${n.read ? 'opacity-50' : 'font-bold'}`} onClick={() => markAsRead(n.id)}>
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
