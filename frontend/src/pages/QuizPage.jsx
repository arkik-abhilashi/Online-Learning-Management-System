import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

export default function QuizPage() {
  const { sessionId } = useParams(); // مسیر: /quiz/:sessionId
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // 1. لیست آزمون‌های این جلسه را بگیر
  useEffect(() => {
    api.get(`/sessions/${sessionId}/quizzes`)
      .then(res => {
        setQuizzes(res.data.quizzes);
        if (res.data.quizzes.length > 0) {
          setActiveQuiz(res.data.quizzes[0]); // اولین آزمون را فعال کن
        }
      })
      .catch(() => addNotification('خطا در بارگذاری آزمون‌ها', 'error'));
  }, [sessionId]);

  // 2. وقتی activeQuiz تغییر کرد، سوالاتش را بگیر
  useEffect(() => {
    if (activeQuiz) {
      api.get(`/sessions/${sessionId}/quizzes/${activeQuiz.id}`)
        .then(res => {
          setQuestions(res.data.questions || []);
          setAnswers({});
          setSubmitted(false);
          setResult(null);
        })
        .catch(() => addNotification('خطا در بارگذاری سوالات', 'error'));
    }
  }, [activeQuiz, sessionId]);

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    // بررسی اینکه همه سوالات پاسخ داده شده‌اند (اختیاری)
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      addNotification(`به ${unanswered.length} سوال پاسخ نداده‌اید`, 'error');
      return;
    }

    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId
        }))
      };
      const res = await api.post(`/student/quizzes/${activeQuiz.id}/submit`, payload);
      setResult({ score: res.data.score, totalMarks: res.data.totalMarks });
      setSubmitted(true);
      addNotification('آزمون با موفقیت ارسال شد', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'خطا در ارسال آزمون', 'error');
    }
  };

  if (quizzes.length === 0) return <div className="text-center mt-10">آزمونی برای این جلسه وجود ندارد</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex gap-2 mb-4">
        {quizzes.length > 1 && quizzes.map(q => (
          <button
            key={q.id}
            onClick={() => setActiveQuiz(q)}
            className={`px-3 py-1 rounded ${q.id === activeQuiz?.id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            {q.title}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">آزمون: {activeQuiz?.title}</h2>
      {activeQuiz?.description && <p className="mb-4">{activeQuiz.description}</p>}

      {submitted && result && (
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded mb-4">
          <p>نمره شما: {result.score} از {result.totalMarks}</p>
        </div>
      )}

      {questions.map(q => (
        <div key={q.id} className="bg-white dark:bg-gray-800 p-4 mb-4 rounded shadow">
          <h3 className="font-bold mb-2">{q.text} <span className="text-sm text-gray-500">({q.marks} نمره)</span></h3>
          <div className="space-y-2">
            {q.options.map(opt => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value={opt.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => handleOptionSelect(q.id, opt.id)}
                  disabled={submitted}
                />
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      ))}

      {!submitted && questions.length > 0 && (
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded">ارسال پاسخ‌ها</button>
      )}
      <button onClick={() => navigate(-1)} className="bg-gray-500 text-white px-6 py-2 rounded ml-2">بازگشت</button>
    </div>
  );
}
