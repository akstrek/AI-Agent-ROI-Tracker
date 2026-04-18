/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef, ReactNode, MouseEvent } from 'react';
import { Shield, Eye, Zap, Share2, Activity, ArrowRight, User, Layout, BarChart3, Clock } from 'lucide-react';

// --- Constants & Types ---
const TOOLS = [
  { id: 'vision', name: 'TASK LOGGING', icon: Layout, desc: 'Telemetry capture.' },
  { id: 'forge', name: 'ROI SCORECARD', icon: BarChart3, desc: 'Wealth synthesis.' },
  { id: 'nexus', name: 'A/B EXPERIMENT', icon: Activity, desc: 'Node iteration.' },
  { id: 'team', name: 'TEAM AGGREGATION', icon: User, desc: 'Cluster synergy.' },
];

const E_PATH = "M 70 25 H 30 L 60 45 L 30 65 H 70"; // Mirror-flipped Epsilon-themed E

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

const BackgroundE = ({ isSubpage }: { isSubpage: boolean }) => {
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
          animate={{ opacity: 0.25, scale: 1.3 }}
          className="absolute inset-0 blur-[160px] bg-white rounded-full transition-all duration-1000" 
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
                <feGaussianBlur stdDeviation="1.5" result="blur" />
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
                  opacity: [0, 0.9 - i * 0.05, 0],
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
              className="drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
};

const Starfield = ({ active }: { active: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<{ x: number, y: number, id: number }[]>([]);

  useEffect(() => {
    setStars(Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    })));
  }, []);

  return (
    <div className={`fixed inset-0 bg-[#050505] transition-opacity duration-1000 z-[-2] ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-full h-full overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0.1, scale: 0.8 }}
            whileHover={{ scale: 3, opacity: 1, backgroundColor: '#ffffff' }}
            className="absolute w-[1px] h-[1px] bg-white transition-all duration-300 rounded-full"
            style={{ 
              top: `${star.y}%`, 
              left: `${star.x}%`,
              boxShadow: '0 0 2px rgba(255,255,255,0.5)'
            }}
          />
        ))}
        {/* Glow brush following mouse */}
        <motion.div 
          className="pointer-events-none absolute w-64 h-64 bg-white/5 blur-[100px] rounded-full mix-blend-screen"
          style={{
            left: useSpring(useTransform(useMotionValue(0), (v: number) => v - 128)),
            top: useSpring(useTransform(useMotionValue(0), (v: number) => v - 128))
          }}
        />
      </div>
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

const Header = ({ activeTool, onNavigate }: { activeTool: string | null; onNavigate: (id: string | null) => void }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-12 h-[100px] flex items-center justify-between pointer-events-none">
      <div 
        className="flex items-center gap-6 pointer-events-auto cursor-pointer group" 
        onClick={() => onNavigate(null)}
      >
        <div className="w-12 h-12 flex items-center justify-center bg-white rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-transform group-active:scale-95">
          <svg viewBox="0 0 100 100" className="w-full h-full text-black p-2.5">
            <path d={E_PATH} fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
          </svg>
        </div>
        <span className="font-brand font-bold text-white text-[24px] tracking-[-0.05em] uppercase transition-all group-hover:tracking-[0.1em]">
          ERGON
        </span>
      </div>

      <nav className="flex items-center gap-8 pointer-events-auto borderless-glass px-12 py-3 rounded-full backdrop-blur-[40px] bg-white/[0.01]">
        {TOOLS.map((tool) => (
          <Magnetic key={tool.id}>
            <div
              onClick={() => onNavigate(tool.id)}
              className="relative cursor-pointer group flex flex-col items-center px-4"
            >
              <motion.span 
                animate={{ 
                  color: activeTool === tool.id ? '#ffffff' : '#333333',
                  opacity: activeTool === tool.id ? 1 : 0.5,
                }}
                className={`font-sans font-bold text-[10px] tracking-[0.15em] transition-all group-hover:text-white uppercase ${activeTool === tool.id ? 'nav-glow' : ''}`}
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
      </nav>

      <div className="hidden lg:flex items-center gap-4 borderless-glass bg-white/[0.02] py-2.5 px-6 rounded-full pointer-events-auto">
        <span className="font-mono text-[9px] tracking-[0.25em] text-[#7f8c8d] uppercase opacity-60">
          NODE: SYNTH-001
        </span>
        <div className="relative w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff] animate-pulse" />
      </div>
    </header>
  );
};

const ToolDashboard = ({ activeTool, onBack }: { activeTool: string, onBack: () => void, key?: React.Key }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="container mx-auto px-8 pt-32 min-h-screen pb-20"
    >
      <div className="flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex justify-between items-end border-b border-white/5 pb-10">
          <div>
            <h2 className="text-white text-5xl font-brand font-bold mb-4 tracking-tighter uppercase">{activeTool}</h2>
            <p className="text-[#7f8c8d] font-sans tracking-widest text-xs uppercase opacity-60">System Core / Active Node Synthesis</p>
          </div>
          <div className="flex gap-4">
            <button className="glass py-2 px-6 rounded-lg text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all">Export Data</button>
            <button className="p-3 bg-white text-black rounded-lg"><Activity className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Dynamic Content Mapping */}
        {activeTool === 'vision' && <VisionView />}
        {activeTool === 'forge' && <ForgeView />}
        {activeTool === 'nexus' && <NexusView />}
      </div>
    </motion.div>
  );
};

const VisionView = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Task Logging Form */}
      <div className="glass p-10 rounded-3xl border-white/5">
        <h3 className="text-white text-lg font-brand mb-8 uppercase tracking-widest">Protocol Logging</h3>
        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#7f8c8d]">Agent Identifier</label>
            <input type="text" placeholder="ERG-0092" className="w-full bg-white/2 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-white transition-all font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-[#7f8c8d]">Node Priority</label>
            <select className="w-full bg-black border border-white/5 p-4 rounded-xl text-white outline-none focus:border-white transition-all font-mono">
              <option>Prime</option>
              <option>Sub-Zero</option>
              <option>Shadow</option>
            </select>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-white text-black py-4 rounded-xl font-bold tracking-[0.2em] uppercase text-xs"
          >
            Initialize Log
          </motion.button>
        </form>
      </div>

      {/* ROI Scorecard */}
      <div className="grid grid-cols-2 gap-6">
        {[
          { label: 'Compute Yield', val: '+24.8%', icon: Zap },
          { label: 'Network Health', val: '99.9%', icon: Shield },
          { label: 'Node Latency', val: '12ms', icon: Clock },
          { label: 'User Adoption', val: '4.2k', icon: User },
        ].map((card, idx) => (
          <div key={idx} className="glass p-6 rounded-3xl border-white/5 flex flex-col justify-between group hover:border-white transition-all">
            <card.icon className="w-5 h-5 text-[#7f8c8d] group-hover:text-white" />
            <div className="mt-8">
              <p className="text-[9px] uppercase tracking-widest text-[#7f8c8d] mb-1">{card.label}</p>
              <p className="text-2xl text-white font-brand">{card.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ForgeView = () => {
  return (
    <div className="space-y-8">
      <div className="glass p-10 rounded-3xl border-white/5 min-h-[400px] relative overflow-hidden">
        <div className="mb-8 flex justify-between items-center">
          <h3 className="text-white text-lg font-brand uppercase tracking-widest">A/B Experiment Matrix</h3>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>
        
        {/* Generative Experiment Visual */}
        <div className="grid grid-cols-4 gap-8">
           {[1,2,3,4].map(i => (
             <div key={i} className="space-y-4">
               <div className="h-40 relative">
                 <motion.div 
                   animate={{ height: [`${20*i}%`, `${30*i}%`, `${20*i}%`] }}
                   transition={{ duration: 4, repeat: Infinity, delay: i*0.5 }}
                   className="absolute bottom-0 w-full bg-white shadow-[0_0_20px_white]" 
                 />
                 <div className="absolute inset-0 border border-white/5" />
               </div>
               <p className="text-[9px] text-[#7f8c8d] uppercase tracking-widest text-center">Protocol {i}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const NexusView = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 glass p-10 rounded-3xl border-white/5 min-h-[500px] relative">
        <h3 className="text-white text-lg font-brand uppercase tracking-widest mb-10">Team Aggregation Graph</h3>
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full">
            <circle cx="50%" cy="50%" r="100" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="200" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
          </svg>
        </div>
        <div className="relative flex items-center justify-center h-full">
            <div className="w-20 h-20 bg-white rounded-full shadow-[0_0_50px_white] flex items-center justify-center text-black font-bold">CORE</div>
            {[0, 60, 120, 180, 240, 300].map(deg => (
               <motion.div 
                 key={deg}
                 animate={{ rotate: deg }}
                 className="absolute w-64 h-[1px] bg-white/10 origin-center"
               >
                  <div className="absolute right-0 w-4 h-4 bg-white/20 border border-white/40 rounded-full -translate-y-1/2" />
               </motion.div>
            ))}
        </div>
      </div>
      <div className="space-y-8">
        {[1,2,3].map(i => (
          <div key={i} className="glass p-8 rounded-3xl border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-[#7f8c8d] mb-4">Node Group 0{i}</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10" />
              <div>
                <p className="text-white text-sm">Synthetic Agent Cluster</p>
                <p className="text-xs text-[#7f8c8d]">Sync Active</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#7f8c8d] font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <AnimatePresence mode="wait">
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* Layered Background System */}
      <div className="fixed inset-0 z-0">
        <BackgroundE isSubpage={!!activeTool} />
        <Starfield active={!!activeTool} />
      </div>

      <Header activeTool={activeTool} onNavigate={(id) => setActiveTool(id)} />

      <main className="relative z-10 pt-[100px]">
        <AnimatePresence mode="wait">
          {!activeTool ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              className="container mx-auto px-8 pt-48 pb-20"
            >
              <div className="max-w-4xl mb-24 px-4 overflow-hidden">
                <motion.h1 
                  className="text-[10vw] font-brand font-bold text-[#7f8c8d] leading-[0.85] tracking-tighter cursor-default transition-all duration-500 hover:text-white hover:neon-glow select-none"
                >
                  <motion.span initial={{ y: 200 }} animate={{ y: 0 }} transition={{ duration: 1, ease: "circOut" }}>Every Agent.</motion.span>
                  <br />
                  <motion.span initial={{ y: 200 }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.1, ease: "circOut" }}>Measured.</motion.span>
                </motion.h1>
                <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5, duration: 1 }}
                   className="mt-12"
                >
                  <p className="text-xl text-[#7f8c8d] max-w-2xl font-light leading-relaxed">
                    The celestial ledger for decentralized labor. <br />
                    <span className="opacity-40">Real-time ROI benchmarking across every node in your intelligent network.</span>
                  </p>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {TOOLS.map((tool, idx) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + idx * 0.15, duration: 0.8 }}
                    whileHover={{ scale: 1.02, borderColor: '#ffffff' }}
                    onClick={() => setActiveTool(tool.id)}
                    className="group relative h-[300px] glass !bg-black/20 border border-white/5 rounded-3xl p-8 flex flex-col justify-between overflow-hidden cursor-pointer shadow-2xl"
                  >
                    <div className="relative z-10">
                      <tool.icon className="w-8 h-8 text-[#7f8c8d] group-hover:text-white transition-all mb-6" />
                      <h3 className="font-brand font-bold text-white text-2xl tracking-tighter uppercase">{tool.name}</h3>
                      <p className="font-sans text-xs text-[#7f8c8d] mt-2 tracking-widest opacity-60 uppercase">{tool.desc}</p>
                    </div>

                    <div className="relative z-10 flex justify-end">
                       <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-all" />
                    </div>

                    {/* Interactive Tile Illustration */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 group-hover:opacity-30 transition-opacity">
                       <div className="w-full h-full flex items-center justify-center">
                          <motion.div 
                            animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                          >
                             <tool.icon className="w-64 h-64 text-white" />
                          </motion.div>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <ToolDashboard key={activeTool} activeTool={activeTool} onBack={() => setActiveTool(null)} />
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Status Badge */}
      <div className="fixed bottom-10 right-10 z-50">
        <div className="glass px-6 py-3 rounded-2xl border-white/5 flex items-center gap-5 bg-black/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[9px] text-white/40 tracking-[0.2em] mb-1 uppercase">Connection String</span>
            <span className="font-sans text-[11px] text-white font-bold tracking-widest">BETA-CLUSTER-001</span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="relative w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]" />
        </div>
      </div>
    </div>
  );
}
