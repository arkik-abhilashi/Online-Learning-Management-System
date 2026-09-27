import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

export default function ManageSessions() {
  const { courseId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', videoUrl: '', order: '' });
  const [videoFile, setVideoFile] = useState(null);
  const { addNotification } = useNotification();

  const fetchSessions = () => {
    api.get(`/courses/${courseId}/sessions`).then(res => setSessions(res.data.sessions)).catch(() => {});
  };

  useEffect(() => { fetchSessions(); }, [courseId]);

  const createSession = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description || '');
      fd.append('order', form.order || 0);
      if (form.videoUrl) fd.append('videoUrl', form.videoUrl);
      if (videoFile) fd.append('video', videoFile);
      await api.post(`/courses/${courseId}/sessions`, fd);
      addNotification('جلسه اضافه شد', 'success');
      setForm({ title: '', description: '', videoUrl: '', order: '' });
      setVideoFile(null);
      fetchSessions();
    } catch (err) {
      addNotification('خطا در افزودن جلسه', 'error');
    }
  };

  const deleteSession = async (id) => {
    if (!confirm('حذف جلسه؟')) return;
    await api.delete(`/courses/${courseId}/sessions/${id}`);
    fetchSessions();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">مدیریت جلسات</h2>
      <form onSubmit={createSession} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6 flex flex-col gap-3">
        <input placeholder="عنوان" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="p-2 border rounded dark:bg-gray-700 dark:text-white" required />
        <textarea placeholder="توضیحات" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="p-2 border rounded dark:bg-gray-700 dark:text-white" />
        <input placeholder="لینک ویدیو (اختیاری)" value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} className="p-2 border rounded dark:bg-gray-700 dark:text-white" />
        <input type="file" onChange={e => setVideoFile(e.target.files[0])} />
        <input type="number" placeholder="ترتیب" value={form.order} onChange={e => setForm({...form, order: e.target.value})} className="p-2 border rounded dark:bg-gray-700 dark:text-white w-24" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">افزودن جلسه</button>
      </form>
      <ul className="space-y-2">
        {sessions.map(s => (
          <li key={s.id} className="bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center">
            <span>{s.order}. {s.title}</span>
            <div className="flex gap-2">
              <Link to={`/manage/session/${s.id}/quizzes`} className="text-blue-500 text-sm">آزمون‌ها</Link>
              <button onClick={() => deleteSession(s.id)} className="text-red-500 text-sm">حذف</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
