
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types';
import { LayoutDashboard, Users, Clock3, LogOut, X, UserCircle, Shield } from 'lucide-react';
import Button from '../ui/Button';

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  user: User;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: 'dashboard' | 'users' | 'activity') => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
        : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-3 font-medium">{label}</span>
  </button>
);

const SidebarContent: React.FC<Omit<AdminSidebarProps, 'isMobileOpen' | 'onMobileClose'>> = ({ user, onLogout, activeView, setActiveView }) => {
  const handleNavClick = (view: 'dashboard' | 'users' | 'activity') => {
    setActiveView(view);
  };
  
  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-indigo-400"/>
            <h1 className="text-2xl font-bold text-white">SmartCrypt</h1>
        </div>
      </div>
      
      <nav className="flex-grow p-4 space-y-2">
        <NavLink 
          icon={<LayoutDashboard className="h-5 w-5"/>} 
          label="Dashboard" 
          isActive={activeView === 'dashboard'}
          onClick={() => handleNavClick('dashboard')}
        />
        <NavLink 
          icon={<Users className="h-5 w-5"/>} 
          label="User Management" 
          isActive={activeView === 'users'}
          onClick={() => handleNavClick('users')}
        />
        <NavLink 
          icon={<Clock3 className="h-5 w-5"/>} 
          label="Activity Log" 
          isActive={activeView === 'activity'}
          onClick={() => handleNavClick('activity')}
        />
      </nav>

      <div className="p-4 border-t border-slate-800">
          <Button onClick={onLogout} variant="secondary" className="w-full">
              <LogOut className="h-4 w-4 mr-2"/>
              Logout
          </Button>
      </div>
    </>
  );
}


const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen, onMobileClose, ...props }) => {
  
  const handleNavClick = (view: 'dashboard' | 'users' | 'activity') => {
    props.setActiveView(view);
    onMobileClose();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900/80 border-r border-slate-800 flex-shrink-0">
        <SidebarContent {...props} setActiveView={handleNavClick} />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-full max-w-xs bg-slate-900 shadow-2xl z-[70] flex flex-col lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={onMobileClose}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <SidebarContent {...props} setActiveView={handleNavClick} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;