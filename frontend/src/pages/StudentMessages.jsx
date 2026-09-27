import { useEffect, useState } from 'react';
import api from '../services/api';

export default function StudentMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages')
      .then(res => {
        setMessages(res.data.messages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-10">در حال بارگذاری...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">پیام‌های من</h2>
      {messages.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">هیچ پیامی وجود ندارد. اگر مدرس برای شما پیامی ارسال کند، این‌جا نمایش داده می‌شود.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map(msg => (
            <li key={msg.id} className={`p-4 rounded shadow ${
              msg.read ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900 font-semibold'
            }`}>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span>از: {msg.senderName || 'نامشخص'}</span>
                <span>{new Date(msg.createdAt).toLocaleString('fa-IR')}</span>
              </div>
              <p className="text-gray-900 dark:text-gray-100">{msg.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
