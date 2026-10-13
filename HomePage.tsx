import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { TOOLS_CONFIG, CATEGORIES_CONFIG } from '../config/tools';
import { getToolIcon } from '../utils/toolIcon';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const popularTools = TOOLS_CONFIG.filter((t) => t.popular);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="mx-auto max-w-4xl text-center px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Private In-Browser Document Processing Engine</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-tight lg:text-6xl">
            Simple Tools for Your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              PDFs and Documents
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base sm:leading-relaxed">
            Merge, split, compress, convert, rotate, and extract text from your files directly inside your browser. Fast, private, and requiring zero software installation.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/tools?cat=pdf')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore PDF Tools
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onNavigate('/tools')}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
            >
              View All Tools ({TOOLS_CONFIG.length})
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-indigo-400" /> Files processed in memory
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Instant client execution
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Zero cloud retention
            </span>
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Popular Tools</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              The most requested document and PDF utilities for daily productivity.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/tools')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Browse all {TOOLS_CONFIG.length} tools <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((tool) => {
            const Icon = getToolIcon(tool.iconName);
            return (
              <div
                key={tool.id}
                onClick={() => onNavigate(`/${tool.slug}`)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-indigo-500/50 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border border-slate-700/60">
                      {tool.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {tool.shortDescription}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Every Document Utility, One Unified Suite
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Discover specialized tooling across all document, image, and text tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CATEGORIES_CONFIG.map((cat) => {
              const catToolsCount = TOOLS_CONFIG.filter((t) => t.category === cat.id).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => onNavigate(`/tools?cat=${cat.id}`)}
                  className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                    <p className="mt-1 text-xs text-slate-400 leading-snug">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-400">
                    <span>{catToolsCount} tools</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">How It Works</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Streamlined three-step execution designed for non-technical users and professionals alike.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-white">Choose Tool & Upload</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Select your required operation and drop your PDF, image, or office document into the secure dropzone.
            </p>
          </div>

          <div className="flex flex-col items-center text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-white">Configure & Process</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Customize compression levels, page rotation, image margins, or OCR parameters and watch the live progress.
            </p>
          </div>

          <div className="flex flex-col items-center text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-white">Download Result</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Inspect your file metrics, review before-and-after savings, and download your finalized files immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Architecture Highlight */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 sm:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
                <span>Security & Privacy Built-In</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Your Documents Never Leave Your Device
              </h2>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300">
                Unlike traditional PDF conversion services that upload your private financial records, tax forms, and medical invoices to external cloud servers, DocuForge processes files directly inside your browser using modern JavaScript — with WebAssembly specifically powering the OCR engine — and HTML5 Canvas for rendering.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>No server uploads for client-side tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Temporary memory freed immediately upon download</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Protected against malicious scripts and executable exploits</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span>Processing Architecture</span>
                <span className="text-emerald-400">CLIENT-SIDE</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[11px]">
                <p className="text-indigo-400">&gt; Your file content: never uploaded or transmitted</p>
                <p className="text-indigo-400">&gt; Processing location: your browser's memory only</p>
                <p className="text-indigo-400">&gt; Engine assets (fonts, OCR model): may load from a CDN on first use</p>
                <p className="text-slate-400">&gt; In-memory data: cleared when you close or refresh the tab</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
