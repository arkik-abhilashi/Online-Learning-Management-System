import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

export default function StudentDetail() {
  const { courseId, studentId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/instructor/courses/${courseId}/students/${studentId}`).then(res => setData(res.data)).catch(() => {});
  }, [courseId, studentId]);

  if (!data) return <p>در حال بارگذاری...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">{data.user.fullName} ({data.user.email})</h2>
      <h3 className="font-bold mt-4">جلسات</h3>
      <ul className="list-disc ml-5">
        {data.sessions.map(s => (
          <li key={s.id}>{s.title} - {s.completed ? 'تکمیل' : 'ناتمام'}</li>
        ))}
      </ul>
      <h3 className="font-bold mt-4">آزمون‌ها</h3>
      <ul className="list-disc ml-5">
        {data.quizzes.map(q => (
          <li key={q.submittedAt}>{q.quizTitle}: {q.score}/{q.totalMarks}</li>
        ))}
      </ul>
      {/* می‌توان دکمه ارسال پیام اضافه کرد */}
    </div>
  );
}
