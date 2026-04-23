import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { Starfield, BackgroundE } from '@/App';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Skeleton login
    console.log('Logging in...', { email, password });
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] overflow-hidden">
      {/* Top Left Return Button */}
      <div className="fixed top-8 left-8 z-[100] pointer-events-auto">
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:bg-white hover:border-white"
        >
          <ArrowLeft className="w-4 h-4 text-white transition-colors duration-300 group-hover:text-black" />
          <span className="font-brand font-bold text-[10px] tracking-[0.2em] uppercase text-white transition-colors duration-300 group-hover:text-black">
            Return to Ergon
          </span>
        </motion.button>
      </div>

      {/* Left Panel: Starfield & 3D Logo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center border-r border-white/5">
        <div className="absolute inset-0 z-0">
            <Starfield />
        </div>
        <div className="z-10 w-full h-full">
          <BackgroundE isSubpage={false} />
        </div>
      </div>

      {/* Right Panel: Content Block */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] space-y-10"
        >
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-brand font-bold text-white tracking-tight leading-[1.1]">
              Welcome back <br /> to Ergon
            </h1>
            <p className="text-[#8E9299] font-brand font-medium">
              Track what your agents actually do.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.15em] text-[#8E9299]">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/50 border-white/10 h-12 focus:border-[#FF3131] transition-all text-white rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-[0.15em] text-[#8E9299]">Password</Label>
                <Link to="/auth/reset" className="text-[10px] uppercase tracking-widest text-[#8E9299] hover:text-[#FF3131] transition-colors">
                  Forgot your password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/50 border-white/10 h-12 focus:border-[#FF3131] transition-all text-white pr-10 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#7f8c8d] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#FF3131] to-[#FF5C5C] hover:from-[#FF5C5C] hover:to-[#FF3131] text-white font-brand font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-[0_0_20px_rgba(255,49,49,0.3)] hover:shadow-[0_0_30px_rgba(255,49,49,0.5)] transition-all hover:scale-[1.02]"
            >
              Log In <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
              <span className="bg-[#0a0a0a] px-4 text-[#7f8c8d]">or</span>
            </div>
          </div>

          <p className="text-center text-sm font-brand text-[#8E9299]">
            Not on Ergon?{" "}
            <Link to="/auth/signup" className="text-[#FF3131] font-bold hover:underline">
              Create your account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}


