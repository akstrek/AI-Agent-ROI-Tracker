'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Mail, Lock, LogOut, Eye, EyeOff } from 'lucide-react';
import { logEvent } from '@/lib/analytics';
import { E_PATH } from '@/lib/constants';

const MOUNTAIN_IMG = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000";

const AccountNavbar = () => {
    const { signOut } = useAuth();
    const [loggingOut, setLoggingOut] = React.useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        await signOut();
        window.location.href = '/auth/login';
    };

    return (
        <header className="fixed top-0 left-0 w-full z-[100] px-6 md:px-12 h-24 flex items-center justify-between text-white border-b border-white/5 backdrop-blur-md bg-black/10">
            <div className="flex-1 flex justify-end gap-8 md:gap-12 mr-6 md:mr-16">
                <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all hidden sm:block">Dashboard</Link>
                <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all hidden sm:block">Experiments</Link>
            </div>
            <Link href="/" className="shrink-0 flex items-center justify-center p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                <svg viewBox="0 0 100 100" className="w-8 h-8 group-hover:drop-shadow-[0_0_10px_white] transition-all">
                    <path d={E_PATH} fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
                </svg>
            </Link>
            <div className="flex-1 flex justify-start items-center gap-6 md:gap-10 ml-6 md:ml-16">
                <Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all hidden sm:block">Team</Link>
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF3131]/30 text-[#FF3131] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#FF3131]/10 hover:border-[#FF3131] transition-all duration-300 disabled:opacity-50"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{loggingOut ? 'Logging out…' : 'Logout'}</span>
                </button>
            </div>
        </header>
    );
};

interface SessionStats {
    tasksLogged: number;
    activeExperiments: number;
    activeNodes: number;
}

function formatAccountDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
}

function formatRelative(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'JUST NOW';
    if (mins < 60) return `${mins}M AGO`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}H AGO`;
    return `${Math.floor(hrs / 24)}D AGO`;
}

export default function AccountPage() {
    const { user, avatar, refreshAvatar } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploading, setUploading] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const [emailUpdate, setEmailUpdate] = useState({ current: user?.email || '', new: '' });
    const [emailMsg, setEmailMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [emailLoading, setEmailLoading] = useState(false);

    const [pwdUpdate, setPwdUpdate] = useState({ new: '', confirm: '' });
    const [pwdMsg, setPwdMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [showPwdNew, setShowPwdNew] = useState(false);
    const [showPwdConfirm, setShowPwdConfirm] = useState(false);

    const [stats, setStats] = useState<SessionStats>({ tasksLogged: 0, activeExperiments: 0, activeNodes: 0 });

    const initials = user?.email?.substring(0, 2).toUpperCase() || 'ER';

    const fetchStats = useCallback(async () => {
        if (!user) return;

        const [{ count: tasks }, { count: experiments }, { data: nodes }] = await Promise.all([
            supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('experiments').select('*', { count: 'exact', head: true })
                .eq('user_id', user.id).eq('status', 'Running'),
            supabase.from('tasks').select('node_assign').eq('user_id', user.id),
        ]);

        const distinctNodes = new Set((nodes ?? []).map((t: { node_assign: string }) => t.node_assign)).size;
        setStats({
            tasksLogged: tasks ?? 0,
            activeExperiments: experiments ?? 0,
            activeNodes: distinctNodes,
        });
    }, [user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setUploading(true);
        setAvatarError(null);

        const ext = file.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true });

        if (uploadError) {
            setAvatarError(uploadError.message);
            setUploading(false);
            return;
        }

        const { data: signedData, error: signedError } = await supabase.storage
            .from('avatars')
            .createSignedUrl(path, 31536000); // 1-year signed URL

        if (signedError || !signedData?.signedUrl) {
            setAvatarError('Failed to generate avatar URL.');
            setUploading(false);
            return;
        }

        const signedUrl = signedData.signedUrl;

        await Promise.all([
            supabase.from('profiles').update({ avatar_url: signedUrl }).eq('id', user.id),
            supabase.auth.updateUser({ data: { avatar_url: signedUrl } }),
        ]);

        refreshAvatar(signedUrl);
        await logEvent(user.id, 'account_avatar_updated', { path });
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEmailUpdate = async () => {
        if (!emailUpdate.new) return;
        setEmailLoading(true);
        setEmailMsg(null);
        const { error } = await supabase.auth.updateUser({ email: emailUpdate.new });
        setEmailLoading(false);
        if (error) {
            setEmailMsg({ type: 'error', text: error.message });
        } else {
            setEmailMsg({ type: 'success', text: 'Confirmation sent to new address. Check your inbox.' });
            await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', user!.id);
            await logEvent(user!.id, 'account_email_updated');
            setEmailUpdate(prev => ({ ...prev, new: '' }));
        }
    };

    const handlePasswordRotation = async () => {
        if (!pwdUpdate.new || pwdUpdate.new !== pwdUpdate.confirm) {
            setPwdMsg({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (pwdUpdate.new.length < 8) {
            setPwdMsg({ type: 'error', text: 'Password must be at least 8 characters.' });
            return;
        }
        setPwdLoading(true);
        setPwdMsg(null);
        const { error } = await supabase.auth.updateUser({ password: pwdUpdate.new });
        setPwdLoading(false);
        if (error) {
            setPwdMsg({ type: 'error', text: error.message });
        } else {
            setPwdMsg({ type: 'success', text: 'Password updated successfully.' });
            await logEvent(user!.id, 'account_password_rotated');
            setPwdUpdate({ new: '', confirm: '' });
        }
    };

    const sessionIndicators = [
        { label: 'Founded', value: formatAccountDate(user?.created_at) },
        { label: 'Last Login', value: formatRelative(user?.last_sign_in_at) },
        { label: 'Tasks Logged', value: stats.tasksLogged.toLocaleString() },
        { label: 'Experiments', value: `${stats.activeExperiments} ACTIVE` },
        { label: 'Nodes', value: String(stats.activeNodes).padStart(2, '0') },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen w-full relative bg-black text-white selection:bg-[#FF3131] selection:text-black"
        >
            <AccountNavbar />

            <div className="fixed inset-0 z-0">
                <Image src={MOUNTAIN_IMG} fill className="object-cover brightness-[0.4] grayscale-[0.2]" alt="Background" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black select-none pointer-events-none" />
            </div>

            <main className="relative z-10 pt-40 pb-32 px-6 max-w-7xl mx-auto space-y-24">

                {/* Hero Section */}
                <section className="flex flex-col items-center text-center space-y-8">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-white/20 to-transparent backdrop-blur-xl border border-white/10 relative">
                            <Avatar className="w-full h-full">
                                <AvatarImage src={avatar || ''} className="object-cover" />
                                <AvatarFallback className="bg-white/5 text-4xl font-bold">{initials}</AvatarFallback>
                            </Avatar>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center border-4 border-[#0a0a0a] hover:scale-110 transition-transform shadow-xl disabled:opacity-60"
                        >
                            <Camera size={18} className={uploading ? "animate-spin" : ""} />
                        </button>
                    </div>
                    {avatarError && (
                        <p className="text-[#FF3131] font-mono text-[10px] uppercase tracking-widest">{avatarError}</p>
                    )}
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-6xl font-brand font-bold tracking-tight uppercase">
                            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                        </h1>
                        <p className="text-[#8E9299] font-mono tracking-[0.2em] uppercase text-sm">
                            {user?.user_metadata?.job_title || 'Lead Strategist'} {'// ALPHA NODE'}
                        </p>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Card 1: Account Details */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-black/40 backdrop-blur-md border border-white/5 p-10 rounded-[2.5rem] space-y-10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FF3131]">
                                <Mail size={20} />
                            </div>
                            <h2 className="text-xl font-brand font-bold uppercase tracking-widest text-white/90">Registry Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: 'Email', value: user?.email },
                                { label: 'First Name', value: user?.user_metadata?.first_name },
                                { label: 'Last Name', value: user?.user_metadata?.last_name },
                                { label: 'Job Title', value: user?.user_metadata?.job_title },
                                { label: 'Team', value: user?.user_metadata?.team_name },
                                { label: 'Team Size', value: user?.user_metadata?.team_size },
                                { label: 'Use Case', value: user?.user_metadata?.use_case },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <p className="text-[10px] font-mono uppercase text-[#7f8c8d] tracking-[0.2em]">{item.label}</p>
                                    <p className="font-brand font-medium text-white/80">{item.value || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Card 2: Update Credentials */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-black/40 backdrop-blur-md border border-white/5 p-10 rounded-[2.5rem] space-y-12"
                    >
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                                    <Lock size={20} />
                                </div>
                                <h2 className="text-xl font-brand font-bold uppercase tracking-widest text-white/90">Update Access</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[9px] uppercase tracking-widest text-[#7f8c8d]">Current Email</Label>
                                    <Input value={emailUpdate.current} readOnly className="bg-white/5 border-white/5 text-white/40 h-10 text-xs" />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[9px] uppercase tracking-widest text-[#7f8c8d]">New Email Address</Label>
                                    <div className="flex gap-4">
                                        <Input
                                            placeholder="new@ergon.ai"
                                            value={emailUpdate.new}
                                            onChange={e => setEmailUpdate(prev => ({ ...prev, new: e.target.value }))}
                                            className="bg-black/50 border-white/10 text-white h-12 flex-1 rounded-xl"
                                        />
                                        <Button
                                            onClick={handleEmailUpdate}
                                            disabled={emailLoading || !emailUpdate.new}
                                            className="h-12 px-6 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/80 disabled:opacity-50"
                                        >
                                            {emailLoading ? '...' : 'Update'}
                                        </Button>
                                    </div>
                                    {emailMsg && (
                                        <Alert variant={emailMsg.type === 'error' ? 'destructive' : 'default'}>
                                            <AlertDescription className={emailMsg.type === 'success' ? 'text-green-400 text-xs' : 'text-xs'}>
                                                {emailMsg.text}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 space-y-6">
                                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FF3131]">Password Rotation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Input
                                            type={showPwdNew ? 'text' : 'password'}
                                            placeholder="New Password"
                                            value={pwdUpdate.new}
                                            onChange={e => setPwdUpdate(prev => ({ ...prev, new: e.target.value }))}
                                            className="bg-black/50 border-white/10 text-white h-12 rounded-xl pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwdNew(v => !v)}
                                            aria-label={showPwdNew ? 'Hide password' : 'Show password'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f8c8d] hover:text-white transition-colors"
                                        >
                                            {showPwdNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type={showPwdConfirm ? 'text' : 'password'}
                                            placeholder="Confirm Password"
                                            value={pwdUpdate.confirm}
                                            onChange={e => setPwdUpdate(prev => ({ ...prev, confirm: e.target.value }))}
                                            className="bg-black/50 border-white/10 text-white h-12 rounded-xl pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwdConfirm(v => !v)}
                                            aria-label={showPwdConfirm ? 'Hide password' : 'Show password'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f8c8d] hover:text-white transition-colors"
                                        >
                                            {showPwdConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                {pwdMsg && (
                                    <Alert variant={pwdMsg.type === 'error' ? 'destructive' : 'default'}>
                                        <AlertDescription className={pwdMsg.type === 'success' ? 'text-green-400 text-xs' : 'text-xs'}>
                                            {pwdMsg.text}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <Button
                                    onClick={handlePasswordRotation}
                                    disabled={pwdLoading}
                                    className="w-full h-12 border border-white/10 hover:bg-white/5 font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl disabled:opacity-50"
                                >
                                    {pwdLoading ? 'Rotating...' : 'Execute Rotation'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Session Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 border-t border-white/10 pt-16">
                    {sessionIndicators.map((item, i) => (
                        <div key={i} className="space-y-1">
                            <p className="text-[9px] font-mono uppercase text-[#7f8c8d] tracking-[0.3em]">{item.label}</p>
                            <p className="text-xl font-brand font-bold text-white tracking-tighter">{item.value}</p>
                        </div>
                    ))}
                </div>
            </main>
        </motion.div>
    );
}
