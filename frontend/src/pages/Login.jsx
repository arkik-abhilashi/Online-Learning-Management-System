import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form.email, form.password);
      addNotification('خوش آمدید', 'success');
      const role = data.user.role;
      if (role === 'ADMIN') navigate('/dashboard/admin');
      else if (role === 'INSTRUCTOR') navigate('/dashboard/instructor');
      else navigate('/dashboard/student');
    } catch (err) {
      addNotification(err.response?.data?.message || 'ورود ناموفق', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">ورود</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition">
            ورود
          </button>
        </form>
        <p className="text-sm text-center mt-4 text-gray-500 dark:text-gray-400">
          حساب ندارید؟ <Link to="/register" className="text-blue-600 hover:underline">ثبت‌نام</Link>
        </p>
      </div>
    </div>
  );
}
