import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState({ receiverId: '', courseId: '', content: '' });
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    // دریافت پیام‌های اخیر
    api.get('/messages').then(res => setMessages(res.data.messages)).catch(() => {});
    // گرفتن دوره‌های استاد
    api.get('/courses/my').then(res => setCourses(res.data.courses)).catch(() => {});
  }, []);

  const fetchStudents = async (courseId) => {
    const res = await api.get(`/instructor/courses/${courseId}/students`);
    setStudents(res.data.students);
  };

  const sendMessage = async () => {
    if (!newMsg.receiverId || !newMsg.courseId || !newMsg.content) {
      addNotification('همه فیلدها پر شود', 'error');
      return;
    }
    await api.post('/messages/send', newMsg);
    addNotification('پیام ارسال شد', 'success');
    setNewMsg({ receiverId: '', courseId: '', content: '' });
    // رفرش پیام‌ها
    const res = await api.get('/messages');
    setMessages(res.data.messages);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">پیام‌های خصوصی</h3>
      <div className="bg-white dark:bg-gray-800 p-4 rounded mb-4">
        <select value={newMsg.courseId} onChange={e => { setNewMsg({...newMsg, courseId: e.target.value}); fetchStudents(e.target.value); }} className="p-2 border rounded mb-2 w-full">
          <option value="">انتخاب دوره</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={newMsg.receiverId} onChange={e => setNewMsg({...newMsg, receiverId: e.target.value})} className="p-2 border rounded mb-2 w-full">
          <option value="">انتخاب دانشجو</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </select>
        <textarea value={newMsg.content} onChange={e => setNewMsg({...newMsg, content: e.target.value})} className="w-full p-2 border rounded mb-2" placeholder="متن پیام..." rows={3}></textarea>
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">ارسال</button>
      </div>
      <h4 className="font-bold mb-2">پیام‌های اخیر</h4>
      <ul className="space-y-2">
        {messages.map(m => (
          <li key={m.id} className="p-2 bg-white dark:bg-gray-800 rounded shadow">
            <p className="text-sm">{m.content}</p>
            <p className="text-xs text-gray-500">{m.read ? 'خوانده شده' : 'خوانده نشده'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
