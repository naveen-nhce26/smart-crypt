import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, UserStatus } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { PlusCircle, X } from 'lucide-react';

interface AddUserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: User) => boolean;
}

const AddUserPanel: React.FC<AddUserPanelProps> = ({ isOpen, onClose, onAddUser }) => {
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: UserRole.LEVEL1,
    roleName: '',
    department: '',
    userID: '',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      setNewUser({
        username: '',
        password: '',
        role: UserRole.LEVEL1,
        roleName: '',
        department: '',
        userID: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formatAttr = (value: string) => value.trim().replace(/\s+/g, '-').toLowerCase();

    const attributes = [];
    if (newUser.role) attributes.push(`level:${formatAttr(newUser.role)}`);
    if (newUser.department) attributes.push(`department:${formatAttr(newUser.department)}`);
    if (newUser.roleName) attributes.push(`roleName:${formatAttr(newUser.roleName)}`);
    if (newUser.userID) attributes.push(`userID:${formatAttr(newUser.userID)}`);
    
    const userToAdd: User = {
      id: newUser.userID.trim(),
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      roleName: newUser.roleName || newUser.role,
      status: UserStatus.ACTIVE,
      attributes: attributes,
      department: newUser.department.trim(),
    };
    
    const success = onAddUser(userToAdd);
    if (success) {
      onClose();
    }
  };

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[75]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900/95 backdrop-blur-lg border-l border-slate-700 shadow-2xl z-[80] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-6 overflow-y-auto">
              <Input
                id="username"
                label="Username"
                placeholder="john.doe"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
                autoFocus
              />
              <Input
                id="userID"
                label="UserID"
                placeholder="e.g., U12345"
                value={newUser.userID}
                onChange={(e) => setNewUser({ ...newUser, userID: e.target.value })}
                required
              />
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">
                  User Level
                </label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full rounded-md border-slate-600 bg-slate-700/50 text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150"
                >
                  {Object.values(UserRole)
                    .filter((r) => r !== UserRole.ADMIN)
                    .map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                </select>
              </div>
              <Input
                id="department"
                label="Department"
                placeholder="e.g., Research, Security"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              />
              <Input
                id="roleName"
                label="Custom Role Name (Optional)"
                placeholder="e.g., Doctor, Researcher"
                value={newUser.roleName}
                onChange={(e) => setNewUser({ ...newUser, roleName: e.target.value })}
              />
              <div className="pt-4">
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add User
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) {
    return null;
  }
  
  const portalRoot = document.getElementById('portal-root');
  return portalRoot ? createPortal(panelContent, portalRoot) : null;
};

export default AddUserPanel;