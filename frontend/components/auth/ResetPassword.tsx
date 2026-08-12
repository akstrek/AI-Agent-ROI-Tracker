'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Starfield } from '@/components/canvas/Starfield';

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Starfield />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[420px] bg-[#0a0a0f]/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] z-10 shadow-2xl relative"
      >
        <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent" />

        <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-mono text-[#7f8c8d] hover:text-white transition-colors mb-10 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-[#FF3131]/10 flex items-center justify-center mb-6">
              <Send className="text-[#FF3131] w-8 h-8" />
            </div>
            <h2 className="text-3xl font-brand font-bold text-white uppercase tracking-tight">Check your <br /> inbox</h2>
            <p className="text-[#8E9299]">We&apos;ve sent a recovery link to <span className="text-white">{email}</span>. Please check your spam folder if you don&apos;t see it.</p>
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={() => { setSubmitted(false); setEmail(''); setError(null); }}
                className="w-full h-12 bg-white/10 border border-white/20 text-white font-brand font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/20 transition-all"
              >
                Try another email
              </Button>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-[10px] font-mono uppercase tracking-widest text-[#7f8c8d] hover:text-white transition-colors"
              >
                ← Back to login
              </button>
            </div>
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
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF3131] text-black font-bold uppercase tracking-widest h-12 rounded-xl hover:bg-[#FF5C5C] shadow-[0_0_20px_rgba(255,49,49,0.22)]"
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
