import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { KeyRound, Copy, Check } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface KeyDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  decryptionKey: string | null;
  onExitComplete?: () => void;
}

const KeyDisplayModal: React.FC<KeyDisplayModalProps> = ({ isOpen, onClose, filename, decryptionKey, onExitComplete }) => {
  const [copied, setCopied] = React.useState(false);
  const { addToast } = useToast();

  const handleCopy = () => {
    if (decryptionKey) {
      navigator.clipboard.writeText(decryptionKey);
      setCopied(true);
      addToast('Key copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!decryptionKey) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} onExitComplete={onExitComplete} title={`Encryption Key Generated`} backgroundClassName="bg-slate-900 border border-slate-700">
      <div className="space-y-6 text-center">
        <KeyRound className="h-12 w-12 text-indigo-400 mx-auto" />
        <div>
          <h4 className="text-lg font-semibold text-white">Share this key with the recipient of</h4>
          <p className="font-mono text-indigo-300 break-all">{filename}</p>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4 relative">
          <p className="font-mono text-2xl text-green-400 tracking-widest">{decryptionKey}</p>
          <button onClick={handleCopy} className="absolute top-2 right-2 p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>

        <div className="bg-yellow-500/10 text-yellow-300/80 p-3 rounded-lg text-sm">
          <p>
            <strong>Important:</strong> For security, this key will not be shown again. Please copy it now and share it securely.
          </p>
        </div>
        
        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="w-auto">
            I have copied the key
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default KeyDisplayModal;