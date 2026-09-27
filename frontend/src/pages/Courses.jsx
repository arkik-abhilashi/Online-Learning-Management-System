import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';

const BASE_URL = 'http://localhost:5000';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', level: '', minPrice: '', maxPrice: '' });
  const { addNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/courses/public').then(res => setCourses(res.data.courses)).catch(() => {});
    api.get('/public/categories').then(res => setCategories(res.data.categories)).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const { data } = await api.get(`/courses/public?${params.toString()}`);
    setCourses(data.courses);
  };

  const addToWishlist = async (courseId) => {
    if (!user) return addNotification('لطفاً وارد شوید', 'error');
    try {
      await api.post('/student/features/wishlist', { courseId });
      addNotification('به علاقه‌مندی‌ها اضافه شد', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'خطا', 'error');
    }
  };

  const addToCart = async (courseId) => {
    if (!user) return addNotification('لطفاً وارد شوید', 'error');
    try {
      await api.post('/student/features/cart', { courseId });
      addNotification('به سبد خرید اضافه شد', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'خطا', 'error');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">دوره‌های آموزشی</h2>
      <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <input placeholder="جستجوی نام..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">همه دسته‌ها</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.level} onChange={e => setFilters({...filters, level: e.target.value})}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">همه سطوح</option>
          <option value="BEGINNER">مقدماتی</option>
          <option value="INTERMEDIATE">متوسط</option>
          <option value="ADVANCED">پیشرفته</option>
        </select>
        <div className="flex gap-2">
          <input type="number" placeholder="حداقل قیمت" value={filters.minPrice} onChange={e => setFilters({...filters, minPrice: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          <input type="number" placeholder="حداکثر" value={filters.maxPrice} onChange={e => setFilters({...filters, maxPrice: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <div className="sm:col-span-2 md:col-span-4 flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition">جستجو</button>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition hover:shadow-lg">
            {course.imageUrl ? (
              <img src={course.imageUrl.startsWith('http') ? course.imageUrl : BASE_URL + course.imageUrl} alt={course.title} className="w-full h-44 object-cover" />
            ) : (
              <div className="w-full h-44 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">بدون تصویر</div>
            )}
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1">{course.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{course.categoryName} | {course.level}</p>
              <p className="text-sm font-semibold mb-3">{course.price === 0 ? 'رایگان' : `${course.price} تومان`}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Link to={`/courses/${course.id}`} className="text-sm text-blue-600 hover:underline">جزئیات</Link>
                {user?.role === 'STUDENT' && (
                  <>
                    <button onClick={() => addToWishlist(course.id)} className="text-yellow-600 hover:text-yellow-700 text-sm flex items-center gap-1">
                      <FiHeart /> علاقه‌مندی
                    </button>
                    {course.price > 0 && (
                      <button onClick={() => addToCart(course.id)} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                        <FiShoppingCart /> سبد خرید
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
