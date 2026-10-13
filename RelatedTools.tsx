import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TOOLS_CONFIG } from '../config/tools';
import { getToolIcon } from '../utils/toolIcon';

interface RelatedToolsProps {
  currentSlug: string;
  relatedSlugs: string[];
  onNavigate: (slug: string) => void;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ currentSlug, relatedSlugs, onNavigate }) => {
  // Find related tools from configuration
  let tools = TOOLS_CONFIG.filter((t) => relatedSlugs.includes(t.slug) && t.slug !== currentSlug);

  // If none configured, fallback to 4 other popular tools
  if (tools.length === 0) {
    tools = TOOLS_CONFIG.filter((t) => t.slug !== currentSlug).slice(0, 4);
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white tracking-tight">Related Document Tools</h3>
        <button
          onClick={() => onNavigate('/tools')}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          View all tools <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tools.slice(0, 4).map((tool) => {
          const Icon = getToolIcon(tool.iconName);
          return (
            <div
              key={tool.id}
              onClick={() => onNavigate(`/${tool.slug}`)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onNavigate(`/${tool.slug}`)}
              role="button"
              tabIndex={0}
              className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-indigo-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {tool.category}
                  </span>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-[11px] text-slate-400">
                {tool.shortDescription}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
