import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, File as FileIcon, X, ArrowUp, ArrowDown } from 'lucide-react';
import { ToolDefinition, UploadedFileItem } from '../types';
import { formatBytes } from '../utils/formatters';
import { validateUploadedFiles, validateFileSignatures } from '../utils/fileValidation';

interface FileUploaderProps {
  tool: ToolDefinition;
  files: UploadedFileItem[];
  onFilesChanged: (files: UploadedFileItem[]) => void;
  onError: (msg: string | null) => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  tool,
  files,
  onFilesChanged,
  onError,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(Array.from(e.target.files));
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  const processIncomingFiles = async (newRawFiles: File[]) => {
    onError(null);

    // Merge or replace depending on maxFiles
    let candidateList: File[];
    if (tool.maxFiles === 1) {
      candidateList = [newRawFiles[0]];
    } else {
      const existingRaw = files.map((f) => f.file);
      candidateList = [...existingRaw, ...newRawFiles].slice(0, tool.maxFiles);
    }

    const validation = validateUploadedFiles(candidateList, tool);
    if (!validation.valid) {
      onError(validation.errorMessage || 'Invalid file uploaded.');
      return;
    }

    // Only check the bytes of files that are newly added (already-accepted files were
    // checked when they were first dropped in, and re-reading them here is wasted work).
    const existingFileObjects = new Set(files.map((f) => f.file));
    const newlyAdded = candidateList.filter((f) => !existingFileObjects.has(f));
    const signatureCheck = await validateFileSignatures(newlyAdded);
    if (!signatureCheck.valid) {
      onError(signatureCheck.errorMessage || 'This file could not be verified as a valid file of its type.');
      return;
    }

    // Transform into UploadedFileItems
    const newItems: UploadedFileItem[] = candidateList.map((file) => {
      const existing = files.find((f) => f.file === file);
      if (existing) return existing;

      let previewUrl: string | undefined = undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      return {
        id: 'file-' + Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        previewUrl
      };
    });

    onFilesChanged(newItems);
  };

  const removeFile = (id: string) => {
    const item = files.find((f) => f.id === id);
    if (item?.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    const filtered = files.filter((f) => f.id !== id);
    onFilesChanged(filtered);
    onError(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    const copy = [...files];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onFilesChanged(copy);
  };

  const acceptString = tool.acceptedFileTypes.includes('*') ? undefined : tool.acceptedFileTypes.join(',');

  return (
    <div className="w-full space-y-4">
      {/* Upload Dropzone */}
      {files.length === 0 || tool.maxFiles > 1 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-700 bg-slate-800/40 hover:border-indigo-500/50 hover:bg-slate-800/80'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={tool.maxFiles > 1}
            accept={acceptString}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-white">
            {files.length > 0 ? 'Add more files' : 'Drop your file here'}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            or <span className="font-semibold text-indigo-400 underline decoration-indigo-400/40">browse from your computer</span> or phone
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
            <span className="rounded bg-slate-800 px-2 py-0.5 border border-slate-700/60">
              Accepted: {tool.acceptedFileTypes.join(', ')}
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 border border-slate-700/60">
              Max size: {tool.maxFileSizeMB} MB
            </span>
            {tool.maxFiles > 1 && (
              <span className="rounded bg-slate-800 px-2 py-0.5 border border-slate-700/60">
                Up to {tool.maxFiles} files
              </span>
            )}
          </div>
        </div>
      ) : null}

      {/* Uploaded File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-1">
            <span>
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </span>
            {tool.maxFiles > 1 && (
              <span className="text-[11px] text-slate-400">
                Use arrows to reorder pages
              </span>
            )}
          </div>

          <div className="space-y-2">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/80 p-3 transition-colors hover:border-slate-700"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="h-10 w-10 shrink-0 rounded-lg object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <FileIcon className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-200">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatBytes(item.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-3">
                  {tool.maxFiles > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveFile(index, 'up')}
                        disabled={index === 0 || disabled}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(index, 'down')}
                        disabled={index === files.length - 1 || disabled}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    disabled={disabled}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 disabled:opacity-30 transition-colors"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
