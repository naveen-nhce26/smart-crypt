
import React, { useState } from 'react';
import { LogOut, UserCircle, File, Share2, Download, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import FileManagement from '../components/admin/FileManagement';
import Button from '../components/ui/Button';
import { User, FileItem, Notification, ActivityType } from '../types';
import NotificationBell from '../components/ui/NotificationBell';
import StatCard from '../components/ui/StatCard';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  allUsers: User[];
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (userId: string, message: string) => void;
  addActivityLog: (username: string, actionType: ActivityType) => void;
}

// ABE policy evaluation logic, must be consistent with FileManagement
const evaluateABEPolicy = (userAttributes: string[] = [], file: FileItem): boolean => {
    const policy = file.accessPolicy || '';
    const policyMode = file.accessPolicyMode || 'AND';

    if (!policy.trim()) {
        return false;
    }

    // Policy is now just values: "s1, ds, hod"
    const requiredValues = policy.split(',')
                                 .map(val => val.trim().toLowerCase())
                                 .filter(val => val.length > 0);

    if (requiredValues.length === 0) {
        return false;
    }

    // User attributes are "key:value": ["userID:s1", "department:ds"]
    // Extract just the values and normalize them.
    const userValues = userAttributes.map(attr => {
        const parts = attr.split(':');
        return parts.length > 1 ? parts[1].trim().toLowerCase() : '';
    }).filter(Boolean); // Filter out empty strings
    
    const userValuesSet = new Set(userValues);

    if (policyMode === 'OR') {
        // Flexible: User must have at least ONE of the required attribute values
        return requiredValues.some(requiredVal => userValuesSet.has(requiredVal));
    } else { // 'AND'
        // Strict: User must have ALL of the required attribute values
        return requiredValues.every(requiredVal => userValuesSet.has(requiredVal));
    }
};

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout, allUsers, files, setFiles, notifications, setNotifications, addNotification, addActivityLog }) => {
  const myFilesCount = files.filter(f => f.uploaderId === user.id).length;
  const encryptedFilesCount = files.filter(f => f.uploaderId === user.id && f.isEncrypted).length;
  
  const receivedFilesCount = files.filter(f => 
    f.sharedWith?.includes(user.id) || (f.encryptionType === 'abe' && evaluateABEPolicy(user.attributes, f))
  ).length;
  
  const downloadedFilesCount = files.filter(f => f.downloadedBy?.includes(user.id)).length;
    
  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <header className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
          <UserCircle className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{user.role} Dashboard</h1>
            <p className="text-sm text-slate-400">Logged in as {user.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
            <NotificationBell userId={user.id} notifications={notifications} setNotifications={setNotifications} />
            <Button onClick={onLogout} variant="secondary" className="w-auto hidden sm:flex">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
              <StatCard icon={<File className="h-6 w-6 text-indigo-400" />} label="My Files" value={myFilesCount} />
              <StatCard icon={<ShieldCheck className="h-6 w-6 text-green-400" />} label="Encrypted Files" value={encryptedFilesCount} />
              <StatCard icon={<Share2 className="h-6 w-6 text-fuchsia-400" />} label="Shared With Me" value={receivedFilesCount} />
              <StatCard icon={<Download className="h-6 w-6 text-amber-400" />} label="My Downloads" value={downloadedFilesCount} />
          </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FileManagement user={user} allUsers={allUsers} files={files} setFiles={setFiles} addNotification={addNotification} addActivityLog={addActivityLog} />
        </motion.div>
      </main>
      
    </div>
  );
};

export default UserDashboard;