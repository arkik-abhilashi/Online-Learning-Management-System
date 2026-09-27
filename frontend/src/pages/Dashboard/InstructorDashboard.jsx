import { useState } from 'react';
import Overview from '../Instructor/Overview';
import MyCourses from '../Instructor/MyCourses';
import StudentManagement from '../Instructor/StudentManagement';
import Messages from '../Instructor/Messages';

export default function InstructorDashboard() {
  const [tab, setTab] = useState('overview');

  const tabs = [
    { key: 'overview', label: 'نمای کلی' },
    { key: 'courses', label: 'دوره‌های من' },
    { key: 'students', label: 'دانشجویان' },
    { key: 'messages', label: 'پیام‌ها' }
  ];

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-t-lg text-sm font-medium transition whitespace-nowrap ${
              tab === t.key ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        {tab === 'overview' && <Overview />}
        {tab === 'courses' && <MyCourses />}
        {tab === 'students' && <StudentManagement />}
        {tab === 'messages' && <Messages />}
      </div>
    </div>
  );
}
