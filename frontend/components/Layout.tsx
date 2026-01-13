
import React, { useState, useRef, useEffect } from 'react';
import { User, Notification } from '../types';
import ProfileModal from './ProfileModal';
import Logo from './Logo';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  user: User | null;
  unreadCount: number;
  notifications: Notification[];
  onLogout: () => void;
  onMarkRead: () => void;
  onUpdateProfile: (updatedUser: Partial<User>) => void;
  onNavigate?: (view: 'LOGIN' | 'REGISTER') => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  user,
  unreadCount,
  notifications,
  onLogout,
  onMarkRead,
  onUpdateProfile,
  onNavigate,
  children
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifs = () => {
    if (!showNotifDropdown && unreadCount > 0) {
      onMarkRead();
    }
    setShowNotifDropdown(!showNotifDropdown);
    setShowUserDropdown(false);
  };

  const handleToggleUserMenu = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowNotifDropdown(false);
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-pointer">
              <Logo className="h-10 w-10 transition-transform group-hover:scale-110" />
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Paperly</span>
            </div>

            {user && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Live Cloud Sync</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {!user && (
              <div className="flex items-center gap-8">
                <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                  <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
                  <a href="#writers" className="hover:text-indigo-600 transition-colors">Writers</a>
                  <a href="#reviews" className="hover:text-indigo-600 transition-colors">Reviews</a>
                  <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
                </nav>
                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                  <button
                    onClick={() => onNavigate?.('LOGIN')}
                    className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => onNavigate?.('REGISTER')}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            )}

            {user && (
              <>
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    onClick={handleToggleNotifs}
                    className="relative cursor-pointer p-2 hover:bg-slate-50 rounded-full transition-colors group"
                  >
                    <svg className={`w-6 h-6 ${showNotifDropdown ? 'text-indigo-600' : 'text-slate-600'} group-hover:text-indigo-600 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                          {notifications.length} Total
                        </span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                            <p className="text-xs text-slate-400 font-medium">No notifications yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {notifications.map((n) => (
                              <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
                                <div className="flex-1">
                                  <p className="text-xs text-slate-700 leading-normal">{n.message}</p>
                                  <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatTime(n.timestamp)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={handleToggleUserMenu}
                    className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                  >
                    <div className="hidden md:flex flex-col items-end px-2">
                      <span className="text-sm font-bold text-slate-700 leading-tight">{user.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{user.role}</span>
                    </div>
                    <img src={user.avatar} className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100 shadow-sm" alt="Avatar" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b bg-slate-50 flex items-center gap-3">
                        <img src={user.avatar} className="w-10 h-10 rounded-full border border-white shadow-sm" alt="" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { setShowProfileModal(true); setShowUserDropdown(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile Settings
                        </button>
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>



      <main className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {children}
      </main>

      <Toaster position="top-right" />

      <footer className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 py-8 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
          <p>© 2024 Paperly. Digitalizing academic assistance.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

      {
        showProfileModal && user && (
          <ProfileModal
            user={user}
            onClose={() => setShowProfileModal(false)}
            onSave={onUpdateProfile}
          />
        )
      }
    </div >
  );
};

export default Layout;
