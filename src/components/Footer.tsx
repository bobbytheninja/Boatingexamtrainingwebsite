import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { Language, getTranslation } from '../data/translations';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';

export function Footer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { darkMode } = useDarkMode();
  const [language] = useState<Language>('English');
  const t = getTranslation(language);
  const currentYear = new Date().getFullYear();
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || false;

  return (
    <footer 
      className="bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 transition-all duration-[400ms]"
      style={{ 
        backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
        borderTopColor: darkMode ? '#334155' : '#e2e8f0',
        transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
      }}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          {/* Contact Button - Full Width */}
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white shadow-md px-6"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {t.contact}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            {/* Copyright */}
            <div 
              className="text-gray-600 dark:text-gray-400 transition-colors duration-[400ms]"
              style={{ 
                color: darkMode ? '#9ca3af' : '#4b5563',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              © {currentYear} Yacht Exam Trainer. All rights reserved.
            </div>

            {/* Contact Info */}
            <div 
              className="flex items-center gap-4 text-gray-600 dark:text-gray-400 transition-colors duration-[400ms]"
              style={{ 
                color: darkMode ? '#9ca3af' : '#4b5563',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              <a 
                href="tel:+359889660467" 
                className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-300"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+359 88 9660467</span>
              </a>
              <span 
                className="text-gray-300 dark:text-gray-600 transition-colors duration-[400ms]"
                style={{ 
                  color: darkMode ? '#4b5563' : '#d1d5db',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >|</span>
              <a 
                href="mailto:contact@yachtexamtrainer.com" 
                className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-300"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>contact@yachtexamtrainer.com</span>
              </a>
            </div>

            {/* Policy Links */}
            <div 
              className="flex items-center gap-3 text-gray-600 dark:text-gray-400 transition-colors duration-[400ms]"
              style={{ 
                color: darkMode ? '#9ca3af' : '#4b5563',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              {isAdmin && (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-300 flex items-center gap-1"
                  >
                    <span className="text-purple-500">🛡️</span>
                    Admin
                  </button>
                  <span 
                    className="text-gray-300 dark:text-gray-600 transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#4b5563' : '#d1d5db',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                    }}
                  >|</span>
                </>
              )}
              <a 
                href="#privacy" 
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <span 
                className="text-gray-300 dark:text-gray-600 transition-colors duration-[400ms]"
                style={{ 
                  color: darkMode ? '#4b5563' : '#d1d5db',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >|</span>
              <a 
                href="#terms" 
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-300"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}