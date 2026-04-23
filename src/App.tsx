/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
// Build cache bust: 4
import React, { useState, useEffect, useRef, ReactNode, MouseEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Eye, Zap, Share2, Activity, ArrowRight, ArrowUpRight, ArrowDown, ArrowUp, Menu, X, User, Layout, BarChart3, Clock, Terminal, Globe2, GitBranch } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

// New Auth & Account Components
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ResetPassword from './components/auth/ResetPassword';
import UpdatePassword from './components/auth/UpdatePassword';
import AccountPage from './components/account/AccountPage';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';

// --- Constants & Types ---
const TOOLS = [
  { id: 'logging', name: 'TASK LOGGING', label: 'TASK LOGGING & TELEMETRY', icon: Terminal, desc: 'Real-time agent telemetry.' },
  { id: 'roi', name: 'ROI SCORECARD', label: 'AI AGENT ROI SCORECARD', icon: GitBranch, desc: 'Algorithmic wealth synthesis.' },
  { id: 'experiment', name: 'A/B EXPERIMENT', label: 'A/B EXPERIMENT TERMINAL', icon: Activity, desc: 'Evolutionary node testing.' },
  { id: 'team', name: 'TEAM AGGREGATION', label: 'AGENTIC TEAM AGGREGATION', icon: Globe2, desc: 'Global cluster distribution.' },
];

export const E_PATH = "M 70 25 H 30 L 60 45 L 30 65 H 70"; // Mirror-flipped Epsilon-themed E

// --- Components ---

const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [percent, setPercent] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsDone(true), 200);
          setTimeout(onComplete, 3000); // Allow time for the "zoom" transition
          return 100;
        }
        return prev + Math.floor(Math.random() * 2) + 1;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={isDone ? { 
        scale: 20, 
        opacity: [1, 1, 0],
        transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] } 
      } : {}}
      className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center pointer-events-none overflow-hidden"
    >
      <div className="relative w-64 h-64">
        {/* Glow Trail Effect */}
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 filter blur-xl opacity-40">
           <motion.path
            d={E_PATH}
            fill="none"
            stroke="white"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: [0.65, 0, 0.35, 1] }}
          />
        </svg>

        {/* Main Wireframe */}
        <svg viewBox="0 0 100 100" className="w-full h-full relative">
          <motion.path
            d={E_PATH}
            fill="none"
            stroke="#7f8c8d"
            strokeWidth="0.5"
            className="opacity-20"
          />
          <motion.path
            d={E_PATH}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: [0.65, 0, 0.35, 1] }}
            className="drop-shadow-[0_0_8px_rgba(255,255,255,1)]"
          />
        </svg>
      </div>

      {/* Flickering Counter */}
      <motion.div 
        animate={{ opacity: [0.3, 0.7, 0.4, 1] }}
        transition={{ duration: 0.1, repeat: Infinity }}
        className="absolute bottom-10 right-10 flex flex-col items-end gap-1"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">Calibration Protocol</span>
        <span className="font-mono text-[18px] text-white tracking-widest">{percent.toString().padStart(3, '0')}%</span>
      </motion.div>
    </motion.div>
  );
};

export const BackgroundE = ({ isSubpage }: { isSubpage: boolean }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Springs for buttery smooth 3D reaction
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });

  // 3D rotation based on mouse position relative to center
  const rotateX = useTransform(springY, [-1, 1], [30, -30]);
  const rotateY = useTransform(springX, [-1, 1], [-30, 30]);
  
  // Parallax shift for reactive depth
  const shiftX = useTransform(springX, [-1, 1], [-40, 40]);
  const shiftY = useTransform(springY, [-1, 1], [-40, 40]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize values between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove as any);
    return () => window.removeEventListener('mousemove', handleMouseMove as any);
  }, [mouseX, mouseY]);

  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center perspective-[2500px] transition-all duration-1500 ${isSubpage ? 'opacity-30 scale-125 blur-xl' : 'opacity-100 scale-100'}`}
    >
      <motion.div
        style={{ rotateX, rotateY, x: shiftX, y: shiftY }}
        className="relative w-[85vw] h-[85vw] max-w-[1400px] max-h-[1400px]"
      >
        {/* Neon Base Glow */}
        <motion.div 
          animate={{ opacity: 0.05, scale: 1.3 }}
          className="absolute inset-0 blur-[100px] bg-white rounded-full transition-all duration-1000" 
        />
        
        <motion.div
          animate={{
            rotateY: [0, 8, -8, 0],
            rotateX: [0, -5, 5, 0],
            scale: 1.05,
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full relative"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <filter id="neon-bloom">
                <feGaussianBlur stdDeviation="0.1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* "Threads" Animation: Many moving segments */}
            {[...Array(12)].map((_, i) => (
              <motion.path
                key={i}
                d={E_PATH}
                fill="none"
                stroke="white"
                strokeWidth={0.5 + i * 0.15}
                strokeDasharray="15 35"
                initial={{ strokeDashoffset: 0 }}
                animate={{ 
                  strokeDashoffset: [0, -100],
                  opacity: [0, 0.2 - i * 0.02, 0],
                  scale: [1, 1 + i * 0.03, 1],
                }}
                transition={{
                  duration: 4 + i * 0.6,
                  repeat: Infinity,
                  ease: "linear"
                }}
                filter="url(#neon-bloom)"
              />
            ))}

            {/* Main Body: Constant Neon White */}
            <motion.path
              d={E_PATH}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.5}
              opacity={0.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_2.2px_rgba(255,255,255,0.22)]"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    const stars = Array.from({ length: 250 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      baseR: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
    }));

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      
      stars.forEach(star => {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;

        const dist = Math.hypot(mouse.x - star.x, mouse.y - star.y);
        const radius = dist < 200 ? star.baseR + (200 - dist) * 0.015 : star.baseR;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        
        if (dist < 200) {
           ctx.shadowBlur = 15;
           ctx.shadowColor = '#ffffff';
           ctx.fillStyle = '#ffffff';
        } else {
           ctx.shadowBlur = 0;
           ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        }
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for next items
      });

      // Draw soft glow brush at mouse
      ctx.beginPath();
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 150);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-2] pointer-events-none bg-[#0a0a0a]">
      <canvas ref={canvasRef} className="w-full h-full opacity-60" />
    </div>
  );
};

const Magnetic = ({ children }: { children: ReactNode, key?: React.Key }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.4);
    y.set((clientY - centerY) * 0.4);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove as any}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

const Header = ({ activeTool, activeModel, onNavigate }: { activeTool: string | null; activeModel: string; onNavigate: (id: string | null) => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNav = (id: string | null) => {
    onNavigate(id);
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[9999] px-6 md:px-[4%] h-[100px] md:h-[120px] flex items-center justify-between pointer-events-none">
        <div 
          className="flex items-center gap-[7.6px] md:gap-[11.4px] pointer-events-auto cursor-pointer group" 
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
        </div>

        <nav className="hidden lg:flex items-center gap-6 pointer-events-auto px-10 py-2.5 rounded-full backdrop-blur-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-6">
            {TOOLS.map((tool) => (
              <Magnetic key={tool.id}>
                <div
                  onClick={() => handleNav(tool.id)}
                  className="relative cursor-pointer group flex flex-col items-center px-4"
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
                </div>
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
                  onClick={() => navigate('/auth/login')}
                  className="px-5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white font-brand font-bold text-[9px] tracking-[0.2em] uppercase transition-all whitespace-nowrap"
                >
                  Log In
                </motion.button>
                <motion.button 
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: '#e5e7eb',
                  }}
                  onClick={() => navigate('/auth/signup')}
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
            className={`flex items-center justify-center p-3 text-white glowing-btn transition-all duration-300 ${menuOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </button>
          {/* Mobile Authenticated User Icon on the RIGHT */}
          {user && (
            <div>
              <UserMenu />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[10000] bg-[#0a0a0a]/90 flex flex-col items-center p-6 pt-[120px] pb-10 gap-8 pointer-events-auto overflow-y-auto"
          >
            {/* Dedicated Close Button inside Overlay */}
            <motion.button 
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="absolute top-10 right-10 p-3 text-white bg-white/5 border border-white/10 rounded-full backdrop-blur-xl group hover:border-white/40 active:scale-90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              <X className="w-7 h-7 group-hover:scale-110 group-active:scale-95 transition-transform" />
            </motion.button>

            {TOOLS.map((tool, idx) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleNav(tool.id)}
                className="text-center w-full max-w-xs shrink-0"
              >
                <div className="text-white font-brand font-bold tracking-widest uppercase text-xl mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                  {tool.name}
                </div>
                <div className="text-[#7f8c8d] text-[10px] font-mono tracking-[0.2em] uppercase">
                  {tool.desc}
                </div>
              </motion.div>
            ))}

            {/* Mobile Unauth Buttons INSIDE */}
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
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                  }}
                  onClick={() => { setMenuOpen(false); navigate('/auth/login'); }}
                  className="w-full h-14 border border-white/10 bg-white/5 text-white font-brand font-bold uppercase tracking-widest text-[10px] rounded-full backdrop-blur-md transition-all"
                >
                  Log In
                </motion.button>
                <motion.button 
                  whileHover={{ 
                    backgroundColor: '#e5e7eb',
                    scale: 0.98
                  }}
                  onClick={() => { setMenuOpen(false); navigate('/auth/signup'); }}
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

const ToolDashboard = ({ activeTool, onBack }: { activeTool: string, onBack: () => void, key?: React.Key }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="container mx-auto px-8 pt-32 min-h-screen pb-20 relative"
    >
      {/* Tool-specific background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#FF3131]/5 blur-[120px] -z-10 pointer-events-none" />
      
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex justify-between items-end border-b border-white/5 pb-10">
          <div>
            <h2 className="text-white text-5xl font-brand font-bold mb-4 tracking-tighter uppercase">{activeTool}</h2>
            <p className="text-[#7f8c8d] font-sans tracking-widest text-xs uppercase opacity-60">System Core / Active Node Synthesis</p>
          </div>
          <div className="flex gap-4">
            <motion.button 
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
            <button className="p-3 bg-white text-black rounded-lg"><Activity className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Dynamic Content Mapping */}
        {activeTool === 'logging' && <LoggingView />}
        {activeTool === 'roi' && <RoiView />}
        {activeTool === 'experiment' && <ExperimentView />}
        {activeTool === 'team' && <TeamView />}
      </div>
    </motion.div>
  );
};

const LoggingView = () => {
  const [isAi, setIsAi] = useState(true);
  const [complete, setComplete] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Card 1: Task Input */}
      <div className="lg:col-span-1 bg-[#0a0a0a]/40 backdrop-blur-xl p-8 rounded-2xl border border-[#7f8c8d]/20 flex flex-col hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-500">
        <h3 className="text-white text-[11px] font-mono mb-8 uppercase tracking-[0.2em]">Command Terminal</h3>
        <form className="space-y-6 flex-1 flex flex-col">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Task Descriptor</label>
            <input type="text" placeholder="CRITICAL OVERRIDE..." className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Node Assign</label>
              <select className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white transition-all font-mono text-sm appearance-none cursor-pointer">
                <option>Ergon-Prime</option>
                <option>Synth-01</option>
                <option>Ghost-Node</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Priority</label>
              <select className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white transition-all font-mono text-sm appearance-none cursor-pointer">
                <option>CRITICAL</option>
                <option>HIGH</option>
                <option>DEFAULT</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Mode</label>
              <div className="flex bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 rounded-lg p-1 h-[54px]">
                <button type="button" onClick={() => setIsAi(true)} className={`flex-1 text-[9px] font-bold tracking-[0.1em] uppercase rounded flex items-center justify-center transition-all ${isAi ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-[#7f8c8d] hover:text-white'}`}>AI-Assist</button>
                <button type="button" onClick={() => setIsAi(false)} className={`flex-1 text-[9px] font-bold tracking-[0.1em] uppercase rounded flex items-center justify-center transition-all ${!isAi ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-[#7f8c8d] hover:text-white'}`}>Human</button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Time (Mins)</label>
              <input type="number" placeholder="0" className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all font-mono text-sm h-[54px]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Experiment Link</label>
              <select className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-4 rounded-lg text-white outline-none focus:border-white transition-all font-mono text-sm appearance-none cursor-pointer h-[54px]">
                <option>None (Control)</option>
                <option>Alpha - Flow A</option>
                <option>Beta - Flow B</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Status</label>
              <div 
                onClick={() => setComplete(!complete)}
                className={`w-full border p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all h-[54px] ${complete ? 'bg-[#FF3131]/20 border-[#FF3131] shadow-[0_0_15px_rgba(255,49,49,0.2)]' : 'bg-[#0a0a0a]/50 border-[#7f8c8d]/30 hover:border-white'}`}
              >
                <span className={`text-[10px] font-mono tracking-widest ${complete ? 'text-[#FF3131]' : 'text-[#7f8c8d]'}`}>{complete ? 'COMPLETED' : 'PENDING'}</span>
                <div className={`w-3 h-3 rounded-full border border-current ${complete ? 'bg-[#FF3131]' : 'bg-transparent'}`} />
              </div>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-auto bg-gradient-to-b from-white to-[#a0a0a0] text-black py-4 rounded-lg font-bold tracking-[0.2em] uppercase text-[10px] shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] transition-all flex-shrink-0"
          >
            Execute Log
          </motion.button>
        </form>
      </div>

      <div className="lg:col-span-2 flex flex-col gap-8">
        {/* Card 2: Efficiency Yield */}
        <div className="bg-[#0a0a0a]/40 backdrop-blur-xl p-10 rounded-2xl border border-[#7f8c8d]/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h3 className="text-white text-[11px] font-mono mb-2 uppercase tracking-[0.2em]">Efficiency Yield</h3>
            <p className="text-7xl text-white font-brand font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-tighter">94.2<span className="text-3xl text-[#7f8c8d]">%</span></p>
          </div>
          <div className="flex items-end gap-3 h-32 w-full md:w-auto flex-1 md:flex-none justify-end">
             {[30, 45, 35, 60, 50, 95].map((val, i, arr) => (
                <div key={i} className="relative w-8 h-full flex items-end">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                    className={`w-full rounded-t-sm ${i === arr.length - 1 ? 'bg-white shadow-[0_0_25px_rgba(255,255,255,0.9)]' : 'bg-white/10'}`}
                  />
                </div>
             ))}
          </div>
        </div>

        {/* Card 3: ROI Velocity */}
        <div className="bg-[#0a0a0a]/40 backdrop-blur-xl p-10 rounded-2xl border border-[#7f8c8d]/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-500 flex-1 flex flex-col">
          <h3 className="text-white text-[11px] font-mono mb-6 uppercase tracking-[0.2em]">Aggregated ROI Velocity</h3>
          <div className="flex-1 relative w-full h-[180px]">
             {/* Glowing Sparkline SVG */}
             <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                <defs>
                   <linearGradient id="line-glow" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#FF3131" stopOpacity="0.3" />
                       <stop offset="100%" stopColor="#FF3131" stopOpacity="0" />
                   </linearGradient>
                </defs>
                <motion.path 
                  d="M 0 35 L 10 30 L 20 32 L 30 15 L 40 20 L 50 10 L 60 12 L 70 5 L 80 8 L 90 2 L 100 6" 
                  fill="none" 
                  stroke="#FF3131" 
                  strokeWidth="1" 
                  className="drop-shadow-[0_0_10px_rgba(255,49,49,1)]"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path 
                  d="M 0 35 L 10 30 L 20 32 L 30 15 L 40 20 L 50 10 L 60 12 L 70 5 L 80 8 L 90 2 L 100 6 L 100 40 L 0 40 Z" 
                  fill="url(#line-glow)" 
                  opacity="0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ duration: 1, delay: 1 }}
                />
             </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoiView = () => {
  const [period, setPeriod] = useState('Weekly');
  const agents = ['Ergon-Prime', 'Synth-01', 'Ghost-Node'];

  return (
    <div className="bg-[#0a0a0a]/40 backdrop-blur-xl p-10 rounded-3xl border border-[#7f8c8d]/20 min-h-[600px] relative overflow-hidden flex flex-col hover:shadow-[0_0_40px_rgba(255,255,255,0.08)] transition-all duration-500">
      
      {/* Header & Controls */}
      <div className="flex justify-between items-center z-20 mb-12">
        <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] max-w-xs">Scorecard Metrics</h3>
        <div className="flex bg-[#0a0a0a]/80 border border-[#7f8c8d]/30 rounded-lg p-1 backdrop-blur-md">
          {['Daily', 'Weekly', 'Monthly'].map(p => (
            <button 
              key={p} 
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 text-[9px] font-bold tracking-widest uppercase rounded transition-all ${p === period ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-[#7f8c8d] hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      
      {/* Background Generative Lines to Agent Names */}
      <div className="absolute inset-0 pointer-events-none z-0 p-10">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {agents.map((agent, idx) => {
             // Create positions for lines to pulse inward
             const startY = 20 + idx * 30;
             const pathObj = `M 0 ${startY} C 30 ${startY}, 70 50, 100 50`;
             return (
                <g key={agent}>
                  <text x="-5" y={startY - 2} fill="#7f8c8d" fontSize="2" textAnchor="end" className="font-mono tracking-widest">{agent}</text>
                  <path d={pathObj} stroke="#7f8c8d" strokeWidth="0.1" fill="none" opacity="0.3" />
                  <motion.path 
                    d={pathObj} 
                    stroke="#FF3131" 
                    strokeWidth="0.3" 
                    fill="none" 
                    strokeDasharray="5 15"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(255,49,49,1)]"
                    animate={{ strokeDashoffset: [0, -40] }}
                    transition={{ duration: 3 + Math.random(), repeat: Infinity, ease: "linear" }}
                  />
                  <circle cx="0" cy={startY} r="0.5" fill="#ffffff" />
                </g>
             );
          })}
        </svg>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 flex-1">
        
        {/* Avg Time Saved */}
        <div className="bg-[#0a0a0a]/70 border border-[#7f8c8d]/30 p-8 rounded-2xl backdrop-blur-xl hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7f8c8d]">Avg Time Saved</p>
          <motion.p 
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl text-white font-brand font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] tracking-tighter"
          >
            42<span className="text-3xl text-[#7f8c8d] ml-1">m</span>
          </motion.p>
        </div>

        {/* Completion Rate Delta */}
        <div className="bg-[#0a0a0a]/70 border border-[#7f8c8d]/30 p-8 rounded-2xl backdrop-blur-xl hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between overflow-hidden relative">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7f8c8d] relative z-10">Completion Rate Delta</p>
          <div className="flex items-center gap-4 relative z-10 mt-6">
             <motion.div 
               animate={{ y: [0, -8, 0] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF3131" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(255,49,49,1)]">
                   <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
             </motion.div>
             <p className="text-6xl text-[#FF3131] font-brand font-bold drop-shadow-[0_0_15px_rgba(255,49,49,0.4)] tracking-tighter">+14.2%</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
             <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#FF3131" strokeWidth="1">
                <path d="M12 19V5M5 12l7-7 7 7"/>
             </svg>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-[#0a0a0a]/70 border border-[#7f8c8d]/30 p-8 rounded-2xl backdrop-blur-xl hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7f8c8d] mb-4">Trend (Trailing)</p>
          <div className="w-full h-[120px] relative">
             <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                <motion.path 
                  d="M 0 35 L 15 25 L 30 30 L 45 15 L 60 20 L 75 10 L 100 5" 
                  fill="none" 
                  stroke="#ffffff" 
                  strokeWidth="1.5" 
                  className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
             </svg>
          </div>
        </div>

        {/* Total Hours Saved */}
        <div className="bg-[#0a0a0a]/70 border border-[#7f8c8d]/30 p-8 rounded-2xl backdrop-blur-xl hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between items-end text-right">
           <p className="text-[10px] uppercase tracking-[0.2em] text-[#7f8c8d] w-full text-left">Total Hours Saved</p>
           <p className="text-7xl text-white font-brand font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] tracking-tighter mt-6">
             1,402
           </p>
        </div>

      </div>
    </div>
  );
};

const ExperimentView = () => {
  const [status, setStatus] = useState<'Running' | 'Paused' | 'Completed'>('Running');
  const conditions = [
    { id: 'alpha', name: 'Alpha - Node 1', count: 1204, time: '2.1s', rate: '98.2%' },
    { id: 'beta', name: 'Beta - Synth B', count: 1198, time: '1.4s', rate: '99.1%' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Column 1: Creation & Sync Rate */}
      <div className="lg:col-span-1 flex flex-col gap-8">
        <div className="bg-[#0a0a0a]/40 backdrop-blur-xl p-8 rounded-3xl border border-[#7f8c8d]/20 flex flex-col hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-500">
           <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] mb-6">Create Experiment</h3>
           <form className="space-y-5">
              <div className="space-y-2">
                 <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Experiment Name</label>
                 <input type="text" placeholder="Protocol Omega..." className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-3 rounded-lg text-white font-mono text-sm outline-none focus:border-white transition-all" />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Start Date</label>
                 <input type="date" className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-3 rounded-lg text-white font-mono text-sm outline-none focus:border-white transition-all" />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Condition Assignment</label>
                 <select className="w-full bg-[#0a0a0a]/50 border border-[#7f8c8d]/30 p-3 rounded-lg text-white font-mono text-sm outline-none focus:border-white transition-all cursor-pointer">
                    <option>Latency Factor C</option>
                    <option>Yield Threshold</option>
                    <option>Strict Mode</option>
                 </select>
              </div>
              <motion.button 
                type="button"
                whileHover={{scale: 1.02}} 
                whileTap={{scale: 0.98}}
                className="w-full bg-white text-black py-4 rounded-lg font-bold uppercase text-[10px] tracking-[0.2em] mt-2 shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.8)] transition-all"
              >Deploy Set</motion.button>
           </form>
        </div>

        <div className="bg-[#0a0a0a]/40 backdrop-blur-xl p-8 rounded-3xl border border-[#7f8c8d]/20 flex flex-col justify-center flex-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-500">
          <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] mb-8">Network Sync Rate</h3>
          <p className="text-6xl text-white font-brand font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.7)] tracking-tighter mb-8">99.98<span className="text-2xl text-[#7f8c8d]">%</span></p>
          
          <div className="w-full bg-[#7f8c8d]/20 h-2 rounded-full overflow-hidden relative">
             <motion.div 
               className="absolute top-0 left-0 h-full bg-white shadow-[0_0_15px_white]"
               initial={{ width: "0%" }}
               animate={{ width: "99.98%" }}
               transition={{ duration: 2.5, ease: "circOut" }}
             />
          </div>
        </div>
      </div>

      {/* Column 2: Results Data Grid */}
      <div className="lg:col-span-2 bg-[#0a0a0a]/40 backdrop-blur-xl p-10 rounded-3xl border border-[#7f8c8d]/20 min-h-[500px] relative overflow-hidden flex flex-col hover:shadow-[0_0_30px_rgba(255,49,49,0.05)] transition-all duration-500">
        
        <div className="flex justify-between items-start mb-12">
           <div>
             <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] mb-2">Live Experiment Results</h3>
             <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${status === 'Running' ? 'bg-[#FF3131] text-[#FF3131] animate-pulse' : status === 'Paused' ? 'bg-[#7f8c8d] text-[#7f8c8d]' : 'bg-white text-white'}`} />
               <p className="text-[10px] text-[#7f8c8d] font-mono uppercase tracking-widest">Status: <span className="text-white">{status}</span></p>
             </div>
           </div>
           
           <motion.button 
             onClick={() => setStatus(status === 'Running' ? 'Paused' : 'Running')}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className={`border px-8 py-3 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all z-20 ${status === 'Running' ? 'border-[#FF3131] text-[#FF3131] shadow-[0_0_20px_rgba(255,49,49,0.2)] hover:bg-[#FF3131] hover:text-black' : 'border-white text-white hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'}`}
           >
             {status === 'Running' ? 'Halt Experiment' : 'Resume Protocol'}
           </motion.button>
        </div>

        {/* Illustrative Data Grid */}
        <div className="flex-1 flex flex-col gap-6">
           <div className="grid grid-cols-4 gap-4 px-6 border-b border-[#7f8c8d]/20 pb-4">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">Condition</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d] text-right">Task Count</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d] text-right">Avg Time</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d] text-right">Completion Rate</span>
           </div>

           {conditions.map((cond, idx) => (
             <div key={cond.id} className="grid grid-cols-4 gap-4 items-center bg-black/40 border border-[#7f8c8d]/10 p-6 rounded-2xl hover:border-white/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-8 rounded-full ${idx === 0 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-[#FF3131] shadow-[0_0_10px_#FF3131]'}`} />
                  <span className="font-mono text-sm text-white">{cond.name}</span>
                </div>
                <div className="text-right font-brand text-2xl text-white">{cond.count}</div>
                <div className="text-right font-brand text-2xl text-white">{cond.time}</div>
                <div className="text-right font-brand text-2xl text-[#FF3131] drop-shadow-[0_0_10px_rgba(255,49,49,0.5)]">{cond.rate}</div>
             </div>
           ))}

           {/* Stylized visual backdrop for grid to break "table" look */}
           <div className="mt-auto px-6 pt-10">
              <svg className="w-full h-[60px]" preserveAspectRatio="none" viewBox="0 0 100 20">
                 <path d="M 0 10 Q 25 0 50 10 T 100 10" fill="none" stroke="#7f8c8d" strokeWidth="0.2" strokeDasharray="1 3" />
                 <path d="M 0 15 Q 25 25 50 15 T 100 15" fill="none" stroke="#FF3131" strokeWidth="0.2" opacity="0.5" />
                 <motion.circle 
                   cx="50" cy="10" r="1" fill="#white" 
                   className="drop-shadow-[0_0_5px_white]"
                   animate={{ cx: ["10%", "90%", "10%"] }} 
                   transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 />
              </svg>
           </div>
        </div>

      </div>
    </div>
  );
};

const TeamView = () => {
  const members = [
    { id: 1, name: 'Synth-01', type: 'AI Sub-Node', avgTime: '12m', compRate: '+4.2%', hrs: 124, trend: [20, 30, 25, 45, 60] },
    { id: 2, name: 'Ghost-Node', type: 'Shadow Agent', avgTime: '8m', compRate: '+1.5%', hrs: 89, trend: [10, 15, 20, 18, 30] },
    { id: 3, name: 'Cerebra-X', type: 'Logic Engine', avgTime: '34m', compRate: '+12.1%', hrs: 420, trend: [40, 50, 45, 80, 95] },
    { id: 4, name: 'Ergon-Prime', type: 'Primary Core', avgTime: '42m', compRate: '+14.2%', hrs: 1402, trend: [80, 90, 85, 120, 140] },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner for Aggregation / Unassigned Tasks */}
      <div className="bg-[#0a0a0a]/40 backdrop-blur-xl p-8 rounded-3xl border border-[#7f8c8d]/20 flex flex-col md:flex-row justify-between items-center hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all gap-8">
         <div>
           <h3 className="text-white text-[11px] font-mono uppercase tracking-[0.2em] mb-2">Cluster Status</h3>
           <p className="text-3xl text-white font-brand font-bold drop-shadow-[0_0_15px_white] tracking-tighter">4 Active Nodes</p>
         </div>
         <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7f8c8d] mb-1">Total Hrs Saved</p>
              <p className="text-4xl text-white font-brand font-bold drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">2,035</p>
            </div>
            <div className="hidden sm:block w-[1px] h-12 bg-[#7f8c8d]/20" />
            <div className="flex-1 md:flex-none flex justify-between md:justify-end items-center bg-[#0a0a0a]/80 py-4 px-6 border border-[#FF3131]/40 rounded-2xl shadow-[0_0_20px_rgba(255,49,49,0.15)] glow-card">
              <div className="text-left md:text-right mr-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#FF3131] mb-1 drop-shadow-[0_0_5px_rgba(255,49,49,0.8)] font-bold">Unassigned Tasks</p>
                <p className="text-4xl text-[#FF3131] font-brand font-bold drop-shadow-[0_0_15px_rgba(255,49,49,0.8)]">14</p>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-4 h-4 rounded-full bg-[#FF3131] shadow-[0_0_15px_#FF3131] border-2 border-white/50" 
              />
            </div>
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {members.map(m => (
          <div key={m.id} className="bg-[#0a0a0a]/40 backdrop-blur-xl p-8 rounded-3xl border border-[#7f8c8d]/20 flex flex-col hover:border-white/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all group">
             <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-2xl text-white font-bold font-brand mb-1 tracking-tighter">{m.name}</h4>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#7f8c8d]">{m.type}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-[#7f8c8d]/30 flex items-center justify-center p-2.5 group-hover:border-white group-hover:shadow-[0_0_15px_white] transition-all bg-[#0a0a0a]/50">
                   <User className="text-[#7f8c8d] group-hover:text-white transition-all w-full h-full" />
                </div>
             </div>
             
             {/* Micro-metrics */}
             <div className="grid grid-cols-3 gap-4 mb-8 bg-black/40 p-4 rounded-xl border border-[#7f8c8d]/10">
                <div>
                   <p className="text-[8px] uppercase tracking-[0.15em] text-[#7f8c8d] mb-1">Avg Time</p>
                   <p className="text-xl text-white font-brand font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{m.avgTime}</p>
                </div>
                <div>
                   <p className="text-[8px] uppercase tracking-[0.15em] text-[#7f8c8d] mb-1">Delta</p>
                   <p className="text-xl text-[#FF3131] font-brand font-bold drop-shadow-[0_0_5px_rgba(255,49,49,0.5)]">{m.compRate}</p>
                </div>
                <div>
                   <p className="text-[8px] uppercase tracking-[0.15em] text-[#7f8c8d] mb-1">Hours</p>
                   <p className="text-xl text-white font-brand font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{m.hrs}</p>
                </div>
             </div>

             {/* Minimalist graph */}
             <div className="w-full h-16 mt-auto relative bg-[#0a0a0a] border border-[#7f8c8d]/10 rounded-lg overflow-hidden flex items-end p-2 gap-1.5">
                <div className="absolute top-2 left-2 text-[8px] uppercase tracking-[0.2em] text-[#7f8c8d] z-10">Weekly Trend</div>
                {m.trend.map((val, i, arr) => {
                   const max = Math.max(...arr);
                   const height = (val / max) * 100;
                   return (
                     <div key={i} className="flex-1 rounded-sm relative flex items-end h-full">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${height}%` }}
                         transition={{ duration: 1, delay: i * 0.1 }}
                         className={`w-full rounded-sm ${i === arr.length - 1 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-[#7f8c8d]/30 group-hover:bg-[#7f8c8d]/50 transition-colors'}`} 
                       />
                     </div>
                   );
                })}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const IllustrationLogging = () => (
  <svg viewBox="0 0 200 100" className="w-full h-full opacity-80">
    {[...Array(4)].map((_, i) => (
      <g key={i} transform={`translate(35, ${15 + i * 20})`}>
        <rect x="0" y="0" width="10" height="10" rx="2" fill="none" stroke="#7f8c8d" strokeWidth="1" opacity="0.5" />
        <motion.path 
          d="M2,5 L4,8 L8,2" 
          fill="none" stroke="#FF3131" strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: i * 0.4, repeat: Infinity, repeatDelay: 1.5 }}
        />
        <line x1="20" y1="5" x2="35" y2="5" stroke="#7f8c8d" strokeWidth="1" strokeDasharray="1 2" opacity="0.3" />
        <motion.line 
          x1="40" y1="5" x2="130" y2="5" 
          stroke="#FF3131" strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: i * 0.4 + 0.2, repeat: Infinity, repeatDelay: 1.5 }}
          className="drop-shadow-[0_0_4px_#FF3131]"
        />
      </g>
    ))}
  </svg>
);

const IllustrationROI = () => (
  <svg viewBox="0 0 200 100" className="w-full h-full opacity-90 overflow-visible">
    <circle cx="100" cy="50" r="35" fill="none" stroke="#7f8c8d" strokeWidth="1" opacity="0.3" />
    <motion.circle 
      cx="100" cy="50" r="35" 
      fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"
      transform="rotate(-90 100 50)"
      strokeDasharray="220"
      initial={{ strokeDashoffset: 220 }}
      animate={{ strokeDashoffset: [220, 0, 220] }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      className="drop-shadow-[0_0_12px_#FF3131]"
    />
    <motion.text 
      x="100" y="54" 
      textAnchor="middle" fill="#FF3131" fontSize="12" fontFamily="monospace" fontWeight="bold"
      animate={{ opacity: [0.3, 1, 0.3] }} 
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      className="drop-shadow-[0_0_8px_#FF3131]"
    >
      99%
    </motion.text>
  </svg>
);

const IllustrationExperiment = () => (
  <svg viewBox="0 0 200 100" className="w-full h-full opacity-80">
    <rect x="30" y="15" width="60" height="70" rx="4" fill="none" stroke="#7f8c8d" strokeWidth="1" opacity="0.3"/>
    <rect x="110" y="15" width="60" height="70" rx="4" fill="none" stroke="#7f8c8d" strokeWidth="1" opacity="0.3"/>
    
    {[...Array(3)].map((_, i) => (
      <line key={`a-${i}`} x1="40" y1={30 + i * 15} x2="80" y2={30 + i * 15} stroke="#7f8c8d" strokeWidth="2" opacity="0.2" strokeLinecap="round" />
    ))}
    {[...Array(3)].map((_, i) => (
      <motion.line key={`b-${i}`} x1="120" y1={30 + i * 15} x2="160" y2={30 + i * 15} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"
        animate={{ opacity: [0.1, 1, 0.1] }}
        transition={{ duration: 3, delay: 1.5, repeat: Infinity }}
        className="drop-shadow-[0_0_6px_#FF3131]"
      />
    ))}
    
    <motion.rect x="110" y="15" width="60" height="70" rx="4" fill="#FF3131" opacity="0"
      animate={{ opacity: [0, 0, 0.15, 0] }}
      transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.8, 1] }}
    />
    
    <motion.line 
      x1="20" x2="180" stroke="#FF3131" strokeWidth="1.5"
      animate={{ y1: [10, 90, 10], y2: [10, 90, 10] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      className="drop-shadow-[0_0_8px_#FF3131]"
    />
  </svg>
);

const IllustrationTeam = () => {
  const nodes = [{x: 40, y: 25}, {x: 160, y: 25}, {x: 40, y: 75}, {x: 160, y: 75}];
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full opacity-80 overflow-visible">
      <circle cx="100" cy="50" r="40" fill="none" stroke="#7f8c8d" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
      
      {nodes.map((node, i) => (
        <g key={i}>
          <line x1={node.x} y1={node.y} x2="100" y2="50" stroke="#7f8c8d" strokeWidth="1" opacity="0.3" />
          <circle cx={node.x} cy={node.y} r="4" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.5" />
          <circle cx={node.x} cy={node.y} r="2" fill="#FF3131" className="drop-shadow-[0_0_4px_#FF3131]" />
          <motion.circle r="2.5" fill="#FFFFFF"
            animate={{ cx: [node.x, 100], cy: [node.y, 50], opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity, ease: "easeIn" }}
            className="drop-shadow-[0_0_6px_#FFFFFF]"
          />
        </g>
      ))}
      
      <motion.circle cx="100" cy="50" r="8" fill="#FF3131" 
        animate={{ scale: [1, 1.2, 1] }} 
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="drop-shadow-[0_0_12px_#FF3131]"
      />
      <circle cx="100" cy="50" r="3" fill="#FFFFFF" />
    </svg>
  );
};

const ToolGrid = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const getIllustration = (id: string) => {
    switch (id) {
      case 'logging': return <IllustrationLogging />;
      case 'roi': return <IllustrationROI />;
      case 'experiment': return <IllustrationExperiment />;
      case 'team': return <IllustrationTeam />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[900px] mx-auto mt-16 px-4">
      {TOOLS.map((tool, idx) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + idx * 0.1, duration: 0.8 }}
          onClick={() => onSelect(tool.id)}
          className="group relative flex flex-col p-6 rounded-[2rem] bg-[#0a0a0a]/60 backdrop-blur-2xl border border-[#7f8c8d]/20 transition-all duration-500 cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(255,49,49,0.05)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_40px_60px_rgba(0,0,0,0.9),_0_0_40px_rgba(255,255,255,0.15)] hover:border-white/40"
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
            {/* Ambient Base Glow */}
            <div className="absolute inset-0 bg-gradient-radial from-[#FF3131]/20 to-transparent blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative w-full h-40 bg-black/40 rounded-2xl border border-[#7f8c8d]/20 overflow-hidden flex items-center justify-center">
              {getIllustration(tool.id)}
            </div>
          </div>
          
          <p className="font-sans text-[#7f8c8d] text-[0.85rem] mt-4 text-center leading-relaxed tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
            {tool.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * ProtectedRoute Component
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a smaller loader

  if (!user) {
    return <Navigate to={`/auth/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

/**
 * DashboardView
 * Encapsulates the existing state-based tool logic
 */
const DashboardView = ({ 
  loading, 
  activeTool, 
  setActiveTool, 
  activeModel,
  setLoading
}: { 
  loading: boolean, 
  activeTool: string | null, 
  setActiveTool: (id: string | null) => void,
  activeModel: string,
  setLoading: (l: boolean) => void
}) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* Layered Background System */}
      <div className="fixed inset-0 z-0">
        <BackgroundE isSubpage={!!activeTool} />
        <Starfield />
      </div>

      <Header activeTool={activeTool} activeModel={activeModel} onNavigate={(id) => setActiveTool(id)} />

      <main className="relative z-10 pt-[100px]">
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
                  
                  {/* Desktop CTA Button */}
                  <button 
                    onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
                    className="hidden md:inline-flex mt-6 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-white font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300"
                  >
                    Explore Tools
                  </button>
                </motion.div>
              </div>

              <ToolGrid onSelect={setActiveTool} />
            </motion.div>
          ) : (
            <ToolDashboard key={activeTool} activeTool={activeTool} onBack={() => setActiveTool(null)} />
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Status Badge */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-[8px] md:bottom-10 z-[9990] pointer-events-none">
        <div className="glass px-5 py-2.5 rounded-2xl border border-white/5 flex items-center gap-4 bg-black/20 backdrop-blur-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[8px] text-[#7f8c8d] tracking-[0.2em] mb-0.5 uppercase hidden md:inline-block">Powered By</span>
            <span className="font-sans text-[10px] text-white font-bold tracking-[0.15em] uppercase">Gemini</span>
          </div>
          <div className="w-[1px] h-5 bg-white/10" />
          <div className="w-[6px] h-[6px] bg-[#22c55e] rounded-full shadow-[0_0_10px_#22c55e] animate-pulse" />
        </div>
      </div>

      <MobileScrollCTA />
    </>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeModel] = useState('Ergon-Prime v1');
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#7f8c8d] font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <Routes>
        {/* Full Tool Dashboard (Public for now, following existing behavior) */}
        <Route path="/" element={
          <DashboardView 
            loading={loading} 
            activeTool={activeTool} 
            setActiveTool={setActiveTool} 
            activeModel={activeModel} 
            setLoading={setLoading}
          />
        } />
        <Route path="/dashboard" element={
          <DashboardView 
            loading={false} 
            activeTool={activeTool} 
            setActiveTool={setActiveTool} 
            activeModel={activeModel} 
            setLoading={setLoading}
          />
        } />

        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/reset" element={<ResetPassword />} />
        <Route path="/auth/update-password" element={<UpdatePassword />} />

        {/* Protected Routes */}
        <Route path="/account" element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

const MobileScrollCTA = () => {
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50;
      setAtBottom(bottom);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="md:hidden fixed bottom-24 right-6 z-[9990]">
      <button 
        onClick={() => {
          if (atBottom) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
          }
        }}
        className="glass w-12 h-12 rounded-full bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-white/10 transition-all duration-300 pointer-events-auto"
      >
        {atBottom ? <ArrowUp className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" /> : <ArrowDown className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />}
      </button>
    </div>
  );
};
