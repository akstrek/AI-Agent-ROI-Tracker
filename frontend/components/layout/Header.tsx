'use client'

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { TOOLS, E_PATH } from '@/lib/constants';
import { Magnetic } from '@/components/layout/Magnetic';
import { UserMenu } from '@/components/layout/UserMenu';
import { useAuth } from '@/context/AuthContext';

export const Header = ({ activeTool, onNavigate }: { activeTool: string | null; onNavigate: (id: string | null) => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleNav = (id: string | null) => {
    onNavigate(id);
    router.push('/');
    setMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[9999] px-6 md:px-[4%] h-[100px] md:h-[120px] flex items-center justify-between pointer-events-none">
        <button
          type="button"
          className="flex items-center gap-[7.6px] md:gap-[11.4px] pointer-events-auto cursor-pointer group appearance-none bg-transparent text-left"
          onClick={() => handleNav(null)}
        >
          <div className="flex items-center justify-center transition-all group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter shrink-0">
            <svg viewBox="0 0 100 100" className="w-[45px] h-[45px] md:w-12 md:h-12 text-white">
              <path d={E_PATH} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-brand font-bold text-white text-[18px] md:text-[24px] tracking-[-0.05em] uppercase transition-all group-hover:tracking-[0.1em] truncate">
            {activeTool ? TOOLS.find(t => t.id === activeTool)?.label : 'ERGON'}
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-6 pointer-events-auto px-10 py-2.5 rounded-full backdrop-blur-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-6">
            {TOOLS.map((tool) => (
              <Magnetic key={tool.id}>
                <button
                  type="button"
                  onClick={() => handleNav(tool.id)}
                  className="relative cursor-pointer group flex flex-col items-center px-4 appearance-none bg-transparent text-left"
                >
                  <motion.span
                    animate={{
                      color: activeTool === tool.id ? '#ffffff' : '#7f8c8d',
                    }}
                    className={`font-sans font-bold text-[10px] tracking-[0.15em] transition-all group-hover:text-white uppercase ${activeTool === tool.id ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`}
                  >
                    {tool.name}
                  </motion.span>
                  <AnimatePresence>
                    {activeTool === tool.id && (
                      <motion.div
                        layoutId="nav-bloom-line"
                        className="absolute -bottom-4 w-full h-[1px] bg-white shadow-[0_0_15px_#fff]"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                      />
                    )}
                  </AnimatePresence>
                </button>
              </Magnetic>
            ))}
          </div>

          <div className="flex items-center gap-4 ml-6 pl-6 border-l border-white/10">
            {!user ? (
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                  onClick={() => router.push('/auth/login')}
                  className="px-5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white font-brand font-bold text-[9px] tracking-[0.2em] uppercase transition-all whitespace-nowrap"
                >
                  Log In
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: '#e5e7eb',
                  }}
                  onClick={() => router.push('/auth/signup')}
                  className="px-5 py-1.5 rounded-full bg-white text-black font-brand font-bold text-[9px] tracking-[0.2em] uppercase shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all whitespace-nowrap"
                >
                  Sign Up
                </motion.button>
              </div>
            ) : (
              <div className="scale-90">
                <UserMenu />
              </div>
            )}
          </div>
        </nav>

        <div className="lg:hidden flex items-center gap-4 pointer-events-auto relative z-[10001]">
          <button
            type="button"
            aria-label="Open menu"
            className={`flex items-center justify-center p-3 text-white glowing-btn transition-all duration-300 ${menuOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </button>
          {user && (
            <div>
              <UserMenu />
            </div>
          )}
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[10000] bg-[#0a0a0a]/90 flex flex-col items-center p-6 pt-[120px] pb-10 gap-8 pointer-events-auto overflow-y-auto"
          >
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="absolute top-10 right-10 p-3 text-white bg-white/5 border border-white/10 rounded-full backdrop-blur-xl group hover:border-white/40 active:scale-90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <X className="w-7 h-7 group-hover:scale-110 group-active:scale-95 transition-transform" />
            </motion.button>

            {TOOLS.map((tool, idx) => (
              <motion.button
                key={tool.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleNav(tool.id)}
                className="text-center w-full max-w-xs shrink-0 appearance-none bg-transparent"
              >
                <div className="text-white font-brand font-bold tracking-widest uppercase text-xl mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                  {tool.name}
                </div>
                <div className="text-[#7f8c8d] text-[10px] font-mono tracking-[0.2em] uppercase">
                  {tool.desc}
                </div>
              </motion.button>
            ))}

            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-4 w-full max-w-[280px] mt-8 pt-8 border-t border-white/10 shrink-0"
              >
                <motion.button
                  whileHover={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setMenuOpen(false); router.push('/auth/login'); }}
                  className="w-full h-14 border border-white/10 bg-white/5 text-white font-brand font-bold uppercase tracking-widest text-[10px] rounded-full backdrop-blur-md transition-all active:bg-white active:text-black"
                >
                  Log In
                </motion.button>
                <motion.button
                  whileHover={{
                    backgroundColor: '#f8fafc',
                    boxShadow: '0 0 30px rgba(255, 255, 255, 0.4)',
                    scale: 1.02
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setMenuOpen(false); router.push('/auth/signup'); }}
                  className="w-full h-14 bg-white text-black font-brand font-bold uppercase tracking-widest text-[10px] rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                >
                  Sign Up
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
