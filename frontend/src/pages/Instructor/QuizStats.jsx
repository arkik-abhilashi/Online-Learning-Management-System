import { useState } from 'react';
import api from '../../services/api';

export default function QuizStats() {
  const [quizId, setQuizId] = useState('');
  const [stats, setStats] = useState([]);

  const fetchStats = async () => {
    if (!quizId) return;
    const res = await api.get(`/instructor/quizzes/${quizId}/stats`);
    setStats(res.data.stats);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-2">گزارش عملکرد سوالات</h2>
      <div className="flex gap-2 mb-4">
        <input placeholder="شناسه آزمون" value={quizId} onChange={e => setQuizId(e.target.value)} className="p-2 border rounded" />
        <button onClick={fetchStats} className="bg-blue-600 text-white px-4 py-2 rounded">مشاهده</button>
      </div>
      {stats.length > 0 && (
        <table className="w-full border">
          <thead><tr><th>سوال</th><th>نمره</th><th>پاسخ صحیح %</th></tr></thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.id}><td>{s.text}</td><td>{s.marks}</td><td>{s.correctPercentage}%</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
