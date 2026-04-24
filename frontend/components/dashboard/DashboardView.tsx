'use client'

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Preloader } from '@/components/Preloader';
import { BackgroundE } from '@/components/layout/BackgroundE';
import { Starfield } from '@/components/canvas/Starfield';
import { Header } from '@/components/layout/Header';
import { ToolGrid } from '@/components/dashboard/ToolGrid';
import { ToolDashboard } from '@/components/dashboard/ToolDashboard';
import { HowToUse } from '@/components/dashboard/HowToUse';
import { MobileScrollCTA } from '@/components/layout/MobileScrollCTA';

export default function DashboardView({
  loading,
  activeTool,
  setActiveTool,
  setLoading
}: {
  loading: boolean,
  activeTool: string | null,
  setActiveTool: (id: string | null) => void,
  setLoading: (l: boolean) => void
}) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setShowBanner(sessionStorage.getItem('justSignedUp') === '1');
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <div className="fixed inset-0 z-0">
        <BackgroundE isSubpage={!!activeTool} />
        <Starfield />
      </div>

      <Header activeTool={activeTool} onNavigate={(id) => setActiveTool(id)} />

      {showBanner && (
        <div className="fixed top-[100px] md:top-[120px] left-0 w-full z-[9998] flex items-center justify-center px-4 py-3 bg-[#FF3131]/10 border-b border-[#FF3131]/40 backdrop-blur-md">
          <motion.p
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-[#FF3131] font-mono font-bold text-[11px] uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(255,49,49,0.8)]"
          >
            ● Confirm Email and Login
          </motion.p>
        </div>
      )}

      <main className={`relative z-10 ${showBanner ? 'pt-[148px] md:pt-[168px]' : 'pt-[100px]'}`}>
        <AnimatePresence mode="wait">
          {!activeTool ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              className="w-full pt-24 pb-20 overflow-hidden"
            >
              <div className="w-full max-w-none px-6 md:px-16 mb-16">
                <motion.h1
                  className="text-[8vw] lg:text-[7vw] font-brand font-bold text-[#7f8c8d] leading-[0.85] tracking-tighter cursor-default transition-all duration-500 hover:text-white hover:neon-glow select-none"
                >
                  <motion.span initial={{ y: 200 }} animate={{ y: 0 }} transition={{ duration: 1, ease: "circOut" }}>Every Agent.</motion.span>
                  <br />
                  <motion.span initial={{ y: 200 }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.1, ease: "circOut" }}>Measured.</motion.span>
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="mt-10"
                >
                  <p className="text-xl text-[#7f8c8d] max-w-2xl font-light leading-relaxed">
                    The celestial ledger for decentralized labor. <br />
                    <span className="opacity-40">Real-time ROI benchmarking across every node in your intelligent network.</span>
                  </p>

                  <div className="hidden md:flex items-center gap-3 mt-6">
                    <button
                      onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
                      className="inline-flex px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300"
                    >
                      Explore Tools
                    </button>
                    <button
                      onClick={() => document.getElementById('how-to-use')?.scrollIntoView({ behavior: 'smooth' })}
                      className="inline-flex px-6 py-3 rounded-full border border-[#FF3131]/30 bg-[#FF3131]/5 backdrop-blur-xl text-[#FF3131] font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-[#FF3131]/10 hover:border-[#FF3131]/60 hover:shadow-[0_0_20px_rgba(255,49,49,0.2)] transition-all duration-300"
                    >
                      How It Works
                    </button>
                  </div>
                </motion.div>
              </div>

              <ToolGrid onSelect={setActiveTool} />
              <HowToUse onSelect={setActiveTool} />
            </motion.div>
          ) : (
            <ToolDashboard key={activeTool} activeTool={activeTool} onBack={() => setActiveTool(null)} />
          )}
        </AnimatePresence>
      </main>

      <MobileScrollCTA />
    </>
  );
}
