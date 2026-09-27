import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { FiHeart, FiShoppingCart, FiArrowRight } from 'react-icons/fi';

const BASE_URL = 'http://localhost:5000';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // استفاده از مسیر عمومی برای دریافت جزئیات دوره
    api.get(`/public/courses/${courseId}`)
      .then(res => {
        setCourse(res.data.course);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching course:', err);
        // ممکن است endpoint عمومی وجود نداشته باشد، از مسیر محافظت‌شده استفاده کنیم
        api.get(`/courses/${courseId}`)
          .then(res => {
            setCourse(res.data.course);
            setLoading(false);
          })
          .catch(() => {
            addNotification('دوره یافت نشد', 'error');
            setLoading(false);
            navigate('/courses');
          });
      });
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
      addNotification('لطفاً وارد شوید', 'error');
      return;
    }
    try {
      if (course.price > 0) {
        // هدایت به صفحه پرداخت
        navigate(`/checkout/${course.id}`);
      } else {
        // ثبت‌نام مستقیم در دوره رایگان
        const res = await api.post(`/student/enroll/${course.id}`);
        addNotification('ثبت‌نام با موفقیت انجام شد', 'success');
        navigate(`/learn/${course.id}`);
      }
    } catch (err) {
      console.error('Enroll error:', err);
      addNotification(err.response?.data?.message || 'خطا در ثبت‌نام', 'error');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      addNotification('لطفاً وارد شوید', 'error');
      return;
    }
    try {
      const res = await api.post('/student/features/wishlist', { courseId: course.id });
      addNotification(res.data.message || 'به علاقه‌مندی‌ها اضافه شد', 'success');
    } catch (err) {
      console.error('Wishlist error:', err);
      addNotification(err.response?.data?.message || 'خطا در افزودن به علاقه‌مندی‌ها', 'error');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      addNotification('لطفاً وارد شوید', 'error');
      return;
    }
    try {
      const res = await api.post('/student/features/cart', { courseId: course.id });
      addNotification(res.data.message || 'به سبد خرید اضافه شد', 'success');
    } catch (err) {
      console.error('Cart error:', err);
      addNotification(err.response?.data?.message || 'خطا در افزودن به سبد خرید', 'error');
    }
  };

  if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div></div>;
  if (!course) return <div className="text-center py-20 text-gray-500">دوره‌ای یافت نشد</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {course.imageUrl && (
          <img
            src={course.imageUrl.startsWith('http') ? course.imageUrl : BASE_URL + course.imageUrl}
            alt={course.title}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>{course.categoryName}</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
              {course.level}
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">
            {course.price === 0 ? 'رایگان' : `${course.price.toLocaleString()} تومان`}
          </p>

          <div className="prose dark:prose-invert max-w-none mb-8" dangerouslySetInnerHTML={{ __html: course.introduction || course.description }} />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleEnroll}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              {course.price > 0 ? 'پرداخت و ثبت‌نام' : 'ثبت‌نام رایگان'}
              <FiArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleAddToWishlist}
              className="flex items-center gap-2 border border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 font-medium px-5 py-3 rounded-xl transition-colors"
            >
              <FiHeart className="w-4 h-4" /> علاقه‌مندی
            </button>

            {course.price > 0 && (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium px-5 py-3 rounded-xl transition-colors"
              >
                <FiShoppingCart className="w-4 h-4" /> افزودن به سبد خرید
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
