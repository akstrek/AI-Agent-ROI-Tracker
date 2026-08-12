'use client'

import { motion } from 'motion/react';
import { Activity, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { LoggingView } from '@/components/views/LoggingView';
import { RoiView } from '@/components/views/RoiView';
import { ExperimentView } from '@/components/views/ExperimentView';
import { TeamView } from '@/components/views/TeamView';

export const ToolDashboard = ({ activeTool, onBack }: { activeTool: string, onBack: () => void, key?: React.Key }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="container mx-auto px-8 pt-32 min-h-screen pb-20 relative"
    >
      {/* Ambient glow — promoted to compositor layer to avoid repaints */}
      <div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FF3131]/5 blur-[120px] -z-10 pointer-events-none"
        style={{ willChange: 'transform' }}
      />

      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-end border-b border-white/5 pb-10">
          <div>
            {/* Back to dashboard — #F8FBF8 base, red on hover, arrow stays black */}
            <motion.button
              onClick={onBack}
              whileHover={{ backgroundColor: '#FF3131' }}
              whileTap={{ scale: 0.88 }}
              style={{ backgroundColor: '#F8FBF8' }}
              transition={{ duration: 0.15 }}
              className="w-10 h-10 rounded-full flex items-center justify-center mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.3)] focus:outline-none"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
            </motion.button>

            <h2 className="text-white text-5xl font-brand font-bold mb-4 tracking-tighter uppercase">{activeTool}</h2>
            <p className="text-[#7f8c8d] font-sans tracking-widest text-xs uppercase opacity-60">System Core / Active Node Synthesis</p>
          </div>
          <div className="hidden lg:flex gap-4">
            <motion.button
              type="button"
              whileHover={{
                backgroundColor: '#ffffff',
                color: '#000000',
                boxShadow: '0 0 25px rgba(255, 255, 255, 1)',
                scale: 1.05
              }}
              className="glass py-2 px-6 rounded-lg text-xs tracking-widest uppercase transition-all font-sans font-bold"
            >
              Export Data
            </motion.button>
            <button type="button" aria-label="Activity" className="p-3 bg-white text-black rounded-lg"><Activity className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="lg:hidden -mb-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full glass py-4 px-6 rounded-xl text-[10px] tracking-[0.2em] uppercase transition-all font-sans font-bold bg-white/5 border border-white/10 text-white flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            Export Data
          </motion.button>
        </div>

        {activeTool === 'logging' && <LoggingView />}
        {activeTool === 'roi' && <RoiView />}
        {activeTool === 'experiment' && <ExperimentView />}
        {activeTool === 'team' && <TeamView />}
      </div>
    </motion.div>
  );
};
