import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function AdminDashboard() {
  const { addNotification } = useNotification();
  const [tab, setTab] = useState('overview'); // overview | users | instructors | courses | logs | notifications
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [courses, setCourses] = useState([]);
  const [coursePage, setCoursePage] = useState(1);
  const [courseTotalPages, setCourseTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '' });
  const [editingCat, setEditingCat] = useState(null);
  const [instructorsRevenue, setInstructorsRevenue] = useState([]);
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [globalNotifMsg, setGlobalNotifMsg] = useState('');

  const fetchStats = () => api.get('/admin/statistics').then(res => setStats(res.data)).catch(() => {});
  const fetchUsers = (page = 1) => {
    api.get(`/admin/users?page=${page}&limit=5`).then(res => {
      setUsers(res.data.users);
      setUserPage(res.data.page);
      setUserTotalPages(res.data.totalPages);
    }).catch(() => {});
  };
  const fetchCourses = (page = 1) => {
    api.get(`/courses/my?page=${page}&limit=5`).then(res => { // به عنوان ادمین از my استفاده می‌کنیم که همه را برمی‌گرداند
      setCourses(res.data.courses);
      setCoursePage(res.data.page);
      setCourseTotalPages(res.data.totalPages);
    }).catch(() => {});
  };
  const fetchCategories = () => api.get('/admin/categories').then(res => setCategories(res.data.categories)).catch(() => {});
  const fetchInstructorRevenue = () => api.get('/admin/revenue/instructors').then(res => setInstructorsRevenue(res.data.instructors)).catch(() => {});
  const fetchPendingInstructors = () => api.get('/admin/instructors/pending').then(res => setPendingInstructors(res.data.instructors)).catch(() => {});
  const fetchLogs = (page = 1) => {
    api.get(`/admin/logs?page=${page}&limit=10`).then(res => {
      setActivityLogs(res.data.logs);
      setLogPage(res.data.page);
      setLogTotalPages(res.data.totalPages);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchCourses();
    fetchCategories();
    fetchInstructorRevenue();
    fetchPendingInstructors();
    fetchLogs();
  }, []);

  const approveInstructor = async (userId) => {
    await api.patch(`/admin/users/${userId}/approve`);
    addNotification('مدرس تأیید شد', 'success');
    fetchPendingInstructors();
    fetchUsers();
  };

  const sendGlobalNotification = async () => {
    if (!globalNotifMsg.trim()) return;
    await api.post('/admin/notifications/global', { message: globalNotifMsg });
    addNotification('اعلان سراسری ارسال شد', 'success');
    setGlobalNotifMsg('');
  };

  const changeRole = async (userId, role) => {
    await api.patch(`/admin/users/${userId}/role`, { role });
    fetchUsers();
  };
  const toggleActive = async (userId) => {
    await api.patch(`/admin/users/${userId}/toggle-active`);
    fetchUsers();
  };
  const deleteUser = async (userId) => {
    if (!confirm('حذف شود؟')) return;
    await api.delete(`/admin/users/${userId}`);
    fetchUsers();
  };
  const addCategory = async (e) => {
    e.preventDefault();
    await api.post('/admin/categories', newCat);
    setNewCat({ name: '', slug: '', description: '' });
    fetchCategories();
  };
  const startEditCat = (cat) => setEditingCat(cat);
  const saveEditCat = async (e) => {
    e.preventDefault();
    await api.put(`/admin/categories/${editingCat.id}`, editingCat);
    setEditingCat(null);
    fetchCategories();
  };
  const deleteCategory = async (id) => {
    if (!confirm('حذف دسته؟')) return;
    await api.delete(`/admin/categories/${id}`);
    fetchCategories();
  };

  const renderPagination = (page, totalPages, onPageChange) => (
    <div className="flex gap-2 mt-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-2 py-1 border rounded ${p === page ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}
        >
          {p}
        </button>
      ))}
    </div>
  );

  const maxStat = Math.max(stats.totalUsers || 0, stats.totalCourses || 0, stats.totalEnrollments || 0, stats.totalRevenue || 1);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {['overview', 'users', 'instructors', 'courses', 'logs', 'notifications'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
            {t === 'overview' && 'نمای کلی'}
            {t === 'users' && 'کاربران'}
            {t === 'instructors' && 'مدرسان'}
            {t === 'courses' && 'دوره‌ها'}
            {t === 'logs' && 'لاگ‌ها'}
            {t === 'notifications' && 'اعلان‌ها'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-gray-500">کاربران</div>
              <div className="w-full bg-gray-200 h-2 mt-2 rounded"><div className="bg-blue-500 h-2 rounded" style={{width: `${(stats.totalUsers/maxStat)*100}%`}}></div></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <div className="text-sm text-gray-500">دوره‌ها</div>
              <div className="w-full bg-gray-200 h-2 mt-2 rounded"><div className="bg-green-500 h-2 rounded" style={{width: `${(stats.totalCourses/maxStat)*100}%`}}></div></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <div className="text-sm text-gray-500">ثبت‌نام‌ها</div>
              <div className="w-full bg-gray-200 h-2 mt-2 rounded"><div className="bg-yellow-500 h-2 rounded" style={{width: `${(stats.totalEnrollments/maxStat)*100}%`}}></div></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
              <div className="text-2xl font-bold">{stats.totalRevenue}</div>
              <div className="text-sm text-gray-500">درآمد</div>
              <div className="w-full bg-gray-200 h-2 mt-2 rounded"><div className="bg-red-500 h-2 rounded" style={{width: `${(stats.totalRevenue/maxStat)*100}%`}}></div></div>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2">گزارش درآمد مدرسان</h3>
          <table className="w-full text-sm border">
            <thead><tr><th>مدرس</th><th>درآمد</th><th>تعداد ثبت‌نام</th></tr></thead>
            <tbody>
              {instructorsRevenue.map(inst => (
                <tr key={inst.id}><td>{inst.fullName}</td><td>{inst.revenue}</td><td>{inst.enrollments}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div>
          <h3 className="text-xl font-bold mb-2">کاربران</h3>
          <table className="w-full text-sm border">
            <thead><tr><th>ایمیل</th><th>نام</th><th>نقش</th><th>وضعیت</th><th>عملیات</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.email}</td><td>{u.fullName}</td>
                  <td>
                    <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} className="p-1 rounded dark:bg-gray-700">
                      <option value="STUDENT">دانشجو</option>
                      <option value="INSTRUCTOR">مدرس</option>
                      <option value="ADMIN">مدیر</option>
                    </select>
                  </td>
                  <td>{u.isActive ? 'فعال' : 'غیرفعال'}</td>
                  <td>
                    <button onClick={() => toggleActive(u.id)} className="text-yellow-500 mr-1">{u.isActive ? 'غیرفعال' : 'فعال'}</button>
                    <button onClick={() => deleteUser(u.id)} className="text-red-500">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {renderPagination(userPage, userTotalPages, fetchUsers)}
        </div>
      )}

      {tab === 'instructors' && (
        <div>
          <h3 className="text-xl font-bold mb-2">مدرسان در انتظار تأیید</h3>
          {pendingInstructors.length === 0 ? <p>همه تأیید شده‌اند.</p> :
            <ul className="space-y-2">
              {pendingInstructors.map(inst => (
                <li key={inst.id} className="flex justify-between bg-white dark:bg-gray-800 p-2 rounded">
                  <span>{inst.fullName} ({inst.email})</span>
                  <button onClick={() => approveInstructor(inst.id)} className="bg-green-600 text-white px-3 py-1 rounded">تأیید</button>
                </li>
              ))}
            </ul>
          }
        </div>
      )}

      {tab === 'courses' && (
        <div>
          <h3 className="text-xl font-bold mb-2">دوره‌ها</h3>
          <div className="grid grid-cols-1 gap-2">
            {courses.map(c => (
              <div key={c.id} className="bg-white dark:bg-gray-800 p-2 rounded flex justify-between">
                <span>{c.title}</span>
                <span>{c.instructorName || 'نامشخص'}</span>
              </div>
            ))}
          </div>
          {renderPagination(coursePage, courseTotalPages, fetchCourses)}
          <h3 className="text-xl font-bold mt-4 mb-2">دسته‌بندی‌ها</h3>
          <form onSubmit={editingCat ? saveEditCat : addCategory} className="flex gap-2 mb-2">
            <input placeholder="نام" value={editingCat ? editingCat.name : newCat.name} onChange={e => editingCat ? setEditingCat({...editingCat, name: e.target.value}) : setNewCat({...newCat, name: e.target.value})} className="p-1 border rounded" required />
            <input placeholder="slug" value={editingCat ? editingCat.slug : newCat.slug} onChange={e => editingCat ? setEditingCat({...editingCat, slug: e.target.value}) : setNewCat({...newCat, slug: e.target.value})} className="p-1 border rounded" required />
            <input placeholder="توضیحات" value={editingCat ? editingCat.description : newCat.description} onChange={e => editingCat ? setEditingCat({...editingCat, description: e.target.value}) : setNewCat({...newCat, description: e.target.value})} className="p-1 border rounded" />
            <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">{editingCat ? 'ذخیره' : 'افزودن'}</button>
            {editingCat && <button onClick={() => setEditingCat(null)} className="bg-gray-500 text-white px-3 py-1 rounded">لغو</button>}
          </form>
          <ul>
            {categories.map(c => (
              <li key={c.id} className="flex justify-between">
                <span>{c.name} ({c.slug})</span>
                <div className="flex gap-2">
                  <button onClick={() => startEditCat(c)} className="text-blue-500">ویرایش</button>
                  <button onClick={() => deleteCategory(c.id)} className="text-red-500">حذف</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'logs' && (
        <div>
          <h3 className="text-xl font-bold mb-2">لاگ فعالیت‌ها</h3>
          <ul className="space-y-1">
            {activityLogs.map(log => (
              <li key={log.id} className="text-sm border-b p-1">
                <span className="text-gray-500">{new Date(log.createdAt).toLocaleString('fa-IR')}</span> - {log.userName || 'مدیر'}: {log.action}
                {log.details && <span className="text-xs text-gray-400"> ({JSON.stringify(log.details)})</span>}
              </li>
            ))}
          </ul>
          {renderPagination(logPage, logTotalPages, fetchLogs)}
        </div>
      )}

      {tab === 'notifications' && (
        <div>
          <h3 className="text-xl font-bold mb-2">ارسال اعلان سراسری</h3>
          <textarea value={globalNotifMsg} onChange={e => setGlobalNotifMsg(e.target.value)} rows={3} className="w-full p-2 border rounded dark:bg-gray-700" placeholder="متن اعلان..."></textarea>
          <button onClick={sendGlobalNotification} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">ارسال به همه</button>
        </div>
      )}
    </div>
  );
}
