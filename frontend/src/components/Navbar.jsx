import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import {
  Menu,
  X,
  LogOut,
  User,
  ClipboardList,
  NotebookTabs,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/user/me");
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    if (token) fetchUser();
  }, [token, navigate]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) =>
      menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    const handleEsc = (e) => e.key === "Escape" && setMenuOpen(false);

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    setLogoutConfirm(false);
  };

  const NavLink = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        location.pathname === to
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
          : "text-gray-300 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <>
      {/* DESKTOP NAV */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-[#2f3136]/90 backdrop-blur-md border-b border-white/10 z-50 items-center px-8 justify-between shadow-lg">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <NotebookTabs className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Notes Board</h2>
            <p className="text-xs text-gray-400">Your personal workspace</p>
          </div>
        </div>

        {/* Nav Links + User */}
        <div className="flex items-center gap-5">
          {token && <NavLink to="/notes" icon={ClipboardList} label="Board" />}
          {!token ? (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm font-medium text-white truncate max-w-[8rem] hidden lg:block">
                  {user?.username || "User"}
                </span>
                {menuOpen ? <X size={14} /> : <Menu size={14} />}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#2a2a2a]/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-fadeIn">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <div className="py-2 flex flex-col">
                    <NavLink to="/profile" icon={User} label="Profile" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setLogoutConfirm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all rounded-lg"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMenuOpen((s) => !s)}
          className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-indigo-500/40 transition-all active:scale-95"
        >
          {menuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
        </button>

        {menuOpen && (
          <div className="absolute bottom-20 right-0 w-64 bg-[#2a2a2a]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl animate-fadeIn p-3">
            {token ? (
              <>
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user?.username}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <NavLink to="/notes" icon={ClipboardList} label="Board" />
                <NavLink to="/profile" icon={User} label="Profile" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setLogoutConfirm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all rounded-lg w-full"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center px-4 py-3 text-white bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LOGOUT MODAL */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-[#2a2a2a]/95 rounded-2xl p-8 max-w-sm w-full border border-white/10 shadow-2xl animate-slideUp text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <LogOut size={28} className="text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Logout</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setLogoutConfirm(false)}
                className="flex-1 py-3 border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30"
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
