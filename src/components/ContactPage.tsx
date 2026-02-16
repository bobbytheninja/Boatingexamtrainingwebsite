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

interface ContactPageProps {
  onNavigate: (page: string) => void;
  isLoggedIn?: boolean;
}

export function ContactPage({ onNavigate, isLoggedIn = false }: ContactPageProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { darkMode } = useDarkMode();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
    setName('');
    setEmail('');
    setMessage('');
  };

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div className="lg:col-span-2">
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
                    className="text-lg transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#f3f4f6' : '#1e293b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.sendMessage}</CardTitle>
                  <CardDescription 
                    className="text-xs transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#d1d5db' : '#64748b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >Fill out the form below and we'll get back to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="name" 
                        className="text-sm font-semibold transition-colors duration-[400ms]"
                        style={{ 
                          color: darkMode ? '#e5e7eb' : '#334155',
                          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                        }}
                      >
                        {t.fullName}
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-10 text-sm border-2 border-gray-200 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="email" 
                        className="text-sm font-semibold transition-colors duration-[400ms]"
                        style={{ 
                          color: darkMode ? '#e5e7eb' : '#334155',
                          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                        }}
                      >
                        {t.email}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-10 text-sm border-2 border-gray-200 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label 
                        htmlFor="message" 
                        className="text-sm font-semibold transition-colors duration-[400ms]"
                        style={{ 
                          color: darkMode ? '#e5e7eb' : '#334155',
                          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                        }}
                      >
                        {t.message}
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="min-h-[120px] resize-none text-sm border-2 border-gray-200 dark:border-gray-600 focus:border-sky-500 dark:focus:border-sky-400 transition-all duration-200"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-10 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm"
                    >
                      {t.sendMessage}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <Card 
                className="border-2 shadow-lg transition-all duration-[400ms]"
                style={{ 
                  backgroundColor: darkMode ? '#334155' : '#ffffff',
                  borderColor: darkMode ? '#475569' : '#e2e8f0',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle 
                    className="text-base transition-colors duration-[400ms]"
                    style={{ 
                      color: darkMode ? '#f3f4f6' : '#1e293b',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)' 
                    }}
                  >{t.contactInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 bg-sky-100 dark:bg-sky-900 rounded-lg">
                      <Mail className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t.emailUs}</p>
                      <a href="mailto:info@yachtexam.com" className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300">
                        info@yachtexam.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t.phone}</p>
                      <a href="tel:+359889660467" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-sky-600 dark:hover:text-sky-400">
                        +359 88 9660467
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{t.location}</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Sofia, Bulgaria</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-sky-200 dark:border-sky-600 bg-gradient-to-br from-sky-50 to-white dark:from-slate-700 dark:to-slate-600 shadow-md">
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl">⚓</div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      Business inquiries welcome!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Class teaching</strong> & <strong>advertising</strong> <strong>opportunities</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}