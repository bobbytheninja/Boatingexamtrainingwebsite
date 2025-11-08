import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { Language, getTranslation } from '../data/translations';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

export function Footer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [language] = useState<Language>('English');
  const t = getTranslation(language);
  const currentYear = new Date().getFullYear();
  
  // Check if user is admin (you can adjust this logic)
  const isAdmin = user?.email === 'admin@yachtexamtrainer.com';

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-6">
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
            <div className="text-gray-600 dark:text-gray-400">
              © {currentYear} Yacht Exam Trainer. All rights reserved.
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
              <a 
                href="tel:+359889660467" 
                className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+359 88 9660467</span>
              </a>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <a 
                href="mailto:contact@yachtexamtrainer.com" 
                className="flex items-center gap-1.5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>contact@yachtexamtrainer.com</span>
              </a>
            </div>

            {/* Policy Links */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              {user && (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1"
                  >
                    {isAdmin && <span className="text-purple-500">🛡️</span>}
                    Admin
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                </>
              )}
              <a 
                href="#privacy" 
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <a 
                href="#terms" 
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
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
