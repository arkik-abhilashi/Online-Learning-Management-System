import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  FiSun, FiMoon, FiLogOut, FiUser, FiHeart,
  FiShoppingCart, FiMessageCircle, FiBookOpen,
  FiMenu, FiX, FiChevronDown
} from 'react-icons/fi';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, isAuth, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [studentMenuOpen, setStudentMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            <FiBookOpen className="w-7 h-7" />
            <span className="hidden sm:inline">LMS</span>
          </Link>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-xl transition-colors">
              {dark ? <FiSun /> : <FiMoon />}
            </button>

            {isAuth && <NotificationBell />}

            {user ? (
              <>
                {/* Student specific links */}
                {user.role === 'STUDENT' && (
                  <div className="relative">
                    <button
                      onClick={() => setStudentMenuOpen(!studentMenuOpen)}
                      className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      ابزارها <FiChevronDown className="w-4 h-4" />
                    </button>
                    {studentMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setStudentMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 py-2">
                          <Link to="/wishlist" onClick={() => setStudentMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <FiHeart className="w-4 h-4" /> علاقه‌مندی‌ها
                          </Link>
                          <Link to="/cart" onClick={() => setStudentMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <FiShoppingCart className="w-4 h-4" /> سبد خرید
                          </Link>
                          <Link to="/messages" onClick={() => setStudentMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <FiMessageCircle className="w-4 h-4" /> پیام‌ها
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* User info */}
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <FiUser className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{user.fullName}</span>
                  <span className="text-xs text-gray-400">({user.role})</span>
                </span>

                <button onClick={handleLogout} className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <FiLogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">ورود</Link>
                <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors">ثبت‌نام</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 pt-4 pb-3 space-y-3">
            <button onClick={() => { toggle(); closeMenu(); }} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              {dark ? <FiSun /> : <FiMoon />} تغییر تم
            </button>

            {isAuth && <div className="px-3 py-1"><NotificationBell /></div>}

            {user ? (
              <>
                <div className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.fullName} ({user.role})
                </div>

                {user.role === 'STUDENT' && (
                  <>
                    <Link to="/wishlist" onClick={closeMenu} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FiHeart /> علاقه‌مندی‌ها
                    </Link>
                    <Link to="/cart" onClick={closeMenu} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FiShoppingCart /> سبد خرید
                    </Link>
                    <Link to="/messages" onClick={closeMenu} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FiMessageCircle /> پیام‌ها
                    </Link>
                  </>
                )}

                <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <FiLogOut /> خروج
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-3">
                <Link to="/login" onClick={closeMenu} className="text-center py-2 rounded-lg border border-gray-300 dark:border-gray-600">ورود</Link>
                <Link to="/register" onClick={closeMenu} className="text-center py-2 rounded-lg bg-blue-600 text-white">ثبت‌نام</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
