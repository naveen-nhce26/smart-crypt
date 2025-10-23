
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import Modal from './Modal';
import Button from './Button';
import { useToast } from '../../hooks/useToast';
import { LifeBuoy } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface HelpDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendRequest: (userMessage: string, aiResponse: string) => Promise<void>;
}

const HelpDeskModal: React.FC<HelpDeskModalProps> = ({ isOpen, onClose, onSendRequest }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ user: string; ai: string } | null>(null);
  const { addToast } = useToast();

  const handleClose = () => {
    onClose();
    // Reset state after modal closes
    setTimeout(() => {
        setMessage('');
        setResult(null);
    }, 300); // delay to allow for exit animation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      addToast('Please enter your issue or question.', 'error');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `A user of the SmartCrypt platform has the following issue: "${message}"`,
        config: {
          systemInstruction: "You are a friendly and helpful AI assistant for SmartCrypt, a secure file-sharing platform. Your role is to provide initial support to users. Acknowledge their problem, provide a brief, general troubleshooting tip if possible (like checking their connection or browser), and reassure them that a human administrator has been notified and will review their request shortly. Keep your response concise, professional, and under 100 words."
        }
      });
      
      const aiResponse = response.text;
      
      await onSendRequest(message, aiResponse);
      
      setResult({ user: message, ai: aiResponse });
      addToast('Your request has been sent.', 'success');
      
    } catch (error) {
      console.error("Help desk AI error:", error);
      addToast('Could not send help request. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="SmartCrypt Help Desk">
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="help-message" className="block text-sm font-medium text-slate-300 mb-2">
              How can we help you?
            </label>
            <textarea
              id="help-message"
              rows={6}
              className="w-full bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 p-3 rounded-md"
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={handleClose} className="w-auto" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="w-auto">
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <LifeBuoy className="h-12 w-12 text-green-400 mb-4"/>
                <h3 className="text-xl font-bold text-white">Request Received</h3>
                <p className="text-slate-400">An administrator has been notified. Here is our initial response:</p>
            </div>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-slate-300 mb-1">Your Request:</p>
                    <p className="text-sm text-slate-400 italic">"{result.user}"</p>
                </div>
                 <div className="bg-indigo-500/10 p-4 rounded-lg border border-indigo-500/30">
                    <p className="text-sm font-semibold text-indigo-300 mb-1">Automated Response:</p>
                    <p className="text-sm text-slate-300">{result.ai}</p>
                </div>
            </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleClose} className="w-auto">
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default HelpDeskModal;
