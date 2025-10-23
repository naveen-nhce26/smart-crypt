
import React from 'react';
import { motion } from 'framer-motion';
import { ActivityLog, ActivityType } from '../../types';
import { Upload, Share2, LogIn } from 'lucide-react';
import Card from '../ui/Card';

const ActivityIcon: React.FC<{type: ActivityType}> = ({type}) => {
    const iconMap = {
        [ActivityType.UPLOAD]: <Upload className="h-5 w-5 text-blue-400"/>,
        [ActivityType.SHARE]: <Share2 className="h-5 w-5 text-purple-400"/>,
        [ActivityType.LOGIN]: <LogIn className="h-5 w-5 text-green-400"/>,
    };
    const colorMap = {
        [ActivityType.UPLOAD]: "bg-blue-500/10",
        [ActivityType.SHARE]: "bg-purple-500/10",
        [ActivityType.LOGIN]: "bg-green-500/10",
    }
    return <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-slate-800/60 ${colorMap[type]}`}>{iconMap[type]}</div>;
}

interface ActivityLogProps {
  logs: ActivityLog[];
}

const ActivityLogComponent: React.FC<ActivityLogProps> = ({ logs }) => {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-white mb-6">Activity Timeline</h2>
      <div className="relative">
          <div className="absolute left-5 top-0 h-full w-0.5 bg-slate-700/60" aria-hidden="true"></div>
          <div className="relative flex flex-col gap-y-6">
              {logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <ActivityIcon type={log.actionType} />
                  <div className="flex-grow p-3 rounded-lg bg-slate-800/50">
                    <p className="text-sm text-white">
                      <span className="font-semibold">{log.username}</span> performed a <span className="font-semibold">{log.actionType}</span> action.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
              {logs.length === 0 && (
                  <div className="flex items-center space-x-4">
                      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-slate-800/60 bg-slate-700"></div>
                      <p className="text-center text-slate-500 py-8">No activity to display.</p>
                  </div>
              )}
          </div>
      </div>
    </Card>
  );
};

export default ActivityLogComponent;