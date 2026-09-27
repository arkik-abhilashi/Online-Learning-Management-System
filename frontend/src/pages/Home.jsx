import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
        به سامانه آموزش <span className="text-blue-600 dark:text-blue-400">LMS</span> خوش آمدید
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-10">
        دوره‌های متنوع را جستجو کنید، مهارت‌های جدید بیاموزید و با مدرسان مجرب یاد بگیرید.
      </p>
      <div className="flex gap-4">
        <Link to="/courses" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition">
          مشاهده دوره‌ها <FiArrowRight />
        </Link>
        {user && (
          <Link to={`/dashboard/${user.role.toLowerCase()}`} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-8 py-3 rounded-xl font-medium transition">
            داشبورد من
          </Link>
        )}
      </div>
    </div>
  );
}
