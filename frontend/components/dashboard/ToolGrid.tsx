'use client'

import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { TOOLS } from '@/lib/constants';
import { IllustrationLogging } from '@/components/illustrations/IllustrationLogging';
import { IllustrationROI } from '@/components/illustrations/IllustrationROI';
import { IllustrationExperiment } from '@/components/illustrations/IllustrationExperiment';
import { IllustrationTeam } from '@/components/illustrations/IllustrationTeam';

const getIllustration = (id: string) => {
  switch (id) {
    case 'logging': return <IllustrationLogging />;
    case 'roi': return <IllustrationROI />;
    case 'experiment': return <IllustrationExperiment />;
    case 'team': return <IllustrationTeam />;
    default: return null;
  }
};

export const ToolGrid = ({ onSelect }: { onSelect: (id: string) => void }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[900px] mx-auto mt-16 px-4">
      {TOOLS.map((tool, idx) => (
        <motion.button
          key={tool.id}
          type="button"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + idx * 0.1, duration: 0.8 }}
          onClick={() => onSelect(tool.id)}
          className="group relative flex flex-col p-6 rounded-[2rem] bg-[#0a0a0a]/60 backdrop-blur-2xl border border-[#7f8c8d]/20 transition-all duration-500 cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(255,49,49,0.05)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_40px_60px_rgba(0,0,0,0.9),_0_0_40px_rgba(255,255,255,0.15)] hover:border-white/40 text-left w-full appearance-none"
        >
          <div className="flex justify-between items-start mb-6">
            <tool.icon className="w-6 h-6 text-[#7f8c8d] group-hover:text-white transition-colors" />
            <div className="w-10 h-10 rounded-full bg-[#050505] border border-[#7f8c8d]/30 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
              <ArrowUpRight className="w-5 h-5 text-[#7f8c8d] group-hover:text-black transition-all duration-300" />
            </div>
          </div>

          <h3 className="font-brand font-bold text-[1.4rem] text-center text-[#7f8c8d] group-hover:text-white uppercase tracking-[0.1em] mb-4 transition-colors drop-shadow-md">
            {tool.name}
          </h3>

          <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-radial from-[#FF3131]/20 to-transparent blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative w-full h-40 bg-black/40 rounded-2xl border border-[#7f8c8d]/20 overflow-hidden flex items-center justify-center">
              {getIllustration(tool.id)}
            </div>
          </div>

          <p className="font-sans text-[#7f8c8d] text-[0.85rem] mt-4 text-center leading-relaxed tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
            {tool.desc}
          </p>
        </motion.button>
      ))}
    </div>
  );
};
