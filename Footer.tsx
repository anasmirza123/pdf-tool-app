import React from 'react';
import { FileText, Shield, Lock, Trash2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      {/* Privacy & Trust Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Client-First Architecture</h4>
                <p className="text-xs text-slate-400">Processing runs directly in your browser. Private by design.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Zero Document Storage</h4>
                <p className="text-xs text-slate-400">No documents or text contents are stored permanently on servers.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Strict MIME & Type Guard</h4>
                <p className="text-xs text-slate-400">Executable protection and strict security sanitization on all files.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2">
            <div
              onClick={() => onNavigate('/')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigate('/')}
              role="button"
              tabIndex={0}
              aria-label="DocuForge home"
              className="flex cursor-pointer items-center gap-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Docu<span className="text-indigo-400">Forge</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400">
              DocuForge delivers fast, private, and professional PDF, image, and document processing tools.
              Engineered for students, legal teams, accountants, and businesses worldwide.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span>Status:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Operational
              </span>
            </div>
          </div>

          {/* Column 1: PDF Tools */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">PDF Tools</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('/merge-pdf')} className="hover:text-indigo-400">Merge PDF</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/split-pdf')} className="hover:text-indigo-400">Split PDF</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/compress-pdf')} className="hover:text-indigo-400">Compress PDF</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/rotate-pdf')} className="hover:text-indigo-400">Rotate PDF</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/delete-pdf-pages')} className="hover:text-indigo-400">Delete Pages</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/reorder-pdf-pages')} className="hover:text-indigo-400">Reorder Pages</button>
              </li>
            </ul>
          </div>

          {/* Column 2: Conversion & OCR */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Convert & OCR</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('/pdf-to-word')} className="hover:text-indigo-400">PDF to Word</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/word-to-pdf')} className="hover:text-indigo-400">Word to PDF</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/pdf-to-jpg')} className="hover:text-indigo-400">PDF to JPG</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/jpg-to-pdf')} className="hover:text-indigo-400">JPG to PDF</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/image-to-text')} className="hover:text-indigo-400">Image to Text (OCR)</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/scanned-pdf-ocr')} className="hover:text-indigo-400">Scanned PDF OCR</button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Admin */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Legal & Platform</h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-indigo-400">Privacy Policy</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-indigo-400">Terms of Service</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/security')} className="hover:text-indigo-400">Security Architecture</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-indigo-400">Contact Support</button>
              </li>
              <li>
                <button onClick={() => onNavigate('/blog')} className="hover:text-indigo-400">Guides & Articles</button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800/80 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} DocuForge. Built for private, high-fidelity document workflows.
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 sm:mt-0">
            <span className="flex items-center gap-1">
              Encrypted Client Session
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
