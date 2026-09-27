import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function CourseStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    api.get(`/instructor/courses/${courseId}/students`)
      .then(res => setStudents(res.data.students))
      .catch(() => {});
  }, [courseId]);

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">دانشجویان دوره</h2>
      {students.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">هنوز دانشجویی ثبت‌نام نکرده است.</p>
      ) : (
        <div className="grid gap-3">
          {students.map(s => (
            <div key={s.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
              <div>
                <span className="font-semibold">{s.fullName}</span>
                <span className="text-sm text-gray-500 ml-3">{s.email}</span>
                <span className="text-sm ml-3">پیشرفت: {s.progress}%</span>
              </div>
              <Link
                to={`/instructor/course/${courseId}/student/${s.id}`}
                className="text-blue-500 text-sm hover:underline"
              >
                جزئیات
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
