import React from 'react';
import { Sparkles, ShieldCheck, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-[#E6DFD5] bg-[#FAF7F2] py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B665E]">
        <div className="flex items-center space-x-2">
          <span className="font-serif font-bold text-[#141413]">ResearchMatch</span>
          <span>•</span>
          <span className="flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#C49B45]" />
            Built with Google AI Studio (Gemini)
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1F5F4A]" />
            <span>Strict anti-hallucination verification</span>
          </span>
          <span>•</span>
          <span>Oxford / Cambridge Editorial Standard</span>
        </div>
      </div>
    </footer>
  );
};
