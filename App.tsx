
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from './views/LoginPage';
import AdminDashboard from './views/AdminDashboard';
import UserDashboard from './views/UserDashboard';
import { ToastProvider } from './components/ui/Toast';
import { User, UserRole, FileItem, Notification, ActivityLog, ActivityType } from './types';

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const addNotification = (userId: string, message: string) => {
    if (userId === 'admins') {
      const adminUsers = users.filter(u => u.role === UserRole.ADMIN);
      const newNotifications: Notification[] = adminUsers.map(admin => ({
        id: `notif-${Date.now()}-${admin.id}`,
        userId: admin.id,
        message,
        timestamp: new Date().toISOString(),
        read: false,
      }));
      setNotifications(prev => [...newNotifications, ...prev]);
    } else {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        userId,
        message,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  const addActivityLog = (username: string, actionType: ActivityType) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      username,
      actionType,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const attemptLogin = (credentials: { username: string; password?: string; role: UserRole }): User | null => {
    const foundUser = users.find(u => 
        u.role === credentials.role && 
        u.username.toLowerCase() === credentials.username.toLowerCase()
    );

    const successfulLogin = (user: User) => {
        setLoggedInUser(user);
        addActivityLog(user.username, ActivityType.LOGIN);
        return user;
    }

    if (foundUser && foundUser.password === credentials.password) {
      return successfulLogin(foundUser);
    }
    
    // Legacy support for original user login that didn't check passwords if no password is set on the user
    if(foundUser && !foundUser.password && credentials.role !== UserRole.ADMIN){
       return successfulLogin(foundUser);
    }

    return null;
  };

  const registerAdmin = (newUser: User): boolean => {
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      return false; // User already exists
    }
    setUsers(prev => [newUser, ...prev]);
    return true;
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const renderDashboard = () => {
    if (!loggedInUser) return null;

    const dashboardProps = {
      user: loggedInUser,
      onLogout: handleLogout,
      files,
      setFiles,
      notifications,
      setNotifications,
      addNotification,
      addActivityLog,
    };

    if (loggedInUser.role === UserRole.ADMIN) {
      return <AdminDashboard {...dashboardProps} users={users} setUsers={setUsers} activityLogs={activityLogs} />;
    }
    return <UserDashboard {...dashboardProps} allUsers={users} />;
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-transparent flex">
        <AnimatePresence mode="wait">
          {loggedInUser ? (
            <motion.div
              key={loggedInUser.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderDashboard()}
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
               className="w-full"
            >
              <LoginPage onAttemptLogin={attemptLogin} onAdminRegister={registerAdmin} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastProvider>
  );
};

export default App;