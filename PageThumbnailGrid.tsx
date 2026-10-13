import React from 'react';
import { RotateCw, Trash2, ArrowLeft, ArrowRight, CheckSquare, Square } from 'lucide-react';
import { PDFPageInfo } from '../types';

interface PageThumbnailGridProps {
  pages: PDFPageInfo[];
  mode: 'rotate' | 'delete' | 'extract' | 'reorder';
  onRotatePage?: (pageNumber: number) => void;
  onToggleSelect?: (pageNumber: number) => void;
  onMovePage?: (index: number, direction: 'left' | 'right') => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onRotateAll?: () => void;
}

export const PageThumbnailGrid: React.FC<PageThumbnailGridProps> = ({
  pages,
  mode,
  onRotatePage,
  onToggleSelect,
  onMovePage,
  onSelectAll,
  onDeselectAll,
  onRotateAll
}) => {
  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs font-semibold text-slate-300">
          Total Pages: <span className="text-indigo-400">{pages.length}</span>
          {(mode === 'delete' || mode === 'extract') && (
            <span className="ml-2 text-slate-400">
              ({pages.filter((p) => p.selected).length} selected)
            </span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {mode === 'rotate' && onRotateAll && (
            <button
              type="button"
              onClick={onRotateAll}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Rotate All 90°
            </button>
          )}

          {(mode === 'delete' || mode === 'extract') && (
            <>
              {onSelectAll && (
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Select All
                </button>
              )}
              {onDeselectAll && (
                <button
                  type="button"
                  onClick={onDeselectAll}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Clear Selection
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Grid of Pages */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {pages.map((p, index) => {
          const isSelected = p.selected;

          return (
            <div
              key={p.pageNumber}
              onClick={() => (mode === 'delete' || mode === 'extract') && onToggleSelect?.(p.pageNumber)}
              onKeyDown={(e) => {
                if ((mode === 'delete' || mode === 'extract') && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onToggleSelect?.(p.pageNumber);
                }
              }}
              role={mode === 'delete' || mode === 'extract' ? 'button' : undefined}
              tabIndex={mode === 'delete' || mode === 'extract' ? 0 : undefined}
              aria-pressed={mode === 'delete' || mode === 'extract' ? isSelected : undefined}
              className={`group relative flex flex-col items-center rounded-xl border p-2.5 transition-all ${
                mode === 'delete' && isSelected
                  ? 'border-rose-500/70 bg-rose-500/10'
                  : mode === 'extract' && isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/10'
                  : 'border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800'
              } ${(mode === 'delete' || mode === 'extract') ? 'cursor-pointer' : ''}`}
            >
              {/* Header Badge */}
              <div className="mb-2 flex w-full items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">#{p.pageNumber}</span>

                {(mode === 'delete' || mode === 'extract') && (
                  <span className={isSelected ? (mode === 'delete' ? 'text-rose-400' : 'text-indigo-400') : 'text-slate-400'}>
                    {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </span>
                )}

                {mode === 'rotate' && p.rotation > 0 && (
                  <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[10px] font-bold text-indigo-400">
                    {p.rotation}°
                  </span>
                )}
              </div>

              {/* Thumbnail Container */}
              <div className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-lg bg-white p-1 shadow-inner">
                {p.thumbnailUrl ? (
                  <img
                    src={p.thumbnailUrl}
                    alt={`Page ${p.pageNumber}`}
                    className="max-h-full max-w-full object-contain transition-transform duration-200"
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                  />
                ) : (
                  <div
                    className="flex h-full w-full flex-col justify-between rounded border border-slate-200 bg-white p-2 text-slate-800 transition-transform duration-200"
                    style={{ transform: `rotate(${p.rotation}deg)` }}
                  >
                    <div className="h-2 w-3/4 rounded bg-slate-300" />
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded bg-slate-200" />
                      <div className="h-1.5 w-5/6 rounded bg-slate-200" />
                      <div className="h-1.5 w-2/3 rounded bg-slate-200" />
                    </div>
                    <div className="text-center font-bold text-xs text-slate-400">
                      Page {p.pageNumber}
                    </div>
                  </div>
                )}

                {/* Delete overlay indicator */}
                {mode === 'delete' && isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-rose-950/60 backdrop-blur-[1px]">
                    <Trash2 className="h-8 w-8 text-rose-400" />
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-2.5 flex w-full items-center justify-center gap-1.5">
                {mode === 'rotate' && onRotatePage && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(p.pageNumber);
                    }}
                    className="flex w-full items-center justify-center gap-1 rounded bg-slate-700/80 py-1 text-[11px] font-medium text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <RotateCw className="h-3 w-3" />
                    Rotate 90°
                  </button>
                )}

                {mode === 'reorder' && onMovePage && (
                  <div className="flex w-full items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(index, 'left');
                      }}
                      disabled={index === 0}
                      className="flex-1 rounded bg-slate-700/80 py-1 text-slate-300 hover:bg-slate-600 disabled:opacity-20 flex justify-center"
                      title="Move Left"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(index, 'right');
                      }}
                      disabled={index === pages.length - 1}
                      className="flex-1 rounded bg-slate-700/80 py-1 text-slate-300 hover:bg-slate-600 disabled:opacity-20 flex justify-center"
                      title="Move Right"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
