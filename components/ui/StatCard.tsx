import React from 'react';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; }> = ({ icon, label, value }) => (
    <div className="bg-slate-900/60 ring-1 ring-white/10 backdrop-blur-xl rounded-lg p-4 flex items-center space-x-4">
        <div className="bg-slate-800/80 p-3 rounded-full ring-1 ring-slate-700">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export default StatCard;