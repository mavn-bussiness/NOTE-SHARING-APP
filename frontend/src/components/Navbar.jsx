import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('token');
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/user/me');
        setUser(res.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    if (isLoggedIn) {
      fetchUser();
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }

    function handleKey(e) {
      if (e.key === 'Escape') setShowMenu(false);
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showMenu]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Desktop Top Bar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-[#2f3136] border-b border-white/10 z-50 items-center px-8 justify-between shadow-lg" aria-label="Main navigation">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V7h14v12zm-2-7H7v-2h10v2z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Notes Board</h2>
            <p className="text-xs text-gray-400">Your personal workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isLoggedIn && (
            <Link
              to="/notes"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                location.pathname === '/notes' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
              Board
            </Link>
          )}

          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-600/30"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((s) => !s)}
                aria-haspopup="true"
                aria-expanded={showMenu}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-white hidden lg:block truncate max-w-[10rem]">
                  {user?.username || 'User'}
                </span>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className={`text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`}
                >
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>

              {showMenu && (
                <div
                  role="menu"
                  aria-label="User menu"
                  className="absolute right-0 mt-3 w-56 bg-[#2a2a2a] rounded-xl shadow-2xl border border-white/10 py-2 animate-fadeIn overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link 
                      to="/profile" 
                      role="menuitem" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowLogoutConfirm(true);
                      }}
                      role="menuitem"
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Floating FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <div className="flex flex-col items-end gap-3" ref={menuRef}>
          {showMenu && (
            <div className="mb-2 w-64 bg-[#2a2a2a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-white">Menu</p>
                )}
              </div>
              
              <div className="p-2">
                {isLoggedIn ? (
                  <>
                    <Link 
                      to="/notes" 
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                      </svg>
                      Board
                    </Link>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Profile
                    </Link>
                    <button 
                      onClick={() => {
                        setShowMenu(false);
                        setShowLogoutConfirm(true);
                      }} 
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      to="/login" 
                      className="block px-4 py-3 text-center text-white hover:bg-white/5 rounded-lg transition-colors font-medium"
                      onClick={() => setShowMenu(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="block px-4 py-3 text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white hover:from-indigo-700 hover:to-purple-700 transition-all font-medium"
                      onClick={() => setShowMenu(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowMenu((s) => !s)}
            aria-label="Open quick menu"
            className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-indigo-500/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-95"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className={`text-white transition-transform ${showMenu ? 'rotate-90' : ''}`}
            >
              {showMenu ? (
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              ) : (
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#2a2a2a] rounded-2xl p-8 max-w-sm w-full border border-white/10 shadow-2xl animate-slideUp">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Logout</h3>
              <p className="text-gray-400">Are you sure you want to logout?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-5 py-3 bg-transparent border border-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/5 hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-red-600/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}