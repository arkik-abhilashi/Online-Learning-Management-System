import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LearnCourse from './pages/LearnCourse';
import QuizPage from './pages/QuizPage';
import Certificates from './pages/Certificates';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ManageSessions from './pages/ManageSessions';
import ManageQuizzes from './pages/ManageQuizzes';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import InstructorDashboard from './pages/Dashboard/InstructorDashboard';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import PendingApproval from './pages/PendingApproval';
import CourseStudents from './pages/Instructor/CourseStudents';
import StudentDetail from './pages/Instructor/StudentDetail';
import QuizStats from './pages/Instructor/QuizStats';
import StudentMessages from './pages/StudentMessages';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/pending-approval" element={<PendingApproval />} />
                <Route path="/checkout/:courseId" element={<PrivateRoute roles={['STUDENT']}><Checkout /></PrivateRoute>} />

                {/* Student */}
                <Route element={<PrivateRoute roles={['STUDENT']} />}>
                  <Route path="/dashboard/student" element={<StudentDashboard />} />
                  <Route path="/learn/:courseId" element={<LearnCourse />} />
                  <Route path="/quiz/:sessionId" element={<QuizPage />} />
                  <Route path="/certificates" element={<Certificates />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/messages" element={<StudentMessages />} />
                </Route>

                {/* Instructor */}
                <Route element={<PrivateRoute roles={['INSTRUCTOR']} />}>
                  <Route path="/dashboard/instructor" element={<InstructorDashboard />} />
                  <Route path="/manage/course/:courseId/sessions" element={<ManageSessions />} />
                  <Route path="/manage/session/:sessionId/quizzes" element={<ManageQuizzes />} />
                  <Route path="/instructor/course/:courseId/students" element={<CourseStudents />} />
                  <Route path="/instructor/course/:courseId/student/:studentId" element={<StudentDetail />} />
                  <Route path="/instructor/quiz-stats" element={<QuizStats />} />
                </Route>

                {/* Admin */}
                <Route element={<PrivateRoute roles={['ADMIN']} />}>
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
