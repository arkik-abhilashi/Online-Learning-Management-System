import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', introduction: '', categoryId: '', price: 0, level: 'BEGINNER', isPublished: true });
  const [file, setFile] = useState(null);
  const { addNotification } = useNotification();

  const fetchCourses = () => api.get('/courses/my').then(res => setCourses(res.data.courses)).catch(() => {});
  const fetchCategories = () => api.get('/public/categories').then(res => setCategories(res.data.categories)).catch(() => {});

  useEffect(() => { fetchCourses(); fetchCategories(); }, []);

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('introduction', form.introduction);
      fd.append('categoryId', form.categoryId);
      fd.append('price', form.price);
      fd.append('level', form.level);
      fd.append('isPublished', form.isPublished);
      if (file) fd.append('image', file);
      await api.post('/courses', fd);
      addNotification('دوره ایجاد شد', 'success');
      setForm({ title: '', description: '', introduction: '', categoryId: '', price: 0, level: 'BEGINNER', isPublished: true });
      setFile(null);
      fetchCourses();
    } catch (err) { addNotification('خطا', 'error'); }
  };

  return (
    <div>
      <form onSubmit={createCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input placeholder="عنوان دوره" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-style" required />
        <input placeholder="توضیحات کوتاه" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-style" />
        <textarea placeholder="معرفی کامل (HTML)" value={form.introduction} onChange={e => setForm({...form, introduction: e.target.value})} className="col-span-2 input-style" rows={4} />
        <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="input-style" required>
          <option value="">دسته‌بندی</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" placeholder="قیمت" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-style" />
        <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="input-style">
          <option value="BEGINNER">مقدماتی</option>
          <option value="INTERMEDIATE">متوسط</option>
          <option value="ADVANCED">پیشرفته</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isPublished} onChange={e => setForm({...form, isPublished: e.target.checked})} />
          انتشار دوره
        </label>
        <input type="file" onChange={e => setFile(e.target.files[0])} className="text-sm" />
        <button type="submit" className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition">ایجاد دوره</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(c => (
          <div key={c.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex justify-between items-start">
            <div>
              <h4 className="font-bold">{c.title}</h4>
              <p className="text-sm text-gray-500">{c.categoryName} | {c.level}</p>
              <p className="text-sm">{c.price === 0 ? 'رایگان' : `${c.price} تومان`} | {c.isPublished ? 'منتشر' : 'پیش‌نویس'}</p>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <Link to={`/manage/course/${c.id}/sessions`} className="text-blue-600 hover:underline">جلسات</Link>
              <Link to={`/instructor/course/${c.id}/students`} className="text-blue-600 hover:underline">دانشجویان</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
