import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileItem, User, UserRole } from '../../types';
import { FileText, MoreVertical, Eye, Share2, Trash2, Edit3, Download, Bot, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface FileCardComponentProps {
    file: FileItem;
    user: User;
    isOwner: boolean;
    onDelete: (id: string) => void;
    onShare: (file: FileItem) => void;
    onAnalyze: (file: FileItem) => void;
    onView: (file: FileItem) => void;
    onDownload: (file: FileItem) => void;
}

const FileCardComponent: React.FC<FileCardComponentProps> = ({ file, user, isOwner, onDelete, onShare, onAnalyze, onView, onDownload }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { addToast } = useToast();
  const { role } = user;
  const isLevel4 = role === UserRole.LEVEL4;

  const canView = true;
  const canDownload = true;
  const canShare = !isLevel4 && (isOwner || role === UserRole.LEVEL1 || role === UserRole.LEVEL2);
  const canDelete = !isLevel4 && (isOwner || role === UserRole.ADMIN || role === UserRole.LEVEL1);
  const canEdit = !isLevel4 && (role === UserRole.ADMIN || (isOwner && role === UserRole.LEVEL1));
  const canAnalyze = !isLevel4 && (role === UserRole.ADMIN || role === UserRole.LEVEL1) && !file.isEncrypted;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent view action when clicking on menu button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onView(file);
  };

  const createActionHandler = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    action();
    setMenuOpen(false);
  };
  
  const handleDownloadAction = createActionHandler(() => onDownload(file));
  const handleEdit = createActionHandler(() => addToast(`Editing ${file.filename}`, 'info'));
  const handleShare = createActionHandler(() => onShare(file));
  const handleDelete = createActionHandler(() => onDelete(file.id));
  const handleAnalyze = createActionHandler(() => onAnalyze(file));

  const getFileIcon = () => {
    const iconContainerClasses = "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center";
    if (file.isEncrypted) {
      if (file.encryptionType === 'abe') {
        return <div className={`${iconContainerClasses} bg-purple-500/10`}><ShieldAlert className="h-6 w-6 text-purple-400" /></div>;
      }
      return <div className={`${iconContainerClasses} bg-indigo-500/10`}><ShieldCheck className="h-6 w-6 text-indigo-400" /></div>;
    }
    return <div className={`${iconContainerClasses} bg-slate-700/60`}><FileText className="h-6 w-6 text-slate-300" /></div>;
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={handleCardClick}
      className={`bg-slate-800/60 hover:bg-slate-800/90 p-4 rounded-lg flex flex-col justify-between transition-all cursor-pointer ring-1 ring-slate-700/50 hover:ring-indigo-500/50 h-44`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4 overflow-hidden">
          {getFileIcon()}
          <div className="overflow-hidden">
            <p className="font-semibold text-white truncate" title={file.filename}>{file.filename}</p>
            <p className="text-sm text-slate-400">
              {isOwner ? `Uploaded on ${file.dateUploaded}` : `From: ${file.uploader}`}
            </p>
          </div>
        </div>
         <div className="relative flex-shrink-0 z-10">
            <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} 
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)} 
                className="p-2 rounded-full hover:bg-slate-700"
            >
              <MoreVertical className="h-5 w-5 text-slate-400" />
            </button>
            <AnimatePresence>
            {menuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl shadow-xl z-10 bg-slate-900/80 ring-1 ring-slate-700 backdrop-blur-lg"
                >
                <div className="py-1" role="menu" aria-orientation="vertical">
                    {canShare && <button onClick={handleShare} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/80" role="menuitem"><Share2 className="mr-3 h-4 w-4"/> Share</button>}
                    {canAnalyze && <button onClick={handleAnalyze} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/80" role="menuitem"><Bot className="mr-3 h-4 w-4"/> Analyze</button>}
                    {canDownload && <button onClick={handleDownloadAction} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/80" role="menuitem"><Download className="mr-3 h-4 w-4"/> Download</button>}
                    {canEdit && <button onClick={handleEdit} className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/80" role="menuitem"><Edit3 className="mr-3 h-4 w-4"/> Edit</button>}
                    {canDelete && <button onClick={handleDelete} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-700/80" role="menuitem"><Trash2 className="mr-3 h-4 w-4"/> Delete</button>}
                </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 text-xs">
          {file.encryptionType === 'abe' && <span className="font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">ABE Policy</span>}
          {file.encryptionType === 'standard' && <span className="font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">AES Encrypted</span>}
      </div>
    </motion.div>
  );
};

export default FileCardComponent;