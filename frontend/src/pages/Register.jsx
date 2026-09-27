import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(form);
      if (data.needsApproval) {
        navigate('/pending-approval');
        return;
      }
      addNotification('ثبت‌نام موفق', 'success');
      navigate('/dashboard/student');
    } catch (err) {
      addNotification(err.response?.data?.message || 'خطا', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">ثبت‌نام</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">نام کامل</label>
            <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ایمیل</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رمز عبور</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نقش</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="STUDENT">دانشجو</option>
              <option value="INSTRUCTOR">مدرس</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition">
            ثبت‌نام
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-500 dark:text-gray-400">
          حساب دارید؟ <Link to="/login" className="text-blue-600 hover:underline">ورود</Link>
        </p>
      </div>
    </div>
  );
}
