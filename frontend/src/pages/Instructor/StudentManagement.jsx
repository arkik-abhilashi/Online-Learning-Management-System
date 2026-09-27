import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export default function StudentManagement() {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    api.get('/courses/my').then(res => setCourses(res.data.courses)).catch(() => {});
  }, []);

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">انتخاب دوره</h3>
      <div className="grid gap-2">
        {courses.map(c => (
          <Link key={c.id} to={`/instructor/course/${c.id}/students`} className="bg-white dark:bg-gray-800 p-3 rounded shadow block hover:bg-gray-100">
            {c.title} - {c.categoryName}
          </Link>
        ))}
      </div>
    </div>
  );
}
