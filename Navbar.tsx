import React, { useState } from 'react';
import {
  FileText,
  Layers,
  RefreshCw,
  Image as ImageIcon,
  ScanText,
  Sliders,
  Menu,
  X,
  Search
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'PDF Tools', path: '/tools?cat=pdf', icon: Layers },
    { label: 'Converter', path: '/tools?cat=converter', icon: RefreshCw },
    { label: 'Image Tools', path: '/tools?cat=image', icon: ImageIcon },
    { label: 'OCR', path: '/tools?cat=ocr', icon: ScanText },
    { label: 'Utilities', path: '/tools?cat=utilities', icon: Sliders },
    { label: 'Blog', path: '/blog', icon: FileText }
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => handleNav('/')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNav('/')}
          role="button"
          tabIndex={0}
          aria-label="DocuForge home"
          className="flex cursor-pointer items-center gap-2.5 transition-transform hover:scale-[1.01]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 shadow-md shadow-indigo-500/20">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white">
              Docu<span className="text-indigo-400">Forge</span>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              PDF & Document Suite
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.path || (link.path.startsWith('/tools') && currentPath.includes(link.path.split('?')[1] || ''));
            return (
              <button
                key={link.label}
                onClick={() => handleNav(link.path)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-indigo-400'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 opacity-75" />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
            title="Search tools"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search tools...</span>
            <kbd className="hidden rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-400 lg:inline">⌘K</kbd>
          </button>

          <button
            onClick={() => handleNav('/tools')}
            className="hidden items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 sm:flex"
          >
            All Tools
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-6 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.path)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-indigo-400" />
                  {link.label}
                </button>
              );
            })}
            <div className="pt-2">
              <button
                onClick={() => handleNav('/tools')}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Browse All Tools
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
