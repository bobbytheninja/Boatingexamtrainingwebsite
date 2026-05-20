import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { getTranslation } from '../data/translations';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ContactPageProps {
  onNavigate: (page: string) => void;
  isLoggedIn?: boolean;
}

export function ContactPage({ onNavigate, isLoggedIn = false }: ContactPageProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { darkMode } = useDarkMode();

  const handleNavigate = (page: string) => {
    if (page === 'contact') return;
    if (page === 'home') {
      onNavigate('/');
    } else if (page === 'login') {
      onNavigate('/login');
    } else {
      onNavigate(`/${page}`);
    }
  };

  return (
    <>
      <Navigation
        currentPage="contact"
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        transparent={false}
      />
      
      <div 
        className="min-h-screen pt-32 pb-20 transition-all duration-[400ms]"
        style={{ 
          background: darkMode 
            ? 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
            : 'linear-gradient(to bottom right, #ffffff, #f0f9ff, #ffffff)',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn">
            <div 
              className="inline-block mb-3 px-4 py-1.5 rounded-full border transition-all duration-[400ms]"
              style={{ 
                backgroundColor: darkMode ? '#1e3a5f' : '#e0f2fe',
                borderColor: darkMode ? '#0c4a6e' : '#7dd3fc',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              <span 
                className="text-xs font-semibold tracking-wide uppercase transition-colors duration-[400ms]"
                style={{ 
                  color: darkMode ? '#7dd3fc' : '#0369a1',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >{t.getInTouch}</span>
            </div>
            <h2 className="gradient-ocean mb-4 tracking-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800' }}>
              {t.contactTitle}
            </h2>
            <p 
              className="max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed transition-colors duration-[400ms]"
              style={{ 
                color: darkMode ? '#d1d5db' : '#475569',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
              }}
              dangerouslySetInnerHTML={{ __html: t.contactSubtitle }}
            >
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Contact Information */}
            <Card 
              className="border-2 shadow-lg transition-all duration-[400ms]"
              style={{ 
                backgroundColor: darkMode ? '#334155' : '#ffffff',
                borderColor: darkMode ? '#475569' : '#e2e8f0',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
              }}
            >
              <CardHeader className="pb-4">
                <CardTitle 
                  className="text-xl transition-colors duration-[400ms]"
                  style={{ 
                    color: darkMode ? '#f3f4f6' : '#1e293b',
                    transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                  }}
                >{t.contactInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 p-3 bg-sky-100 dark:bg-sky-900 rounded-lg">
                    <Mail className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.emailUs}</p>
                    <a href="mailto:gramatikovbobby@gmail.com" className="text-base font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                      gramatikovbobby@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.phone}</p>
                    <a
                      href="tel:+359876610185"
                      className="text-base font-medium hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-[400ms]"
                      style={{
                        color: darkMode ? '#e0f2fe' : '#0c4a6e',
                        transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                      }}
                    >
                      +359 87 66 101 85
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.location}</p>
                    <p 
                      className="text-base font-medium transition-colors duration-[400ms]"
                      style={{ 
                        color: darkMode ? '#e5e7eb' : '#1f2937',
                        transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                      }}
                    >
                      Sofia, Bulgaria
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border-2 shadow-md transition-all duration-[400ms]"
              style={{ 
                backgroundColor: darkMode ? '#334155' : '#f0f9ff',
                borderColor: darkMode ? '#0c4a6e' : '#bae6fd',
                background: darkMode 
                  ? 'linear-gradient(to bottom right, #475569, #334155)'
                  : 'linear-gradient(to bottom right, #f0f9ff, #ffffff)',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
              }}
            >
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="text-3xl">⚓</div>
                  <p 
                    className="text-sm font-medium transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#f3f4f6' : '#374151',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >
                    Business inquiries welcome!
                  </p>
                  <p 
                    className="text-sm transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#6b7280',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >
                    <strong>Class teaching</strong> & <strong>advertising</strong> <strong>opportunities</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}