import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

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
        baseR: Math.random() * 1.2 + 0.3
      }));
      let animationFrameId: number;
      const render = () => {
        ctx.clearRect(0, 0, w, h);
        stars.forEach(star => {
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

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    // Skeleton: supabase.auth.updateUser({ password })
    console.log('Updating password...');
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <StarfieldComponent />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-[#0a0a0f]/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] z-10 shadow-2xl relative"
      >
        <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />
        
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#00E5FF]/10 flex items-center justify-center mb-6">
              <ShieldCheck className="text-[#00E5FF] w-6 h-6" />
            </div>
            <h1 className="text-4xl font-brand font-bold text-white tracking-tight uppercase">New <br /> Credentials</h1>
            <p className="text-[#8E9299]">Secure your neural access node.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">New Password</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-black/50 border-white/10 h-14 pr-12 text-white rounded-xl focus:border-[#00E5FF]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-[#7f8c8d] hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Confirm New Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="bg-black/50 border-white/10 h-14 text-white rounded-xl focus:border-[#00E5FF]"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400 py-3">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-white text-black font-bold uppercase tracking-widest h-14 rounded-xl hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all"
            >
              {loading ? "Securing Node..." : "Update Password"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
