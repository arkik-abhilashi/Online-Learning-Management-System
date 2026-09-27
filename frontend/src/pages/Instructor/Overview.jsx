import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Overview() {
  const [stats, setStats] = useState({});
  useEffect(() => {
    api.get('/instructor/stats').then(res => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <div className="text-2xl font-bold">{stats.courses}</div>
        <div className="text-sm text-gray-500">دوره‌های من</div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <div className="text-2xl font-bold">{stats.students}</div>
        <div className="text-sm text-gray-500">تعداد دانشجویان</div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <div className="text-2xl font-bold">{stats.avgScore ? `${stats.avgScore.toFixed(1)}%` : 'N/A'}</div>
        <div className="text-sm text-gray-500">میانگین نمرات</div>
      </div>
    </div>
  );
}
