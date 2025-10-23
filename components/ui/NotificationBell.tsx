import React, { useState, useMemo } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../../types';

const timeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};


interface NotificationBellProps {
  userId: string;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId, notifications, setNotifications }) => {
  const [isOpen, setIsOpen] = useState(false);

  const userNotifications = useMemo(() => 
    notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  , [notifications, userId]);
  
  const unreadCount = useMemo(() => 
    userNotifications.filter(n => !n.read).length
  , [userNotifications]);

  const handleToggleRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: !n.read } : n));
  };
  
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  };
  
  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} onBlur={() => setTimeout(() => setIsOpen(false), 200)} className="relative p-2 rounded-full text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors">
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl shadow-lg z-20 bg-slate-800/80 backdrop-blur-lg border border-slate-700"
          >
            <div className="flex justify-between items-center p-3 border-b border-slate-700">
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center">
                        <CheckCheck className="h-4 w-4 mr-1"/>
                        Mark all as read
                    </button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {userNotifications.length > 0 ? (
                userNotifications.map(notification => (
                  <div key={notification.id} className={`flex items-start p-3 border-b border-slate-700/50 transition-colors ${notification.read ? 'opacity-60' : 'bg-indigo-500/10'}`}>
                    <div className="flex-grow">
                        <p className="text-sm text-slate-200">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{timeAgo(notification.timestamp)}</p>
                    </div>
                    <div className="flex items-center ml-2">
                        <button onClick={() => handleToggleRead(notification.id)} className="p-1 rounded-full text-slate-400 hover:text-white" title={notification.read ? 'Mark as unread' : 'Mark as read'}>
                            <Check className="h-4 w-4"/>
                        </button>
                        <button onClick={() => handleDeleteNotification(notification.id)} className="p-1 rounded-full text-slate-400 hover:text-red-400" title="Delete notification">
                            <X className="h-4 w-4"/>
                        </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 p-8">You have no notifications.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;