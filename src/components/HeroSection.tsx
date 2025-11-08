import React from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Waves } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative h-72 md:h-96 overflow-hidden">
      {/* Background Image with parallax effect */}
      <div className="absolute inset-0 scale-110">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1697207340462-c9eac5047014?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB5YWNodCUyMHN1bnNldHxlbnwxfHx8fDE3NjIyNDE2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Luxury yacht at sunset"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-blue-950/70 to-slate-950/50"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50"></div>
      
      {/* Animated waves decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent">
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center opacity-20">
          <Waves className="w-16 h-16 text-blue-600" />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative h-full flex items-center animate-fadeIn">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <span className="text-blue-200 text-sm font-semibold tracking-wider uppercase">Premium Maritime Training</span>
            </div>
            <h2 className="text-white mb-6 drop-shadow-2xl tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', lineHeight: '1.1' }}>
              Navigate Your Way to
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Excellence
              </span>
            </h2>
            <p className="text-blue-100 text-lg md:text-xl drop-shadow-lg font-light max-w-xl leading-relaxed">
              Professional maritime training at your fingertips. Master the waters with confidence and precision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
