import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send } from 'lucide-react';

const StarfieldComponent = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      let w = canvas.width = window.innerWidth;
      let h = canvas.height = window.innerHeight;
      const stars = Array.from({ length: 250 }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.2 + 0.3,
        baseR: Math.random() * 1.2 + 0.3, vx: (Math.random() - 0.5) * 0.05, vy: (Math.random() - 0.5) * 0.05,
      }));
      let animationFrameId: number;
      const render = () => {
        ctx.clearRect(0, 0, w, h);
        stars.forEach(star => {
          star.x += star.vx; star.y += star.vy;
          if (star.x < 0) star.x = w; if (star.x > w) star.x = 0;
          if (star.y < 0) star.y = h; if (star.y > h) star.y = 0;
          ctx.beginPath(); ctx.arc(star.x, star.y, star.baseR, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fill();
        });
        animationFrameId = requestAnimationFrame(render);
      };
      render();
      return () => cancelAnimationFrame(animationFrameId);
    }, []);
    return <canvas ref={canvasRef} className="w-full h-full opacity-40" />;
};

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Skeleton: supabase.auth.resetPasswordForEmail
    console.log('Sending reset link to:', email);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <StarfieldComponent />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] bg-[#0a0a0f]/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] z-10 shadow-2xl relative"
      >
        <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />
        
        <Link to="/auth/login" className="inline-flex items-center gap-2 text-xs font-mono text-[#7f8c8d] hover:text-white transition-colors mb-10 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {submitted ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-[#00E5FF]/10 flex items-center justify-center mb-6">
              <Send className="text-[#00E5FF] w-8 h-8" />
            </div>
            <h2 className="text-3xl font-brand font-bold text-white uppercase tracking-tight">Check your <br /> inbox</h2>
            <p className="text-[#8E9299]">We've sent a recovery link to <span className="text-white">{email}</span>. Please check your spam folder if you don't see it.</p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="border-white/10 text-white hover:bg-white/5 font-brand uppercase tracking-widest text-[10px] h-12 rounded-xl w-full">
              Try another email
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-brand font-bold text-white tracking-tight">Reset your <br /> password</h1>
              <p className="text-[#8E9299]">Recover access to your neural logs.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 h-12 text-white rounded-xl"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#00E5FF] text-black font-bold uppercase tracking-widest h-12 rounded-xl hover:bg-[#00D5EF] shadow-[0_0_20px_#00E5FF22]"
              >
                {loading ? "Processing..." : "Send Reset Link"}
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
