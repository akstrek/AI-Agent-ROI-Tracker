import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { User, LogOut, Settings } from 'lucide-react';

export const UserMenu = () => {
  const { user, avatar, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'US';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-3 px-4 py-2 rounded-full bg-white text-black border border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] focus:outline-none z-[100]"
        >
          <span className="font-brand font-bold text-sm tracking-tight hidden md:inline">
            {user?.user_metadata?.first_name || 'Account'}
          </span>
          <Avatar className="w-6 h-6 border border-black/20">
            <AvatarImage src={avatar || ''} />
            <AvatarFallback className="bg-black text-white text-[10px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Levitation shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/40 blur-md rounded-full pointer-events-none" />
        </motion.button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 mt-4 p-2 bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 text-white rounded-2xl shadow-2xl"
      >
        <div className="px-3 py-2 text-xs font-mono text-white/50 tracking-widest uppercase">
          Agent Registry
        </div>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem 
          onClick={() => navigate('/account')}
          className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/5 focus:bg-white/5 focus:text-white transition-colors"
        >
          <User className="w-4 h-4 text-[#FF3131]" />
          <span className="font-brand font-medium">Account Overview</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate('/account')}
          className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-white/5 focus:bg-white/5 focus:text-white transition-colors"
        >
          <Settings className="w-4 h-4 text-white/40" />
          <span className="font-brand font-medium">Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-white/5" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 cursor-pointer rounded-xl hover:bg-red-500/10 focus:bg-red-500/20 text-red-400 focus:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-brand font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
