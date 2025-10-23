import React from 'react';
import { motion } from 'framer-motion';
import { ThreatAnalysisResult } from '../../types';
import Modal from '../ui/Modal';
import { AlertTriangle, CheckCircle, Shield, List, Lock } from 'lucide-react';
import Button from '../ui/Button';

const ThreatMeter: React.FC<{ level: ThreatAnalysisResult['threatLevel'] }> = ({ level }) => {
    const levels = {
        Low: { value: 25, color: 'text-green-400', trackColor: 'stroke-green-500/20', meterColor: 'stroke-green-500' },
        Medium: { value: 50, color: 'text-yellow-400', trackColor: 'stroke-yellow-500/20', meterColor: 'stroke-yellow-500' },
        High: { value: 75, color: 'text-orange-400', trackColor: 'stroke-orange-500/20', meterColor: 'stroke-orange-500' },
        Critical: { value: 95, color: 'text-red-400', trackColor: 'stroke-red-500/20', meterColor: 'stroke-red-500' },
    };
    const { value, color, trackColor, meterColor } = levels[level];
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center h-40 w-40">
            <svg className="absolute" width="160" height="160" viewBox="0 0 120 120">
                <circle className={trackColor} strokeWidth="10" fill="transparent" r="52" cx="60" cy="60" />
                <motion.circle
                    className={meterColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
            </svg>
            <div className="text-center">
                 <motion.div
                    className={`text-4xl font-bold ${color}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    {value}
                </motion.div>
                <motion.div 
                    className="text-sm text-slate-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                >
                    Risk Score
                </motion.div>
            </div>
        </div>
    );
};

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: ThreatAnalysisResult | null;
  filename: string;
  fileId: string | null;
  onEncryptAndShare: (fileId: string) => void;
  onExitComplete?: () => void;
}

const ThreatLevelBadge: React.FC<{ level: ThreatAnalysisResult['threatLevel'] }> = ({ level }) => {
  const levelStyles = {
    Low: 'bg-green-500/20 text-green-300',
    Medium: 'bg-yellow-500/20 text-yellow-300',
    High: 'bg-orange-500/20 text-orange-300',
    Critical: 'bg-red-500/20 text-red-300',
  };
  return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${levelStyles[level]}`}>{level} Risk</span>;
};

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, result, filename, fileId, onEncryptAndShare, onExitComplete }) => {
  const isHighRisk = result && (result.threatLevel === 'High' || result.threatLevel === 'Critical');

  const handleSecure = () => {
    if (fileId) {
      onEncryptAndShare(fileId);
    }
  };
  
  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        onExitComplete={onExitComplete}
        title={`Threat Analysis: ${filename}`} 
        className="max-w-xl" 
        backgroundClassName="bg-slate-900 border border-slate-700"
    >
        <div className="flex flex-col h-full">
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center flex-grow">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-12 w-12 text-indigo-400"
                >
                    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </motion.div>
              <h3 className="text-xl font-semibold">Analyzing File...</h3>
              <p className="text-slate-400">Our AI is securely scanning the file for potential threats. Please wait a moment.</p>
            </div>
          )}
          {!isLoading && result && (
            <>
              <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 -mr-6 max-h-[50vh]">
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center border-b border-slate-700/50 pb-6">
                      <ThreatMeter level={result.threatLevel} />
                      <ThreatLevelBadge level={result.threatLevel} />
                      <p className="mt-2 text-slate-300 max-w-md">{result.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                        <h5 className="font-semibold text-slate-200 flex items-center mb-3">
                            <AlertTriangle className="h-5 w-5 mr-2 text-amber-400" />
                            Potential Threats
                        </h5>
                        <ul className="space-y-2">
                            {result.potentialThreats.map((threat, i) => (
                                <li key={i} className="flex items-start">
                                    <List className="h-4 w-4 mr-3 mt-1 text-slate-500 flex-shrink-0" />
                                    <span className="text-slate-400">{threat}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-semibold text-slate-200 flex items-center mb-3">
                            <Shield className="h-5 w-5 mr-2 text-green-400" />
                            Recommendations
                        </h5>
                        <ul className="space-y-2">
                            {result.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start">
                                    <CheckCircle className="h-4 w-4 mr-3 mt-1 text-slate-500 flex-shrink-0" />
                                    <span className="text-slate-400">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 mt-6 pt-6 border-t border-slate-700/50 flex justify-end items-center gap-4">
                <p className={`text-sm mr-auto transition-colors ${isHighRisk ? 'text-red-400' : 'text-slate-400'}`}>
                    {isHighRisk ? 'High risk detected. Encryption is strongly recommended.' : 'Low risk detected. You can encrypt for extra security.'}
                </p>
                <Button variant="secondary" onClick={onClose} className="w-auto">
                    Dismiss
                </Button>
                <Button
                    onClick={handleSecure}
                    variant={isHighRisk ? 'danger' : 'primary'}
                    className="w-auto"
                >
                    <Lock className="h-4 w-4 mr-2" />
                    Secure File
                </Button>
              </div>
            </>
          )}
        </div>
    </Modal>
  );
};

export default AnalysisModal;