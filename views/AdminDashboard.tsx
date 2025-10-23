import React, { useState } from 'react';
import { LogOut, UserCircle, Menu, Users, Files, BarChart3, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserManagement from '../components/admin/UserManagement';
import FileManagement from '../components/admin/FileManagement';
import ActivityLog from '../components/admin/ActivityLog';
import AddUserPanel from '../components/admin/AddUserPanel';
import AdminSidebar from '../components/admin/AdminSidebar';
import { User, UserStatus, ActivityLog as ActivityLogType, FileItem, Notification, ActivityType } from '../types';
import { useToast } from '../hooks/useToast';
import NotificationBell from '../components/ui/NotificationBell';
import StatCard from '../components/ui/StatCard';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (userId: string, message: string) => void;
  activityLogs: ActivityLogType[];
  addActivityLog: (username: string, actionType: ActivityType) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, users, setUsers, files, setFiles, notifications, setNotifications, addNotification, activityLogs, addActivityLog }) => {
  const [isAddUserPanelOpen, setIsAddUserPanelOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'activity'>('dashboard');
  
  const { addToast } = useToast();

  const handleAddUser = (newUser: User) => {
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      addToast('Username is already taken, please try another.', 'error');
      return false;
    }
    if (users.some(u => u.id.toLowerCase() === newUser.id.toLowerCase())) {
        addToast('UserID is already taken, please try another.', 'error');
        return false;
    }
    const userWithOrg = { ...newUser, organization: user.organization };
    setUsers(prev => [userWithOrg, ...prev]);
    addToast('User added successfully!', 'success');
    addNotification(user.id, `You created a new user: ${newUser.username}.`);
    return true;
  };
  
  const handleUpdateUserStatus = (id: string, newStatus: UserStatus) => {
    setUsers(users.map(u => u.id === id ? {...u, status: newStatus} : u));
    addToast(`User status updated to ${newStatus}`, 'info');
  };
  
  const handleDeleteUser = (id: string) => {
      setUsers(users.filter(u => u.id !== id));
      addToast('User deleted.', 'error');
  }
  
  const viewTitles: {[key: string]: string} = {
      dashboard: "File Dashboard",
      users: "User Management",
      activity: "System Activity Log"
  }

  return (
    <div className="flex w-full h-screen bg-slate-900/70">
      <AdminSidebar
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={onLogout}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      <AddUserPanel
        isOpen={isAddUserPanelOpen}
        onClose={() => setIsAddUserPanelOpen(false)}
        onAddUser={handleAddUser}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-slate-800" aria-label="Open menu">
              <Menu className="h-6 w-6 text-white"/>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{viewTitles[activeView]}</h1>
              <p className="text-sm text-slate-400 hidden sm:block">Welcome back, {user.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <NotificationBell userId={user.id} notifications={notifications} setNotifications={setNotifications} />
            <div className="hidden sm:flex items-center space-x-3 pl-4 border-l border-slate-700">
               <UserCircle className="h-8 w-8 text-slate-400" />
               <div className="text-sm">
                 <p className="font-semibold text-white">{user.username}</p>
                 <p className="text-slate-400">{user.roleName}</p>
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeView === 'dashboard' && (
                <>
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                      <StatCard icon={<Files className="h-6 w-6 text-fuchsia-400" />} label="Total Files" value={files.length} />
                      <StatCard icon={<Shield className="h-6 w-6 text-green-400" />} label="Encrypted Files" value={files.filter(f=>f.isEncrypted).length} />
                  </motion.div>
                  <FileManagement user={user} allUsers={users} files={files} setFiles={setFiles} addNotification={addNotification} addActivityLog={addActivityLog} />
                </>
              )}
              {activeView === 'users' && (
                <UserManagement 
                  currentUser={user}
                  users={users}
                  onUpdateUserStatus={handleUpdateUserStatus}
                  onDeleteUser={handleDeleteUser}
                  onAddUserClick={() => setIsAddUserPanelOpen(true)}
                  logCount={activityLogs.length}
                />
              )}
              {activeView === 'activity' && <ActivityLog logs={activityLogs}/>}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;