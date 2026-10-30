import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ToolDefinition } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { IconResolver } from './IconResolver';

interface ToolCardProps {
  tool: ToolDefinition;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { language } = useLanguage();

  return (
    <Link
      to={`/tools/${tool.slug}`}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/50 shadow-sm hover:shadow-indigo-500/10 hover:shadow-xl transition-all duration-200"
    >
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-500/20 transition-all">
            <IconResolver name={tool.icon} className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            {tool.popular && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Sparkles className="w-2.5 h-2.5" />
                Popular
              </span>
            )}
            <span className="p-1.5 rounded-lg text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors mb-1.5 line-clamp-1">
          {tool.name[language]}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {tool.shortDescription[language]}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          {language === 'bn' ? '১০০% ব্রাউজার প্রাইভেসি' : 'Browser Processing'}
        </span>
        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[10px]">
          {tool.category}
        </span>
      </div>
    </Link>
  );
};
