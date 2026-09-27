import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

export default function Checkout() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // فراخوانی endpoint عمومی (بدون نیاز به احراز هویت)
    api.get(`/public/courses/${courseId}`)
      .then(res => {
        setCourse(res.data.course);
        setLoading(false);
      })
      .catch(() => {
        addNotification('دوره مورد نظر یافت نشد', 'error');
        navigate('/courses');
      });
  }, [courseId]);

  const handlePay = async () => {
    try {
      await api.post(`/student/enroll/${courseId}`);
      addNotification('ثبت‌نام با موفقیت انجام شد', 'success');
      navigate(`/learn/${courseId}`);
    } catch (err) {
      addNotification(err.response?.data?.message || 'خطا در ثبت‌نام', 'error');
    }
  };

  if (loading) return <div className="text-center p-10">در حال بارگذاری...</div>;
  if (!course) return null;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">فاکتور پرداخت</h2>
      <p className="mb-2">دوره: {course.title}</p>
      <p className="text-lg font-bold mb-4">مبلغ قابل پرداخت: {course.price.toLocaleString()} تومان</p>
      <button
        onClick={handlePay}
        className="bg-green-600 text-white px-6 py-2 rounded w-full hover:bg-green-700"
      >
        پرداخت و ثبت‌نام
      </button>
    </div>
  );
}
