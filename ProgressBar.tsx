import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { ProcessingState } from '../types';

interface ProgressBarProps {
  state: ProcessingState;
  progressPercent?: number; // 0 to 100
  customMessage?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  state,
  progressPercent = 50,
  customMessage
}) => {
  if (state === 'idle') return null;

  const steps: Array<{ key: ProcessingState; label: string }> = [
    { key: 'uploading', label: 'Uploading' },
    { key: 'analyzing', label: 'Analyzing' },
    { key: 'processing', label: 'Processing' },
    { key: 'finalizing', label: 'Finalizing' },
    { key: 'completed', label: 'Complete' }
  ];

  const getStepIndex = (s: ProcessingState) => {
    switch (s) {
      case 'uploading':
        return 0;
      case 'analyzing':
        return 1;
      case 'processing':
        return 2;
      case 'finalizing':
        return 3;
      case 'completed':
        return 4;
      default:
        return 2;
    }
  };

  const currentIndex = getStepIndex(state);

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {state === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
          )}
          <span className="text-sm font-semibold text-white">
            {customMessage || (state === 'completed' ? 'Processing Complete' : `${steps[currentIndex]?.label}...`)}
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-indigo-400">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="mt-5 grid grid-cols-5 text-center text-[11px] font-medium text-slate-400">
        {steps.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step.key} className="flex flex-col items-center">
              <span
                className={`mb-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                  isPassed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isCurrent
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isPassed ? '✓' : idx + 1}
              </span>
              <span
                className={`hidden sm:inline ${
                  isCurrent ? 'text-indigo-400 font-semibold' : isPassed ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
