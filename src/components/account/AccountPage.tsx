import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, ChevronLeft, CreditCard, Shield, Users, Mail, Lock } from 'lucide-react';

const MOUNTAIN_IMG = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000";

const AccountNavbar = () => {
    const E_PATH = "M 70 25 H 30 L 60 45 L 30 65 H 70";
    return (
        <header className="fixed top-0 left-0 w-full z-[100] px-12 h-24 flex items-center justify-between text-white border-b border-white/5 backdrop-blur-md bg-black/10">
            <div className="flex-1 flex justify-end gap-12 mr-16">
                <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all">Dashboard</Link>
                <Link to="/experiments" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all">Experiments</Link>
            </div>
            
            <Link to="/" className="shrink-0 flex items-center justify-center p-3 rounded-2xl hover:bg-white/5 transition-colors group">
                <svg viewBox="0 0 100 100" className="w-8 h-8 group-hover:drop-shadow-[0_0_10px_white] transition-all">
                    <path d={E_PATH} fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
                </svg>
            </Link>

            <div className="flex-1 flex justify-start gap-12 ml-16">
                <Link to="/team" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all">Team</Link>
                <Link to="/settings" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all">Settings</Link>
            </div>
        </header>
    );
};

export default function AccountPage() {
    const { user, avatar, refreshAvatar } = useAuth();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [emailUpdate, setEmailUpdate] = useState({ current: user?.email || '', new: '' });
    const [pwdUpdate, setPwdUpdate] = useState({ current: '', new: '', confirm: '' });

    const initials = user?.email?.substring(0, 2).toUpperCase() || 'ER';

    const handleAvatarUpload = () => {
        setUploading(true);
        // Skeleton logic
        console.log('Skeleton: supabase.storage.upload -> update users.avatar_url');
        setTimeout(() => {
            setUploading(false);
            refreshAvatar('https://github.com/shadcn.png'); // fake update
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen w-full relative bg-black text-white selection:bg-[#00E5FF] selection:text-black"
        >
            <AccountNavbar />

            {/* Background Image with Gradient Overlay */}
            <div className="fixed inset-0 z-0">
                <img src={MOUNTAIN_IMG} className="w-full h-full object-cover filter brightness-[0.4] grayscale-[0.2]" alt="Background" />
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
                        <button 
                            onClick={handleAvatarUpload}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center border-4 border-[#0a0a0a] hover:scale-110 transition-transform shadow-xl"
                        >
                            <Camera size={18} className={uploading ? "animate-spin" : ""} />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-6xl font-brand font-bold tracking-tight uppercase">
                            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                        </h1>
                        <p className="text-[#8E9299] font-mono tracking-[0.2em] uppercase text-sm">
                            {user?.user_metadata?.job_title || 'Lead Strategist'} // ALPHA NODE
                        </p>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Card 1: Account Details */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-black/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] space-y-10"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#00E5FF]">
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
                        className="bg-black/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] space-y-12"
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
                                            className="bg-black/50 border-white/10 h-12 flex-1 rounded-xl" 
                                        />
                                        <Button className="h-12 px-6 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/80">Update</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 space-y-6">
                                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#00E5FF]">Password Rotation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input type="password" placeholder="Current Password" className="bg-black/50 border-white/10 h-12 rounded-xl" />
                                    <Input type="password" placeholder="New Password" className="bg-black/50 border-white/10 h-12 rounded-xl" />
                                </div>
                                <Button className="w-full h-12 border border-white/10 hover:bg-white/5 font-bold uppercase tracking-[0.2em] text-[10px] rounded-xl">Execute Rotation</Button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Session Indicators / Footer Data */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 border-t border-white/10 pt-16">
                    {[
                        { label: 'Founded', value: 'APR 2026' },
                        { label: 'Last Login', value: '2M AGO' },
                        { label: 'Tasks Logged', value: '1,204' },
                        { label: 'Experiments', value: '03 ACTIVE' },
                        { label: 'Nodes', value: '02' },
                    ].map((item, i) => (
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
