import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const BASE_URL = 'http://localhost:5000';
const getMediaUrl = (url) => (url ? (url.startsWith('http') ? url : BASE_URL + url) : null);

export default function LearnCourse() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [activeDetails, setActiveDetails] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [tab, setTab] = useState('video');

  // یادداشت‌ها، بوکمارک‌ها و بحث
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ videoTime: 0, content: '' });
  const [bookmarks, setBookmarks] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);

  const { addNotification } = useNotification();
  const videoRef = useRef(null);

  const fetchProgress = () => {
    api.get(`/student/courses/${courseId}/progress`)
      .then(res => {
        setSessions(res.data.sessions);
        setOverallProgress(res.data.overallProgress);
        if (!activeSession && res.data.sessions.length > 0) setActiveSession(res.data.sessions[0]);
      })
      .catch(() => {});
  };

  useEffect(() => {
    api.get(`/student/courses/${courseId}/learn`)
      .then(res => {
        setCourse(res.data.course);
        setSessions(res.data.sessions);
        if (res.data.sessions.length > 0) setActiveSession(res.data.sessions[0]);
      })
      .catch(() => {});
    fetchProgress();
  }, [courseId]);

  useEffect(() => {
    if (activeSession) {
      api.get(`/courses/${courseId}/sessions/${activeSession.id}`)
        .then(res => {
          setActiveDetails(res.data.session);
          setAttachments(res.data.attachments || []);
        })
        .catch(() => {});
      loadNotes();
      loadBookmarks();
      loadDiscussions();
    }
  }, [activeSession?.id, courseId]);

  const toggleComplete = async (session) => {
    try {
      const res = await api.patch(`/student/sessions/${session.id}/complete`);
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, completed: res.data.completed } : s));
      setOverallProgress(res.data.progress);
      if (activeSession?.id === session.id) setActiveSession(prev => ({ ...prev, completed: res.data.completed }));
    } catch (err) { addNotification('خطا', 'error'); }
  };

  const handleGetCertificate = async () => {
    try {
      const res = await api.post(`/student/courses/${courseId}/generate-certificate`);
      addNotification('گواهی صادر شد!', 'success');
      window.open(BASE_URL + res.data.pdfUrl, '_blank');
    } catch (err) {
      addNotification(err.response?.data?.message || 'خطا', 'error');
    }
  };

  // ---- یادداشت‌ها ----
  const loadNotes = () => {
    if (!activeSession) return;
    api.get(`/student/features/sessions/${activeSession.id}/notes`).then(res => setNotes(res.data.notes)).catch(() => {});
  };
  const addNote = async () => {
    if (!newNote.content.trim()) return;
    await api.post(`/student/features/sessions/${activeSession.id}/notes`, { videoTime: newNote.videoTime, content: newNote.content });
    setNewNote({ videoTime: 0, content: '' });
    loadNotes();
    addNotification('یادداشت ذخیره شد', 'success');
  };
  const deleteNote = async (id) => { await api.delete(`/student/features/notes/${id}`); loadNotes(); };

  // ---- بوکمارک‌ها ----
  const loadBookmarks = () => {
    if (!activeSession) return;
    api.get(`/student/features/sessions/${activeSession.id}/bookmarks`).then(res => setBookmarks(res.data.bookmarks)).catch(() => {});
  };
  const addBookmark = async () => {
    const currentTime = videoRef.current?.currentTime || 0;
    await api.post(`/student/features/sessions/${activeSession.id}/bookmarks`, {
      videoTime: currentTime,
      label: `زمان ${Math.floor(currentTime)} ثانیه`
    });
    loadBookmarks();
    addNotification('بوکمارک افزوده شد', 'success');
  };
  const jumpTo = (time) => { if (videoRef.current) { videoRef.current.currentTime = time; videoRef.current.play(); } };

  // ---- بحث ----
  const loadDiscussions = async () => {
    if (!activeSession) return;
    setLoadingDiscussions(true);
    try {
      const res = await api.get(`/student/features/sessions/${activeSession.id}/discussions`);
      setDiscussions(res.data.discussions);
    } catch (err) {
      addNotification('خطا در بارگذاری گفتگو', 'error');
    } finally {
      setLoadingDiscussions(false);
    }
  };
  const postDiscussion = async () => {
    if (!newDiscussion.trim()) return;
    try {
      await api.post(`/student/features/sessions/${activeSession.id}/discussions`, { content: newDiscussion });
      setNewDiscussion('');
      loadDiscussions();
      addNotification('نظر شما ثبت شد', 'success');
    } catch (err) {
      addNotification('خطا در ارسال نظر', 'error');
    }
  };

  if (!course) return <div className="text-center p-10">در حال بارگذاری...</div>;

  const videoUrl = getMediaUrl(activeDetails?.videoUrl || activeSession?.videoUrl);

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-4">
      {/* ستون کناری: جلسات */}
      <aside className="md:w-72 bg-white dark:bg-gray-800 rounded-xl shadow p-5 h-fit">
        <h3 className="font-bold text-lg mb-3">{course.title}</h3>
        <div className="text-sm mb-2">
          پیشرفت: {overallProgress}% ({sessions.filter(s => s.completed).length} از {sessions.length} جلسه)
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-6 overflow-hidden">
          <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: overallProgress + '%' }}></div>
        </div>
        <ul className="space-y-1.5 mb-6">
          {sessions.map(s => (
            <li
              key={s.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                activeSession?.id === s.id ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''
              }`}
              onClick={() => setActiveSession(s)}
            >
              <input
                type="checkbox"
                checked={s.completed || false}
                onChange={e => { e.stopPropagation(); toggleComplete(s); }}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm">{s.order}. {s.title}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={handleGetCertificate}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition"
        >
          دریافت گواهی
        </button>
      </aside>

      {/* محتوای اصلی */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow p-5 min-h-[500px]">
        {activeSession ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{activeDetails?.title || activeSession.title}</h2>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeSession.completed || false}
                  onChange={() => toggleComplete(activeSession)}
                  className="w-4 h-4 accent-green-600"
                />
                تکمیل جلسه
              </label>
            </div>

            {/* تب‌ها */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
              {[
                { key: 'video', label: '🎥 ویدیو' },
                { key: 'notes', label: '📝 یادداشت‌ها' },
                { key: 'discussion', label: '💬 گفتگو' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  className={`px-5 py-2 rounded-t-lg text-sm font-medium transition ${
                    tab === item.key
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* محتوای تب */}
            {tab === 'video' && (
              <div>
                {videoUrl ? (
                  <div className="relative mb-6">
                    <video
                      ref={videoRef}
                      controls
                      className="w-full rounded-lg"
                      crossOrigin="anonymous"
                      style={{ maxHeight: '480px' }}
                      key={videoUrl}
                    >
                      <source src={videoUrl} type="video/mp4" />
                    </video>
                    <button
                      onClick={addBookmark}
                      className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-70 hover:bg-opacity-90 text-white text-sm px-3 py-1.5 rounded-lg transition"
                    >
                      ⏱ ذخیره موقعیت
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6 text-gray-500">
                    این جلسه ویدیو ندارد
                  </div>
                )}

                {activeDetails?.description && (
                  <div className="prose dark:prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: activeDetails.description }} />
                )}

                {attachments.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
                    <h3 className="font-bold mb-2">📎 فایل‌های ضمیمه</h3>
                    <ul className="space-y-1">
                      {attachments.map(a => (
                        <li key={a.id}>
                          <a href={getMediaUrl(a.fileUrl)} download className="text-blue-500 hover:underline text-sm">
                            {a.fileName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {bookmarks.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-bold mb-2">🔖 بوکمارک‌ها</h3>
                    <div className="flex flex-wrap gap-2">
                      {bookmarks.map(b => (
                        <button
                          key={b.id}
                          onClick={() => jumpTo(b.videoTime)}
                          className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'notes' && (
              <div>
                <div className="flex gap-2 mb-6">
                  <input
                    type="number"
                    placeholder="ثانیه"
                    value={newNote.videoTime}
                    onChange={e => setNewNote({ ...newNote, videoTime: parseFloat(e.target.value) || 0 })}
                    className="w-20 p-2 border rounded dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <input
                    placeholder="متن یادداشت..."
                    value={newNote.content}
                    onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <button
                    onClick={addNote}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
                  >
                    ذخیره
                  </button>
                </div>
                {notes.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm">هنوز یادداشتی ثبت نشده است.</p>}
                {notes.map(n => (
                  <div key={n.id} className="flex justify-between items-start p-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-xs text-gray-500 font-mono">{Math.floor(n.videoTime)}s</span>
                      <p className="text-sm mt-1">{n.content}</p>
                    </div>
                    <button onClick={() => deleteNote(n.id)} className="text-red-500 text-sm hover:underline">حذف</button>
                  </div>
                ))}
              </div>
            )}

            {tab === 'discussion' && (
              <div>
                <div className="flex gap-2 mb-6">
                  <textarea
                    value={newDiscussion}
                    onChange={e => setNewDiscussion(e.target.value)}
                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white text-sm"
                    placeholder="نظر خود را بنویسید..."
                    rows={3}
                  ></textarea>
                  <button
                    onClick={postDiscussion}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm self-start transition"
                  >
                    ارسال
                  </button>
                </div>
                {loadingDiscussions && <p className="text-sm text-gray-500">در حال بارگذاری...</p>}
                {!loadingDiscussions && discussions.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">هنوز بحثی در این جلسه شروع نشده است.</p>
                )}
                {discussions.map(d => (
                  <div key={d.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-3">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{d.userName}</p>
                    <p className="text-sm mt-1">{d.content}</p>
                    {d.replies && d.replies.map(r => (
                      <div key={r.id} className="ml-6 border-l-2 border-blue-400 pl-3 mt-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{r.userName}</p>
                        <p className="text-sm">{r.content}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link to={`/quiz/${activeSession.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm transition">
                شرکت در آزمون
              </Link>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            یک جلسه را از لیست سمت راست انتخاب کنید
          </div>
        )}
      </div>
    </div>
  );
}
