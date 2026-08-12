'use client'

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { Starfield } from '@/components/canvas/Starfield';
import { BackgroundE } from '@/components/layout/BackgroundE';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    sessionStorage.removeItem('justSignedUp');

    // Only honor returnUrl if it's a same-origin relative path — guards
    // against open redirect to absolute URLs (returnUrl=https://evil.com)
    // and protocol-relative URLs (returnUrl=//evil.com), both of which the
    // browser would treat as a redirect off-site.
    const returnUrl = searchParams.get('returnUrl');
    const isSafeReturnUrl = !!returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//');
    router.push(isSafeReturnUrl ? returnUrl : '/dashboard');
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a] overflow-hidden">
      {/* Top Left Return Button */}
      <div className="fixed top-6 left-6 md:top-8 md:left-8 z-[100] pointer-events-auto">
        <motion.button
          onClick={() => router.push('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:bg-white hover:border-white"
        >
          <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 text-white transition-colors duration-300 group-hover:text-black" />
          <span className="font-brand font-bold text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-white transition-colors duration-300 group-hover:text-black">
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

          {searchParams.get('signup') === '1' && (
            <Alert className="bg-[#22c55e]/10 border-[#22c55e]/30">
              <AlertDescription className="text-[#22c55e] text-xs">
                Account created. Confirm your email if prompted, then log in below.
              </AlertDescription>
            </Alert>
          )}

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
                <Link href="/auth/reset" className="text-[10px] uppercase tracking-widest text-[#8E9299] hover:text-[#FF3131] transition-colors">
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

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#FF3131] to-[#FF5C5C] hover:from-[#FF5C5C] hover:to-[#FF3131] text-white font-brand font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-[0_0_20px_rgba(255,49,49,0.3)] hover:shadow-[0_0_30px_rgba(255,49,49,0.5)] transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : <span className="flex items-center justify-center">Log In <ArrowRight className="ml-2 w-4 h-4" /></span>}
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
            <Link href="/auth/signup" className="text-[#FF3131] font-bold hover:underline">
              Create your account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
