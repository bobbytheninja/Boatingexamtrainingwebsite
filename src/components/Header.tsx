import React from 'react';
import { Anchor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(user ? '/home' : '/')}
            className="flex items-center gap-4 hover:opacity-90 transition-all group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform">
                <Anchor className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <h1 className="text-white text-xl font-bold tracking-tight mb-0.5 drop-shadow-lg">
                Boating Exam Trainer
              </h1>
              <p className="text-white/90 text-xs font-medium tracking-wide drop-shadow">Master Your Maritime Knowledge</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
