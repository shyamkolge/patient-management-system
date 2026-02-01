import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { formatName } from '../../utils/format.js';
import { FaUserCircle, FaSignOutAlt, FaUser, FaBars, FaBell, FaChevronDown } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { useSocketContext } from '../../context/SocketContext.jsx';
import { toast } from 'react-toastify';
import { api } from '../../services/api.js';
// Import sound if available or use a URL, for now just toast

export const Topbar = ({ title, subtitle, action, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const { socket } = useSocketContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initial fetch of notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.success) {
          setNotifications(res.data);
          const unread = res.data.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('newNotification', (notification) => {
      // Play sound if desired
      // const audio = new Audio('/sound.mp3'); 
      // audio.play();

      toast.info(notification.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off('newNotification');
    };
  }, [socket]);

  const getInitials = (user) => {
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  const handleNotificationClick = async () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen && unreadCount > 0) {
      try {
        // Optional: Mark all as read when opening?
        // For now, we just reset the local badge to avoid annoyance, 
        // but strictly we should call the API.
        // await api.put('/notifications/read-all');
        // setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        // setUnreadCount(0);
      } catch (error) {
        // ignore
      }
    }
  };

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-4 py-2 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="mr-2 rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
        >
          <FaBars className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {action && (
          <div className="flex items-center">
            {action}
          </div>
        )}
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
            onClick={handleNotificationClick}
          >
            <FaBell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-slate-800">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl border border-slate-700 bg-slate-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No notifications
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-700/50">
                    {notifications.map((notif) => (
                      <li
                        key={notif._id}
                        className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-white/5' : ''}`}
                        onClick={async () => {
                          if (!notif.read) {
                            try {
                              await api.put(`/notifications/${notif._id}/read`);
                              setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
                              setUnreadCount(prev => Math.max(0, prev - 1));
                            } catch (e) {
                              console.error("Failed to mark as read");
                            }
                          }

                          if (notif.link) {     
                            navigate(notif.link);
                            setIsNotifOpen(false);
                          }
                        }}
                      >
                        <p className="text-sm text-slate-200">{notif.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 rounded-full md:rounded-lg p-1 md:px-3 md:py-2 hover:bg-white/10 transition-colors border border-transparent hover:border-slate-700"
          >
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-primary flex items-center justify-center text-white font-bold border border-slate-600">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span>{getInitials(user)}</span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-white leading-tight">{formatName(user)}</p>
              <p className="text-xs text-slate-300 capitalize">{user?.role}</p>
            </div>
            <FaChevronDown className={`hidden md:block w-3 h-3 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl border border-slate-700 bg-slate-800 p-1 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-700 mb-1 md:hidden">
                <p className="text-sm font-bold text-white">{formatName(user)}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaUser className="w-4 h-4" />
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
