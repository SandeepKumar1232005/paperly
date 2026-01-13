import React from 'react';

interface ProgressBarProps {
    progress: number; // 0 to 100
    label?: string;
    colorClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, colorClass = "bg-indigo-600" }) => {
    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{Math.round(progress)}%</span>
                </div>
            )}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colorClass}`}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
