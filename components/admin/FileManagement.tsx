
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { FileItem, User, UserRole, ThreatAnalysisResult, Notification, ActivityType } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Checkbox from '../ui/Checkbox';
import AnalysisModal from './AnalysisModal';
import DecryptModal from '../ui/DecryptModal';
import KeyDisplayModal from '../ui/KeyDisplayModal';
import { useToast } from '../../hooks/useToast';
import FileCardComponent from './FileCardComponent';
import { UploadCloud, X } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateRandomKey = () => {
    const words1 = ['CLOUD', 'STAR', 'SKY', 'MOON', 'SUN', 'WIND', 'FIRE'];
    const words2 = ['FOREST', 'RIVER', 'OCEAN', 'MEADOW', 'PEAK', 'DAWN'];
    const word1 = words1[Math.floor(Math.random() * words1.length)];
    const word2 = words2[Math.floor(Math.random() * words2.length)];
    const number = Math.floor(100 + Math.random() * 900);
    return `${word1}-${word2}-${number}`;
};

const getMimeType = (filename: string): string => {
    const extension = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    switch (extension) {
        case 'pdf': return 'application/pdf';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'gif': return 'image/gif';
        case 'mp3': return 'audio/mpeg';
        case 'wav': return 'audio/wav';
        case 'mp4': return 'video/mp4';
        case 'webm': return 'video/webm';
        case 'mov': return 'video/quicktime';
        case 'txt': return 'text/plain';
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        default: return 'application/octet-stream';
    }
};

const UploadForm: React.FC<{ onUpload: (file: File) => void, onCancel: () => void }> = ({ onUpload, onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { addToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            addToast('Please select a file to upload.', 'error');
            return;
        }
        setIsUploading(true);
        setTimeout(() => {
            onUpload(file);
            setIsUploading(false);
            setFile(null);
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <motion.div 
            initial={{opacity: 0, height: 0}} 
            animate={{opacity: 1, height: 'auto'}}
            exit={{opacity: 0, height: 0}}
            className="overflow-hidden"
        >
        <div className="flex flex-col items-center justify-center mt-6 p-8 border-2 border-dashed border-slate-700 rounded-lg bg-slate-900/40 relative">
            <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <X className="h-5 w-5"/>
            </button>
            <UploadCloud className="h-16 w-16 text-slate-500 mb-4"/>
            <h3 className="text-xl font-semibold mb-2">Upload & Analyze File</h3>
            <p className="text-slate-400 mb-4">File will be automatically analyzed for threats upon upload.</p>
            <form onSubmit={handleUpload} className="w-full max-w-lg space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Input type="file" onChange={handleFileChange} className="w-full sm:w-auto flex-grow" />
                    <Button type="submit" isLoading={isUploading} className="w-full sm:w-auto">
                        {isUploading ? 'Uploading...' : 'Upload & Analyze'}
                    </Button>
                </div>
            </form>
        </div>
        </motion.div>
    );
};

interface FileManagementProps {
  user: User;
  allUsers: User[];
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  addNotification: (userId: string, message: string) => void;
  addActivityLog: (username: string, actionType: ActivityType) => void;
}

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


const FileManagement: React.FC<FileManagementProps> = ({ user, allUsers, files, setFiles, addNotification, addActivityLog }) => {
  const [activeTab, setActiveTab] = useState(user.role === UserRole.LEVEL4 ? 'received-files' : 'my-files');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileToShare, setFileToShare] = useState<FileItem | null>(null);
  const [usersToShareWith, setUsersToShareWith] = useState<string[]>([]);
  const [shareMode, setShareMode] = useState<'users' | 'attributes'>('users');
  const [abePolicy, setAbePolicy] = useState('');
  const [abePolicyMode, setAbePolicyMode] = useState<'AND' | 'OR'>('AND');
  
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [fileToAnalyze, setFileToAnalyze] = useState<FileItem | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ThreatAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
  const [fileToDecrypt, setFileToDecrypt] = useState<FileItem | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  const [isKeyDisplayModalOpen, setIsKeyDisplayModalOpen] = useState(false);
  const [keyToDisplay, setKeyToDisplay] = useState<string | null>(null);
  const [fileWithNewKey, setFileWithNewKey] = useState<FileItem | null>(null);

  const [pendingModalAction, setPendingModalAction] = useState<(() => void) | null>(null);

  const { addToast } = useToast();

  const myFiles = files.filter(f => f.uploaderId === user.id);
  const sharedByMeFiles = files.filter(f => f.uploaderId === user.id && (f.sharedWith?.length || f.encryptionType === 'abe'));
  const receivedFiles = files.filter(f => f.sharedWith?.includes(user.id) || (f.encryptionType === 'abe' && evaluateABEPolicy(user.attributes, f)));
  const downloadedFiles = files.filter(f => f.downloadedBy?.includes(user.id));

  const allTabs = [
      { id: 'my-files', label: 'My Files', count: myFiles.length },
      { id: 'shared-by-me', label: 'Shared By Me', count: sharedByMeFiles.length },
      { id: 'received-files', label: 'Received Files', count: receivedFiles.length },
      { id: 'downloaded-files', label: 'Downloaded Files', count: downloadedFiles.length },
  ];
    
  const visibleTabs = user.role === UserRole.LEVEL4
      ? allTabs.filter(tab => ['received-files', 'downloaded-files'].includes(tab.id))
      : allTabs;
  
  const shareableUsers = allUsers.filter(u => u.id !== user.id);
  
  const openFileInNewTab = (file: FileItem) => {
    if (!file.content || !file.mimeType) {
        addToast('File content not available for preview.', 'error');
        return;
    }

    let embedContent;
    const { content, mimeType, filename } = file;

    if (mimeType.startsWith('image/')) {
        embedContent = `<img src="${content}" alt="${filename}" style="max-width: 100%; max-height: 100vh; object-fit: contain;">`;
    } else if (mimeType.startsWith('video/')) {
        embedContent = `<video src="${content}" controls autoplay style="max-width: 100%; max-height: 100vh;"></video>`;
    } else if (mimeType.startsWith('audio/')) {
        embedContent = `<div style="display: flex; flex-direction: column; align-items: center;"><h2 style="color: white; font-family: sans-serif;">${filename}</h2><audio src="${content}" controls autoplay></audio></div>`;
    } else if (mimeType === 'application/pdf') {
        embedContent = `<iframe src="${content}" style="width: 100%; height: 100vh; border: none;"></iframe>`;
    } else {
        // Fallback for other types like .txt, .docx etc. - try iframe
        embedContent = `<iframe src="${content}" style="width: 100%; height: 100vh; border: none; background: white;"></iframe>`;
    }
    
    const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8"><title>${filename}</title>
            <style>body { margin: 0; background-color: #111827; display: flex; justify-content: center; align-items: center; height: 100vh; }</style>
        </head>
        <body>${embedContent}</body>
        </html>
    `;
    
    const newWindow = window.open("", '_blank');
    if (newWindow) {
        newWindow.document.write(fullHtml);
        newWindow.document.close();
    }
  };

  const handleOpenShareModal = (file: FileItem) => {
    setFileToShare(file);
    setUsersToShareWith([]); // Reset selection
    setShareMode('users');
    setAbePolicy('');
    setAbePolicyMode('AND');
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
  };
  
  const handleAnalyzeFile = async (file: FileItem) => {
    setFileToAnalyze(file);
    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    addToast(`Analyzing ${file.filename}...`, 'info');

    const schema = {
      type: Type.OBJECT,
      properties: {
        threatLevel: {
          type: Type.STRING,
          description: 'The assessed threat level. Must be one of: "Low", "Medium", "High", or "Critical".'
        },
        summary: {
          type: Type.STRING,
          description: 'A brief, one-sentence summary of the analysis findings.'
        },
        potentialThreats: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of potential threats or sensitive data types identified.'
        },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of recommended actions to mitigate threats.'
        }
      },
      required: ['threatLevel', 'summary', 'potentialThreats', 'recommendations']
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following filename for potential security threats: "${file.filename}". Based on the name, infer the likely content and perform a threat analysis. The file could contain sensitive information like patient records, research data, or corporate documents. Provide a threat level, a summary, a list of potential threats, and recommended actions.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const resultJson = JSON.parse(response.text);
      setAnalysisResult(resultJson);
    } catch (error) {
      console.error("Analysis failed:", error);
      addToast('Analysis failed. Please try again.', 'error');
      setAnalysisResult({
        threatLevel: 'Critical',
        summary: 'The analysis could not be completed due to an API error.',
        potentialThreats: ['API communication failure.', 'Model may be unavailable.'],
        recommendations: ['Check the browser console for errors.', 'Try again later.']
      });
    } finally {
      setIsAnalyzing(false);
      addNotification(user.id, `Analysis for "${file.filename}" is complete.`);
    }
  };

  const handleCloseAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
  };
  
  const onModalExit = () => {
    if (pendingModalAction) {
      pendingModalAction();
      setPendingModalAction(null);
    }
  };

  const handleEncryptAndShare = (fileId: string) => {
    const fileToSecure = files.find(f => f.id === fileId);
    if (fileToSecure) {
        setPendingModalAction(() => () => handleOpenShareModal(fileToSecure));
        handleCloseAnalysisModal();
    }
  };
  
  const handleOpenFileView = (file: FileItem) => {
    if (file.isEncrypted) {
      if (file.encryptionType === 'abe') {
        if (evaluateABEPolicy(user.attributes, file)) {
          addToast('ABE policy satisfied. Access granted.', 'success');
          openFileInNewTab(file);
        } else {
          addToast("Access Denied. Your attributes do not match the file's access policy.", 'error');
        }
      } else { // Standard encryption
        setFileToDecrypt(file);
        setIsDecryptModalOpen(true);
      }
    } else {
      openFileInNewTab(file);
    }
  };

  const handleCloseDecryptModal = () => {
    setIsDecryptModalOpen(false);
    setIsDecrypting(false);
  };

  const handleConfirmDecrypt = (key: string) => {
    if (!fileToDecrypt) return;
    setIsDecrypting(true);
    setTimeout(() => {
        if (key === fileToDecrypt.decryptionKey) {
            addToast('Decryption successful!', 'success');
            handleCloseDecryptModal();
            openFileInNewTab(fileToDecrypt);
        } else {
            addToast('Invalid decryption key.', 'error');
            setIsDecrypting(false);
        }
    }, 1000);
  };

  const handleConfirmShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToShare) {
        addToast('No file selected for sharing.', 'error');
        return;
    }

    if (shareMode === 'attributes') {
        if (!abePolicy.trim()) {
            addToast('Please specify an access policy.', 'error');
            return;
        }
        const updatedFile = {
            ...fileToShare,
            isEncrypted: true,
            encryptionType: 'abe' as const,
            accessPolicy: abePolicy,
            accessPolicyMode: abePolicyMode,
            sharedWith: [], // ABE doesn't use direct user sharing list
            decryptionKey: undefined, // No single key
        };
        setFiles(currentFiles => currentFiles.map(f => f.id === fileToShare.id ? updatedFile : f));
        addToast(`Encrypted '${fileToShare.filename}' with ABE policy.`, 'success');
        addActivityLog(user.username, ActivityType.SHARE);
        handleCloseShareModal();

    } else { // 'users' mode
        if (usersToShareWith.length === 0) {
            addToast('Please select at least one user to share with.', 'error');
            return;
        }
        const key = generateRandomKey();
        const updatedFile = {
            ...fileToShare,
            isEncrypted: true,
            encryptionType: 'standard' as const,
            decryptionKey: key,
            accessPolicy: undefined,
            sharedWith: [...new Set([...(fileToShare.sharedWith || []), ...usersToShareWith])],
        };

        setFiles(currentFiles => currentFiles.map(f => f.id === fileToShare.id ? updatedFile : f));

        addToast(`Shared '${fileToShare.filename}' with ${usersToShareWith.length} user(s).`, 'success');
        addActivityLog(user.username, ActivityType.SHARE);
        
        usersToShareWith.forEach(recipientId => {
            addNotification(recipientId, `${user.username} shared "${fileToShare.filename}" with you.`);
        });
        
        setPendingModalAction(() => () => {
            setKeyToDisplay(key);
            setFileWithNewKey(updatedFile);
            setIsKeyDisplayModalOpen(true);
        });
        handleCloseShareModal();
    }
  };

  const handleDelete = (id: string) => {
      setFiles(files.filter(f => f.id !== id));
      addToast("File deleted", 'info');
  }

  const handleUpload = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile: FileItem = {
            id: `file-${Date.now()}`,
            filename: file.name,
            dateUploaded: new Date().toISOString().split('T')[0],
            uploader: user.username,
            uploaderId: user.id,
            isEncrypted: false,
            sharedWith: [],
            downloadedBy: [],
            content: content,
            mimeType: file.type || getMimeType(file.name),
        };
        setFiles(prev => [newFile, ...prev]);
        addToast('File uploaded! Starting analysis...', 'success');
        addActivityLog(user.username, ActivityType.UPLOAD);
        setActiveTab('my-files');
        setShowUploadForm(false);
        
        // Use a pending action to handle the modal opening after the upload form has closed.
        handleAnalyzeFile(newFile);
      };
      reader.onerror = () => {
        addToast('Failed to read file.', 'error');
      };
      reader.readAsDataURL(file);
  }
  
  const handleDownloadFile = (file: FileItem) => {
    if (file.isEncrypted && file.encryptionType === 'abe') {
        if (!evaluateABEPolicy(user.attributes, file)) {
            addToast("Access Denied. Your attributes do not match the policy to download.", 'error');
            return;
        }
    }
    
    if (!file.content) {
        addToast("Cannot download file, content is missing.", 'error');
        return;
    }
    const link = document.createElement('a');
    link.href = file.content;
    link.setAttribute('download', file.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setFiles(currentFiles =>
      currentFiles.map(f =>
        f.id === file.id
          ? { ...f, downloadedBy: [...new Set([...(f.downloadedBy || []), user.id])] }
          : f
      )
    );
    
    addToast(`Downloading ${file.filename}...`, 'success');

    if (user.id !== file.uploaderId) {
        addNotification(file.uploaderId, `${user.username} downloaded your file: "${file.filename}".`);
    }
  };

  const handleCheckboxChange = (checked: boolean, userId: string) => {
    setUsersToShareWith(prev => {
        if (checked) {
            return [...prev, userId];
        } else {
            return prev.filter(id => id !== userId);
        }
    });
  };

  const FileList: React.FC<{list: FileItem[], isOwnerList: boolean, emptyText: string}> = ({ list, isOwnerList, emptyText }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        <AnimatePresence>
            {list.length > 0 ? (
                list.map(file => <FileCardComponent key={file.id} file={file} user={user} isOwner={isOwnerList} onDelete={handleDelete} onShare={handleOpenShareModal} onAnalyze={handleAnalyzeFile} onView={handleOpenFileView} onDownload={handleDownloadFile} />)
            ) : (
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-slate-500 py-8 col-span-full">{emptyText}</motion.p>
            )}
        </AnimatePresence>
    </div>
  );

  useEffect(() => {
    if (user.role === UserRole.LEVEL4 && !visibleTabs.find(t => t.id === activeTab)) {
        setActiveTab('received-files');
    }
  }, [user.role, activeTab, visibleTabs]);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
         <div className="flex items-center space-x-1 bg-slate-800/60 p-1 rounded-lg">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
              } flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200`}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-200'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        {user.role !== UserRole.LEVEL4 && (
            <Button onClick={() => setShowUploadForm(!showUploadForm)} variant="secondary" className="w-full sm:w-auto flex-shrink-0">
                <UploadCloud className="h-4 w-4 mr-2"/>
                {showUploadForm ? 'Cancel' : 'Upload & Analyze File'}
            </Button>
        )}
      </div>
      
      <AnimatePresence>
          {showUploadForm && <UploadForm onUpload={handleUpload} onCancel={() => setShowUploadForm(false)} />}
      </AnimatePresence>

      <div className="mt-6">
        {activeTab === 'my-files' && <FileList list={myFiles} isOwnerList={true} emptyText="Upload a file to get started."/>}
        {activeTab === 'shared-by-me' && <FileList list={sharedByMeFiles} isOwnerList={true} emptyText="You haven't shared any files."/>}
        {activeTab === 'received-files' && <FileList list={receivedFiles} isOwnerList={false} emptyText="No files have been shared with you." />}
        {activeTab === 'downloaded-files' && <FileList list={downloadedFiles} isOwnerList={false} emptyText="You haven't downloaded any files yet." />}
      </div>

      <Modal 
        isOpen={isShareModalOpen} 
        onClose={handleCloseShareModal} 
        onExitComplete={onModalExit}
        title={`Encrypt & Share "${fileToShare?.filename ?? 'file'}"`}
      >
        {fileToShare && (
          <form onSubmit={handleConfirmShare} className="space-y-6">
            <div className="flex border-b border-slate-700">
                <button type="button" onClick={() => setShareMode('users')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${shareMode === 'users' ? 'border-b-2 border-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Standard Encryption (AES)</button>
                <button type="button" onClick={() => setShareMode('attributes')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${shareMode === 'attributes' ? 'border-b-2 border-purple-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}>Attribute-Based (ABE)</button>
            </div>
            
            <AnimatePresence mode="wait">
            <motion.div
                key={shareMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
             {shareMode === 'users' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Share with (select multiple):
                  </label>
                  <div className="max-h-60 overflow-y-auto space-y-2 p-2 rounded-md border border-slate-700 bg-slate-900/50">
                    {shareableUsers.length > 0 ? (
                      shareableUsers.map(u => (
                        <Checkbox
                            key={u.id}
                            id={`share-user-${u.id}`}
                            label={`${u.username} (${u.roleName})`}
                            checked={usersToShareWith.includes(u.id)}
                            onChange={(e) => handleCheckboxChange(e.target.checked, u.id)}
                        />
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm text-center p-4">No other users to share with.</p>
                    )}
                  </div>
                  <p className="text-sm text-indigo-300/80 bg-indigo-500/10 p-3 rounded-lg mt-4">
                    Encrypts the file with AES-256. A unique key is generated for you to share with recipients, simulating an RSA key exchange for secure delivery.
                 </p>
                </div>
             ) : (
                <div className="space-y-4">
                  <Input
                    label="Access Policy (comma-separated values)"
                    id="abe-policy"
                    placeholder="e.g., s1, ds, hod"
                    value={abePolicy}
                    onChange={(e) => setAbePolicy(e.target.value)}
                    autoFocus
                  />
                   <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Policy Logic</label>
                    <div className="flex items-center space-x-2 bg-slate-900/50 border border-slate-700 rounded-lg p-1">
                        <label htmlFor="policy-and" className={`flex items-center cursor-pointer p-2 rounded-md flex-1 justify-center transition-colors ${abePolicyMode === 'AND' ? 'bg-indigo-600' : 'hover:bg-slate-800/50'}`}>
                            <input 
                                id="policy-and" 
                                name="policy-logic" 
                                type="radio" 
                                checked={abePolicyMode === 'AND'} 
                                onChange={() => setAbePolicyMode('AND')}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium text-slate-200">Strict (AND)</span>
                        </label>
                         <label htmlFor="policy-or" className={`flex items-center cursor-pointer p-2 rounded-md flex-1 justify-center transition-colors ${abePolicyMode === 'OR' ? 'bg-indigo-600' : 'hover:bg-slate-800/50'}`}>
                            <input 
                                id="policy-or" 
                                name="policy-logic" 
                                type="radio" 
                                checked={abePolicyMode === 'OR'} 
                                onChange={() => setAbePolicyMode('OR')}
                                className="sr-only"
                            />
                            <span className="text-sm font-medium text-slate-200">Flexible (OR)</span>
                        </label>
                    </div>
                  </div>
                  <p className="text-sm text-purple-300/80 bg-purple-500/10 p-3 rounded-lg">
                     {abePolicyMode === 'AND'
                      ? "User must have ALL values. e.g., 's1, ds, hod' requires the user to have all three values in their profile."
                      : "User must have AT LEAST ONE value. e.g., 'legal, auditor' grants access to anyone in legal OR any auditor."
                    }
                  </p>
                </div>
             )}
            </motion.div>
            </AnimatePresence>
            <div className="flex justify-end gap-4 mt-8">
                <Button type="button" variant="secondary" onClick={handleCloseShareModal} className="w-auto">Cancel</Button>
                <Button type="submit" className="w-auto" disabled={(shareMode === 'users' && (shareableUsers.length === 0 || usersToShareWith.length === 0)) || (shareMode === 'attributes' && !abePolicy.trim())}>Share & Encrypt</Button>
            </div>
          </form>
        )}
      </Modal>

       <AnalysisModal 
            isOpen={isAnalysisModalOpen}
            onClose={handleCloseAnalysisModal}
            onExitComplete={onModalExit}
            isLoading={isAnalyzing}
            result={analysisResult}
            filename={fileToAnalyze?.filename ?? ''}
            fileId={fileToAnalyze?.id ?? null}
            onEncryptAndShare={handleEncryptAndShare}
        />

       <DecryptModal
            isOpen={isDecryptModalOpen}
            onClose={handleCloseDecryptModal}
            onExitComplete={onModalExit}
            onDecrypt={handleConfirmDecrypt}
            filename={fileToDecrypt?.filename ?? ''}
            isDecrypting={isDecrypting}
       />

       <KeyDisplayModal
            isOpen={isKeyDisplayModalOpen}
            onClose={() => setIsKeyDisplayModalOpen(false)}
            onExitComplete={onModalExit}
            filename={fileWithNewKey?.filename ?? ''}
            decryptionKey={keyToDisplay}
       />
    </Card>
  );
};

export default FileManagement;
