import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import { BackgroundE, Starfield } from '@/App';

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    jobTitle: '', teamName: '', teamSize: '', useCase: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email.includes('@')) {
        setError('Please fill identity fields correctly.');
        return;
      }
    } else if (step === 2) {
      if (formData.password !== formData.confirmPassword || formData.password.length < 8) {
        setError('Passwords must match and be at least 8 characters.');
        return;
      }
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Skeleton: supabase.auth.signUp', formData);
    // On Success:
    navigate('/dashboard');
  };

  const calculateStrength = () => {
    const len = formData.password.length;
    if (len === 0) return 0;
    if (len < 6) return 33;
    if (len < 10) return 66;
    return 100;
  };

  const strengthColor = () => {
    const s = calculateStrength();
    if (s <= 33) return 'bg-red-500';
    if (s <= 66) return 'bg-amber-500';
    return 'bg-green-500';
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

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <Starfield />
        </div>
        <div className="z-10 w-full h-full">
          <BackgroundE isSubpage={false} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 z-10 relative">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px] space-y-10"
        >
          {/* Step Indicator */}
          <div className="flex justify-center gap-3">
             {[1, 2, 3].map(s => (
               <div 
                key={s} 
                className={`w-2 h-2 rounded-full transition-all duration-500 ${s === step ? 'bg-[#FF3131] shadow-[0_0_10px_#FF3131]' : 'bg-white/10'}`} 
               />
             ))}
          </div>

          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h1 className="text-4xl font-brand font-bold text-white tracking-tight">Create your <br /> Ergon account</h1>
                <p className="text-[#8E9299]">The void awaits your agents.</p>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">First Name</Label>
                    <Input 
                        placeholder="John" 
                        value={formData.firstName}
                        onChange={e => updateFormData({ firstName: e.target.value })}
                        className="bg-black/50 border-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Last Name</Label>
                    <Input 
                        placeholder="Doe" 
                        value={formData.lastName}
                        onChange={e => updateFormData({ lastName: e.target.value })}
                        className="bg-black/50 border-white/10" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="john@company.com" 
                    value={formData.email}
                    onChange={e => updateFormData({ email: e.target.value })}
                    className="bg-black/50 border-white/10" 
                  />
                </div>
                <Button onClick={nextStep} className="w-full bg-[#FF3131] text-black font-bold uppercase tracking-widest h-12 rounded-xl hover:bg-[#FF5C5C]">
                    Continue <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <h1 className="text-4xl font-brand font-bold text-white tracking-tight">Secure your <br /> account</h1>
                <p className="text-[#8E9299]">Encrypted telemetry guards.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Password</Label>
                  <div className="relative">
                    <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={formData.password}
                        onChange={e => updateFormData({ password: e.target.value })}
                        className="bg-black/50 border-white/10 pr-10" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-[#7f8c8d]">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                    <div className={`h-full transition-all duration-500 ${strengthColor()}`} style={{ width: `${calculateStrength()}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Confirm Password</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.confirmPassword}
                    onChange={e => updateFormData({ confirmPassword: e.target.value })}
                    className="bg-black/50 border-white/10" 
                  />
                </div>
                <Button onClick={nextStep} className="w-full bg-[#FF3131] text-black font-bold uppercase tracking-widest h-12 rounded-xl hover:bg-[#FF5C5C]">
                    Continue <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <h1 className="text-4xl font-brand font-bold text-white tracking-tight">Set up your <br /> workspace</h1>
                <p className="text-[#8E9299]">Personalize your ROI dashboard.</p>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Job Title</Label>
                    <Input 
                        placeholder="AI Lead" 
                        value={formData.jobTitle}
                        onChange={e => updateFormData({ jobTitle: e.target.value })}
                        className="bg-black/50 border-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Team Name</Label>
                    <Input 
                        placeholder="Neural Core" 
                        value={formData.teamName}
                        onChange={e => updateFormData({ teamName: e.target.value })}
                        className="bg-black/50 border-white/10" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Team Size</Label>
                  <Select onValueChange={v => updateFormData({ teamSize: v })}>
                    <SelectTrigger className="bg-black/50 border-white/10 text-white">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0f] border-white/10 text-white">
                      <SelectItem value="solo">Solo</SelectItem>
                      <SelectItem value="2-5">2–5</SelectItem>
                      <SelectItem value="6-15">6–15</SelectItem>
                      <SelectItem value="16-50">16–50</SelectItem>
                      <SelectItem value="50+">50+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-[#8E9299]">Primary Use Case</Label>
                  <Select onValueChange={v => updateFormData({ useCase: v })}>
                    <SelectTrigger className="bg-black/50 border-white/10 text-white">
                      <SelectValue placeholder="Choose objective" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0f] border-white/10 text-white">
                      <SelectItem value="measuring">Measuring AI agent productivity</SelectItem>
                      <SelectItem value="testing">A/B testing AI workflows</SelectItem>
                      <SelectItem value="roi">Team ROI reporting</SelectItem>
                      <SelectItem value="personal">Personal productivity tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-[#FF3131] text-black font-bold uppercase tracking-widest h-12 rounded-xl hover:bg-[#FF5C5C] shadow-[0_0_20px_rgba(255,49,49,0.15)]">
                    Get Started <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-center text-sm font-brand text-[#8E9299]">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-[#FF3131] font-bold hover:underline">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
