import React, { useEffect, useState } from 'react';
import { Download, CheckCircle2, Copy, Check, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ProcessedResult } from '../types';
import { formatBytes } from '../utils/formatters';

interface ResultCardProps {
  result: ProcessedResult;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onReset
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if canvas-confetti is unsupported
    }
  }, []);

  const handleCopyText = async () => {
    if (!result.extractedText) return;
    try {
      await navigator.clipboard.writeText(result.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header status */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 shadow-inner">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Your file is ready!</h3>
        <p className="mt-1 text-xs text-slate-400">
          Processed securely in your browser session.
        </p>
      </div>

      {/* Metrics Panel */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
        <div>
          <span className="text-[11px] font-medium text-slate-400">Original Size</span>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">
            {formatBytes(result.originalSize)}
          </p>
        </div>

        <div>
          <span className="text-[11px] font-medium text-slate-400">Result Size</span>
          <p className="text-sm font-semibold text-emerald-400 mt-0.5">
            {formatBytes(result.newSize)}
          </p>
        </div>

        {result.reductionPercentage !== undefined && result.reductionPercentage > 0 ? (
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-slate-400">Reduction</span>
            <p className="flex items-center gap-1 text-sm font-bold text-emerald-400 mt-0.5">
              <Sparkles className="h-3.5 w-3.5" />
              {result.reductionPercentage}% saved
            </p>
          </div>
        ) : result.pageCount ? (
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-slate-400">Pages</span>
            <p className="text-sm font-semibold text-indigo-400 mt-0.5">
              {result.pageCount} pages
            </p>
          </div>
        ) : (
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-slate-400">Status</span>
            <p className="text-sm font-semibold text-indigo-400 mt-0.5">
              Ready
            </p>
          </div>
        )}
      </div>

      {/* Metadata / inspection details, if applicable */}
      {result.metadata && Object.keys(result.metadata).length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-400 px-1">Details</span>
          <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:grid-cols-2">
            {Object.entries(result.metadata).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500">{key}</span>
                <span className="font-semibold text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text preview if applicable */}
      {result.extractedText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-1">
            <span>Extracted Content Preview</span>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Text'}
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {result.extractedText}
          </div>
        </div>
      )}

      {/* Main Download CTA */}
      <div className="space-y-3">
        <a
          href={result.downloadUrl}
          download={result.fileName}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.99]"
        >
          <Download className="h-5 w-5" />
          Download {result.fileName}
        </a>

        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Process Another File
        </button>
      </div>
    </div>
  );
};
