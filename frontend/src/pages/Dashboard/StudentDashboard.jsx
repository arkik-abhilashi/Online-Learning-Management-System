import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiAward, FiHeart, FiShoppingCart } from 'react-icons/fi';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    api.get('/student/enrollments').then(res => setEnrollments(res.data.enrollments)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">داشبورد من</h2>
        <div className="flex gap-3 mt-2 sm:mt-0">
          <Link to="/certificates" className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm hover:shadow transition">
            <FiAward /> گواهی‌ها
          </Link>
          <Link to="/wishlist" className="flex items-center gap-1 bg-white dark:bg-gray-800 border px-4 py-2 rounded-xl text-sm hover:shadow transition">
            <FiHeart /> علاقه‌مندی‌ها
          </Link>
          <Link to="/cart" className="flex items-center gap-1 bg-white dark:bg-gray-800 border px-4 py-2 rounded-xl text-sm hover:shadow transition">
            <FiShoppingCart /> سبد خرید
          </Link>
        </div>
      </div>

      {enrollments.length === 0 && (
        <div className="text-center py-10 text-gray-500">هنوز در دوره‌ای ثبت‌نام نکرده‌اید</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enrollments.map(enr => (
          <div key={enr.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1">{enr.courseTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{enr.categoryName} | {enr.level}</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-2 overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: (enr.progress || 0) + '%' }}></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{enr.progress || 0}%</p>
              <Link to={`/learn/${enr.courseId}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <FiBookOpen /> ورود به دوره
              </Link>
              {enr.certificateIssued && (
                <span className="ml-3 text-xs text-green-600 font-semibold">✓ گواهی صادر شده</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
