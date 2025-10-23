import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { KeyRound } from 'lucide-react';

interface DecryptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecrypt: (key: string) => void;
  filename: string;
  isDecrypting: boolean;
  onExitComplete?: () => void;
}

const DecryptModal: React.FC<DecryptModalProps> = ({ isOpen, onClose, onDecrypt, filename, isDecrypting, onExitComplete }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDecrypt(key);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} onExitComplete={onExitComplete} title={`Decrypt: ${filename}`} backgroundClassName="bg-slate-900 border border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <p className="text-slate-300">Enter the decryption key you received from the sender to view this file's contents.</p>
        </div>
        <Input
          id="decryption-key"
          label="Decryption Key"
          type="password"
          placeholder="Enter secret key"
          icon={<KeyRound className="h-4 w-4 text-slate-400" />}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
          autoFocus
        />
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="w-auto">Cancel</Button>

          <Button type="submit" isLoading={isDecrypting} className="w-auto">
            {isDecrypting ? 'Decrypting...' : 'Decrypt & View'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DecryptModal;