import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

export default function ManageQuizzes() {
  const { sessionId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    questions: [{ text: '', marks: 1, options: [{ text: '', isCorrect: false }] }]
  });
  const { addNotification } = useNotification();

  const fetchQuizzes = () => {
    api.get(`/sessions/${sessionId}/quizzes`)
      .then(res => setQuizzes(res.data.quizzes))
      .catch(() => addNotification('خطا در بارگذاری آزمون‌ها', 'error'));
  };

  useEffect(() => { fetchQuizzes(); }, [sessionId]);

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', marks: 1, options: [{ text: '', isCorrect: false }] }]
    }));
  };

  const removeQuestion = (qIdx) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIdx)
    }));
  };

  const addOption = (qIdx) => {
    setForm(prev => {
      const questions = [...prev.questions];
      questions[qIdx] = { ...questions[qIdx], options: [...questions[qIdx].options, { text: '', isCorrect: false }] };
      return { ...prev, questions };
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setForm(prev => {
      const questions = [...prev.questions];
      questions[qIdx] = { ...questions[qIdx], options: questions[qIdx].options.filter((_, i) => i !== oIdx) };
      return { ...prev, questions };
    });
  };

  const updateQuestion = (qIdx, field, value) => {
    setForm(prev => {
      const questions = [...prev.questions];
      questions[qIdx] = { ...questions[qIdx], [field]: value };
      return { ...prev, questions };
    });
  };

  const updateOption = (qIdx, oIdx, field, value) => {
    setForm(prev => {
      const questions = [...prev.questions];
      const options = [...questions[qIdx].options];
      options[oIdx] = { ...options[oIdx], [field]: value };
      questions[qIdx] = { ...questions[qIdx], options };
      return { ...prev, questions };
    });
  };

  const setCorrectOption = (qIdx, oIdx) => {
    setForm(prev => {
      const questions = [...prev.questions];
      questions[qIdx].options = questions[qIdx].options.map((opt, i) => ({ ...opt, isCorrect: i === oIdx }));
      return { ...prev, questions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation: at least one question, each question at least one option, and one correct option per question
    if (form.questions.length === 0) return addNotification('حداقل یک سوال اضافه کنید', 'error');
    for (let i = 0; i < form.questions.length; i++) {
      if (!form.questions[i].text) return addNotification(`متن سوال ${i + 1} خالی است`, 'error');
      if (form.questions[i].options.length === 0) return addNotification(`سوال ${i + 1} گزینه ندارد`, 'error');
      if (!form.questions[i].options.some(o => o.isCorrect)) return addNotification(`سوال ${i + 1} گزینه صحیح ندارد`, 'error');
    }

    try {
      await api.post(`/sessions/${sessionId}/quizzes`, form);
      addNotification('آزمون با موفقیت ایجاد شد', 'success');
      setShowForm(false);
      setForm({ title: '', description: '', questions: [{ text: '', marks: 1, options: [{ text: '', isCorrect: false }] }] });
      fetchQuizzes();
    } catch (err) {
      addNotification(err.response?.data?.message || 'خطا در ایجاد آزمون', 'error');
    }
  };

  const deleteQuiz = async (id) => {
    if (!confirm('آزمون حذف شود؟')) return;
    await api.delete(`/sessions/${sessionId}/quizzes/${id}`);
    fetchQuizzes();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">مدیریت آزمون‌های جلسه</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded">
          {showForm ? 'انصراف' : 'افزودن آزمون جدید'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input placeholder="عنوان آزمون" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="p-2 border rounded dark:bg-gray-700" required />
            <input placeholder="توضیحات (اختیاری)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="p-2 border rounded dark:bg-gray-700" />
          </div>

          <h3 className="font-bold mb-2">سوالات</h3>
          {form.questions.map((q, qIdx) => (
            <div key={qIdx} className="border dark:border-gray-600 p-3 mb-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">سوال {qIdx + 1}</span>
                <button type="button" onClick={() => removeQuestion(qIdx)} className="text-red-500 text-sm">حذف سوال</button>
              </div>
              <input placeholder="متن سوال" value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 mb-2" required />
              <input type="number" placeholder="نمره" value={q.marks} onChange={e => updateQuestion(qIdx, 'marks', parseFloat(e.target.value) || 0)} className="p-2 border rounded dark:bg-gray-700 w-24 mb-2" min="0" step="0.5" />

              <label className="block text-sm font-medium mb-1">گزینه‌ها</label>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={opt.isCorrect}
                    onChange={() => setCorrectOption(qIdx, oIdx)}
                    className="radio"
                  />
                  <input
                    placeholder={`گزینه ${oIdx + 1}`}
                    value={opt.text}
                    onChange={e => updateOption(qIdx, oIdx, 'text', e.target.value)}
                    className="flex-1 p-1 border rounded dark:bg-gray-700"
                    required
                  />
                  <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="text-red-500 text-sm">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => addOption(qIdx)} className="text-blue-500 text-sm mt-1">+ افزودن گزینه</button>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="bg-gray-500 text-white px-3 py-1 rounded mb-3">+ افزودن سوال</button>
          <br />
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">ذخیره آزمون</button>
        </form>
      )}

      <h3 className="text-lg font-bold mb-2">آزمون‌های موجود</h3>
      {quizzes.length === 0 ? (
        <p>هیچ آزمونی وجود ندارد</p>
      ) : (
        <ul className="space-y-2">
          {quizzes.map(q => (
            <li key={q.id} className="bg-white dark:bg-gray-800 p-3 rounded shadow flex justify-between items-center">
              <span>{q.title}</span>
              <button onClick={() => deleteQuiz(q.id)} className="text-red-500 text-sm">حذف</button>
            </li>
          ))}
        </ul>
      )}
      <Link to=".." className="text-gray-500 hover:underline mt-4 inline-block">بازگشت به جلسات</Link>
    </div>
  );
}
