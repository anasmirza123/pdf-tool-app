import React from 'react';
import { BookOpen, Calendar, Clock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { BLOG_POSTS } from '../config/blog';

interface BlogPageProps {
  currentSlug?: string;
  onNavigate: (path: string) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ currentSlug, onNavigate }) => {
  // If viewing a specific article
  const activePost = BLOG_POSTS.find((p) => p.slug === currentSlug);

  if (activePost) {
    return (
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <button
          onClick={() => onNavigate('/blog')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Guides & Articles
        </button>

        <header className="space-y-4 border-b border-slate-800 pb-8">
          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            {activePost.category}
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {activePost.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {activePost.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {activePost.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {activePost.readTime}
            </span>
          </div>
        </header>

        {/* Article Body */}
        <div className="space-y-5 text-sm sm:text-base leading-relaxed text-slate-300">
          {activePost.content.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Tool Action Box */}
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-600/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Try the Free Online Tool</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Put this guide into practice with zero software download.
            </p>
          </div>
          <button
            onClick={() => onNavigate(`/${activePost.relatedToolSlug}`)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shrink-0"
          >
            Launch Tool <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </article>
    );
  }

  // Blog Directory Listing
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-indigo-400 mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Document Knowledge Base</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Guides, Tutorials & Best Practices
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Master PDF compression, document privacy, font optimization, and file conversion standards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <div
            key={post.slug}
            onClick={() => onNavigate(`/blog/${post.slug}`)}
            className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-indigo-500/50 hover:bg-slate-800/80 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="font-semibold text-indigo-400">{post.category}</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {post.description}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4 text-xs">
              <span className="text-slate-400">{post.date}</span>
              <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                Read Article <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
