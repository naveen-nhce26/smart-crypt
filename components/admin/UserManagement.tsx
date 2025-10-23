import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, UserStatus } from '../../types';
import { Trash2, Ban, CheckCircle2, PauseCircle, PlayCircle, UserPlus, Users, BarChart3 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatCard from '../ui/StatCard';

export const initialUsers: User[] = [];

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center";
    const statusClasses = {
        [UserStatus.ACTIVE]: "bg-green-500/10 text-green-300 ring-1 ring-inset ring-green-500/20",
        [UserStatus.BLOCKED]: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/20",
        [UserStatus.SUSPENDED]: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
}

interface UserManagementProps {
  currentUser: User;
  users: User[];
  onUpdateUserStatus: (id: string, newStatus: UserStatus) => void;
  onDeleteUser: (id: string) => void;
  onAddUserClick: () => void;
  logCount: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, users, onUpdateUserStatus, onDeleteUser, onAddUserClick, logCount }) => {
  const canDeleteUsers = currentUser.role === UserRole.ADMIN;
  const canBlockUsers = currentUser.role === UserRole.ADMIN;
  const canSuspendUsers = [UserRole.ADMIN, UserRole.LEVEL1, UserRole.LEVEL2].includes(currentUser.role);
  
  return (
    <>
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
          <StatCard icon={<Users className="h-6 w-6 text-indigo-400" />} label="Total Users" value={users.length} />
          <StatCard icon={<BarChart3 className="h-6 w-6 text-amber-400" />} label="Log Events" value={logCount} />
      </motion.div>
      <Card>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white">All Users</h2>
          <Button onClick={onAddUserClick} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2"/>
            Add New User
          </Button>
        </div>
         <div className="overflow-hidden ring-1 ring-slate-800 rounded-lg">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-900/60">
                      <tr className="border-b border-slate-800">
                          <th className="px-6 py-4 font-semibold text-slate-300">UserID</th>
                          <th className="px-6 py-4 font-semibold text-slate-300">Username</th>
                          <th className="px-6 py-4 font-semibold text-slate-300">Department</th>
                          <th className="px-6 py-4 font-semibold text-slate-300">Organization</th>
                          <th className="px-6 py-4 font-semibold text-slate-300">Role</th>
                          <th className="px-6 py-4 font-semibold text-slate-300">Attributes</th>
                          <th className="px-6 py-4 font-semibold text-slate-300">Status</th>
                          <th className="px-6 py-4 font-semibold text-slate-300 text-right">Actions</th>
                      </tr>
                  </thead>
                  <AnimatePresence>
                      <tbody>
                      {users.filter(u => u.role !== UserRole.ADMIN).map((user, index) => (
                          <motion.tr 
                              key={user.id}
                              layout
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -50 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-slate-800 last:border-b-0 hover:bg-slate-800/40 transition-colors"
                          >
                              <td className="px-6 py-4 font-mono text-sm text-slate-400">{user.id}</td>
                              <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                              <td className="px-6 py-4 text-slate-400">{user.department || 'N/A'}</td>
                              <td className="px-6 py-4 text-slate-400">{user.organization || 'N/A'}</td>
                              <td className="px-6 py-4 text-slate-300">{user.roleName}</td>
                              <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                      {user.attributes?.map(attr => (
                                          <span key={attr} className="bg-slate-700 text-slate-300 text-xs font-medium px-2 py-0.5 rounded-full">{attr}</span>
                                      ))}
                                  </div>
                              </td>
                              <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                              <td className="px-6 py-4">
                                  <div className="flex justify-end items-center space-x-2">
                                      {canBlockUsers && (user.status === UserStatus.BLOCKED ? (
                                          <button onClick={() => onUpdateUserStatus(user.id, UserStatus.ACTIVE)} className="p-1 text-slate-400 hover:text-green-400 transition-colors" title="Unblock"><CheckCircle2 size={18}/></button>
                                      ) : (
                                          <button onClick={() => onUpdateUserStatus(user.id, UserStatus.BLOCKED)} className="p-1 text-slate-400 hover:text-red-400 transition-colors" title="Block"><Ban size={18}/></button>
                                      ))}
                                      {canSuspendUsers && (user.status === UserStatus.SUSPENDED ? (
                                          <button onClick={() => onUpdateUserStatus(user.id, UserStatus.ACTIVE)} className="p-1 text-slate-400 hover:text-green-400 transition-colors" title="Unsuspend"><PlayCircle size={18}/></button>
                                      ) : (
                                          <button onClick={() => onUpdateUserStatus(user.id, UserStatus.SUSPENDED)} className="p-1 text-slate-400 hover:text-yellow-400 transition-colors" title="Suspend"><PauseCircle size={18}/></button>
                                      ))}
                                      {canDeleteUsers && (
                                          <button onClick={() => onDeleteUser(user.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={18}/></button>
                                      )}
                                  </div>
                              </td>
                          </motion.tr>
                      ))}
                      </tbody>
                  </AnimatePresence>
              </table>
              {users.filter(u => u.role !== UserRole.ADMIN).length === 0 && (
                  <p className="text-center text-slate-500 p-8">No users found.</p>
              )}
          </div>
        </div>
      </Card>
    </>
  );
};

export default UserManagement;