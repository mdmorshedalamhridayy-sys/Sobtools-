import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const { t } = useLanguage();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-400 mb-6 flex-wrap gap-1.5">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-indigo-400 transition-colors py-1"
        title={t('home')}
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('home')}</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            {isLast || !item.to ? (
              <span className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-indigo-400 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
