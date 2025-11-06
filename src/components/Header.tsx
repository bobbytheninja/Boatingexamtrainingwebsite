import { Anchor, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  onNavigateHome?: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
}

export function Header({ onNavigateHome, userEmail, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 text-white backdrop-blur-xl border-b border-white/10 shadow-xl">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-4 hover:opacity-90 transition-all group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform">
                <Anchor className="w-7 h-7" />
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight mb-0.5">
                Boating Exam Trainer
              </h1>
              <p className="text-blue-300 text-xs font-medium tracking-wide">Master Your Maritime Knowledge</p>
            </div>
          </button>

          {userEmail && (
            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">{userEmail}</span>
              </div>
              {onLogout && (
                <Button 
                  onClick={onLogout} 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-white/10 text-blue-200 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
