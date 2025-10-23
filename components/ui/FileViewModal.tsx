import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FileItem, User } from '../../types';
import { Download, File, ImageIcon, Music, Video } from 'lucide-react';

const getFileExtension = (filename: string) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
};

const generateMockFileContent = (filename: string): string => {
  if (filename.toLowerCase().includes('research')) {
    return `Quantum Computing Research Initiative - Q1 Report...`;
  }
  if (filename.toLowerCase().includes('patient')) {
    return `CONFIDENTIAL MEDICAL RECORD: Patient ID: P-847362...`;
  }
  if (filename.toLowerCase().includes('lecture')) {
    return `Advanced Cryptography - Lecture 7: Asymmetric-Key Cryptography...`;
  }
  return `Document: ${filename}\n\nThis is a standard document.`;
};

const FilePreview: React.FC<{ file: FileItem }> = ({ file }) => {
  const extension = getFileExtension(file.filename);
  
  const placeholderStyle = "flex flex-col items-center justify-center h-full w-full bg-slate-800/50 rounded-lg p-8 text-center text-slate-400";

  switch (extension) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return (
        <div className={placeholderStyle}>
            <ImageIcon className="h-24 w-24 mb-4 text-indigo-400" />
            <p className="font-semibold text-lg text-white">{file.filename}</p>
            <p className="text-sm">Image Preview</p>
        </div>
      );
    case 'mp3':
    case 'wav':
      return (
        <div className={placeholderStyle}>
            <Music className="h-24 w-24 mb-4 text-indigo-400" />
            <p className="font-semibold text-lg text-white">{file.filename}</p>
            <div className="w-full max-w-sm mt-4">
                <div className="h-2 bg-slate-700 rounded-full">
                    <div className="h-2 bg-indigo-500 rounded-full w-1/4"></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                    <span>0:45</span>
                    <span>3:00</span>
                </div>
            </div>
            <p className="text-sm mt-2">Audio Player</p>
        </div>
      );
    case 'mp4':
    case 'webm':
    case 'mov':
       return (
        <div className={placeholderStyle}>
            <Video className="h-24 w-24 mb-4 text-indigo-400" />
            <p className="font-semibold text-lg text-white">{file.filename}</p>
            <p className="text-sm mt-2">Video Player</p>
        </div>
      );
    case 'pdf':
    case 'docx':
    case 'txt':
       return (
        <div className="bg-slate-800/50 rounded-lg p-6">
           <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">
              {generateMockFileContent(file.filename)}
           </pre>
        </div>
       );
    default:
      return (
        <div className={placeholderStyle}>
            <File className="h-24 w-24 mb-4 text-slate-500" />
            <p className="font-semibold text-lg text-white">{file.filename}</p>
            <p className="text-sm mt-2">Preview not available for this file type.</p>
        </div>
      );
  }
};


interface FileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  user: User | null;
  onDownload: (file: FileItem) => void;
}

const FileViewModal: React.FC<FileViewModalProps> = ({ isOpen, onClose, file, user, onDownload }) => {
  if (!file || !user) return null;

  const title = `View File: ${file.filename}`;
  
  const handleDownload = () => {
    onDownload(file);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-4xl" backgroundClassName="bg-slate-900 border border-slate-700">
        <div className="h-[60vh] overflow-y-auto p-1">
          <FilePreview file={file} />
        </div>
        <div className="mt-6 pt-6 border-t border-slate-700 flex justify-end gap-4">
            <Button variant="secondary" onClick={onClose} className="w-auto">
                Close
            </Button>
            <Button onClick={handleDownload} className="w-auto">
                <Download className="h-4 w-4 mr-2" />
                Download
            </Button>
        </div>
    </Modal>
  );
};

export default FileViewModal;