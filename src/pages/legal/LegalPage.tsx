/**
 * Shared chrome for Terms, Privacy, Contact — readable width, Kenya-focused placeholder copy.
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export const LegalPage: React.FC<LegalPageProps> = ({ title, children }) => {
  return (
    <div className="max-w-3xl mx-auto px-5 pt-28 pb-20 min-h-screen">
      <nav className="mb-8" aria-label="Breadcrumb">
        <Link
          to="/"
          className="text-[10px] font-black uppercase tracking-widest text-[#FF5500] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded"
        >
          ← Home
        </Link>
      </nav>
      <article className="glass-card rounded-[2rem] p-8 md:p-12 space-y-6 border border-white/60 shadow-xl">
        <h1 className="text-3xl md:text-4xl font-black serif italic brand-text">{title}</h1>
        <div className="text-sm text-gray-700 space-y-4 leading-relaxed">{children}</div>
      </article>
    </div>
  );
};
