import React, { useState } from 'react';
import { Anchor, ChevronDown, Globe, MapPin, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { getTranslation, Language } from '../data/translations';
import { useLanguage } from '../contexts/LanguageContext';
import { useRegion } from '../contexts/RegionContext';
import { useDarkMode } from '../contexts/DarkModeContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  transparent?: boolean;
}

export function Navigation({ 
  currentPage, 
  onNavigate, 
  isLoggedIn, 
  transparent = false,
}: NavigationProps) {
  // Use contexts for global state
  const { language, setLanguage } = useLanguage();
  const { region, setRegion, regions } = useRegion();
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  const t = getTranslation(language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t.home },
    { id: 'pricing', label: t.pricing },
    { id: 'partners', label: t.partners },
  ];

  const languages: Language[] = ['English', 'Bulgarian', 'Spanish', 'Greek', 'Italian'];
  
  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        /* Fix selected dropdown items - target exact classes */
        [data-slot="dropdown-menu-item"].bg-sky-50 {
          background-color: rgb(240, 249, 255) !important;
          color: rgb(3, 105, 161) !important;
        }

        [data-slot="dropdown-menu-item"].bg-sky-50:hover,
        [data-slot="dropdown-menu-item"].bg-sky-50:focus,
        [data-slot="dropdown-menu-item"].bg-sky-50[data-highlighted] {
          background-color: rgb(224, 242, 254) !important;
          color: rgb(3, 105, 161) !important;
        }

        /* Dark mode versions */
        .dark [data-slot="dropdown-menu-item"].bg-sky-50 {
          background-color: rgb(12, 74, 110) !important;
          color: rgb(125, 211, 252) !important;
        }

        .dark [data-slot="dropdown-menu-item"].bg-sky-50:hover,
        .dark [data-slot="dropdown-menu-item"].bg-sky-50:focus,
        .dark [data-slot="dropdown-menu-item"].bg-sky-50[data-highlighted] {
          background-color: rgb(7, 89, 133) !important;
          color: rgb(125, 211, 252) !important;
        }
      `}} />
      <nav
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[400ms] ${
          transparent
            ? isLoggedIn
              ? 'backdrop-blur-md border-b-2 border-cyan-400/50'
              : 'backdrop-blur-md'
            : isLoggedIn
            ? 'backdrop-blur-xl border-b-2 border-cyan-400/60 dark:border-cyan-500/60 shadow-sm'
            : 'backdrop-blur-xl border-b-2 border-gray-200/70 dark:border-gray-600/70 shadow-sm'
        }`}
        style={transparent ? {
          background: 'linear-gradient(to bottom, rgba(107, 114, 128, 0.05), rgba(107, 114, 128, 0.05)), linear-gradient(to bottom, rgba(30, 58, 138, 0.05), rgba(30, 58, 138, 0.05))'
        } : {
          backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
        }}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 hover:opacity-90 transition-all group flex-shrink-0"
            >
              <div className="relative">
                {/* Fancy Yacht Logo */}
                <div className={`absolute inset-0 ${
                  transparent 
                    ? 'bg-cyan-400/40'
                    : 'bg-gradient-to-r from-sky-400 to-cyan-500'
                } rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity`}></div>
                <div className={`relative ${
                  transparent 
                    ? 'bg-gradient-to-br from-cyan-400/30 to-teal-500/30 backdrop-blur-md border-2 border-cyan-300/40'
                    : 'bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-600'
                } p-3 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform`}>
                  <div className="relative">
                    <Anchor className={`w-7 h-7 ${transparent ? 'text-white drop-shadow-lg' : 'text-white'} transform -rotate-12`} />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full shadow-lg"></div>
                  </div>
                </div>
              </div>
              <div className="text-left hidden lg:block">
                <h1 
                  className={`text-lg font-bold tracking-tight transition-colors duration-[400ms] ${
                    transparent ? 'text-white drop-shadow-lg' : ''
                  }`}
                  style={!transparent ? {
                    color: darkMode ? '#f3f4f6' : '#0f172a',
                    transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                  } : undefined}
                >
                  Yacht Exam Trainer
                </h1>
                <p 
                  className={`text-xs transition-colors duration-[400ms] ${
                    transparent ? 'text-white/80 drop-shadow' : ''
                  }`}
                  style={!transparent ? {
                    color: darkMode ? '#9ca3af' : '#64748b',
                    transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                  } : undefined}
                >
                  Professional Maritime Training
                </p>
              </div>
            </button>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => (
                <Button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  variant="ghost"
                  className={`${
                    currentPage === link.id
                      ? transparent
                        ? 'bg-white/20 text-white backdrop-blur-md shadow-sm'
                        : link.id === 'partners'
                        ? darkMode 
                          ? 'bg-cyan-900/50 text-cyan-300 shadow-sm'
                          : 'bg-sky-50 text-sky-700 shadow-sm border border-sky-200'
                        : darkMode
                        ? 'bg-sky-900/50 text-sky-300 shadow-sm'
                        : 'bg-sky-50 text-sky-700 shadow-sm border border-sky-200'
                      : transparent
                      ? 'text-white hover:bg-white/10 backdrop-blur-sm drop-shadow-md'
                      : darkMode
                      ? 'text-gray-200 hover:bg-gray-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:shadow-sm'
                  } font-medium transition-all duration-200`}
                >
                  {link.label}
                </Button>
              ))}
            </div>

            {/* Right Side - Dark Mode, Language, Region, Account, Mobile Menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Dark Mode Toggle - Desktop */}
              <Button
                variant="ghost"
                size="sm"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={toggleDarkMode}
                className={`hidden sm:flex ${
                  darkMode
                    ? transparent
                      ? 'bg-white/20 text-white backdrop-blur-md'
                      : 'bg-sky-900/50 text-sky-300'
                    : transparent
                    ? 'text-white hover:bg-white/10 backdrop-blur-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                } px-2 flex-shrink-0 transition-all`}
                style={{ willChange: 'auto' }}
              >
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
              
              {/* Language Dropdown - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`hidden sm:flex nav-dropdown-btn ${
                      transparent
                        ? 'text-white hover:bg-white/10 backdrop-blur-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-gray-700'
                    } gap-1 px-2 md:px-3 min-w-[100px] sm:min-w-[130px] flex-shrink-0 rounded-md`}
                    style={{
                      willChange: 'auto',
                      color: transparent ? undefined : (darkMode ? '#e5e7eb' : '#1f2937')
                    }}
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate flex-1 text-left">{language}</span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-gray-200 dark:border-gray-600 w-[130px]">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      data-selected={language === lang ? 'true' : undefined}
                      className={`cursor-pointer ${language === lang ? 'bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-semibold' : 'dark:text-gray-200'}`}
                      style={language === lang ? {
                        backgroundColor: darkMode ? 'rgb(12, 74, 110)' : 'rgb(240, 249, 255)',
                        color: darkMode ? 'rgb(125, 211, 252)' : 'rgb(3, 105, 161)'
                      } : undefined}
                    >
                      {lang}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Region Dropdown - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`hidden sm:flex nav-dropdown-btn ${
                      transparent
                        ? 'text-white hover:bg-white/10 backdrop-blur-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-gray-700'
                    } gap-1 px-2 md:px-3 min-w-[100px] sm:min-w-[130px] flex-shrink-0`}
                    style={{ 
                      willChange: 'auto',
                      color: transparent ? undefined : (darkMode ? '#e5e7eb' : '#1f2937')
                    }}
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline truncate flex-1 text-left">{region}</span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-gray-200 dark:border-gray-600 w-[130px]">
                  {regions.map((reg) => (
                    <DropdownMenuItem
                      key={reg}
                      onClick={() => setRegion(reg)}
                      data-selected={region === reg ? 'true' : undefined}
                      className={`cursor-pointer ${region === reg ? 'bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-300 font-semibold' : 'dark:text-gray-200'}`}
                      style={region === reg ? {
                        backgroundColor: darkMode ? 'rgb(12, 74, 110)' : 'rgb(240, 249, 255)',
                        color: darkMode ? 'rgb(125, 211, 252)' : 'rgb(3, 105, 161)'
                      } : undefined}
                    >
                      {reg}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Account/Login Button - Desktop */}
              {isLoggedIn ? (
                <Button
                  onClick={() => onNavigate('account')}
                  className={`hidden sm:flex ${
                    transparent
                      ? 'bg-gradient-to-r from-cyan-400/40 to-teal-500/40 text-white backdrop-blur-md hover:from-cyan-400/50 hover:to-teal-500/50 border-2 border-cyan-300/40'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white'
                  } shadow-lg font-semibold min-w-[90px] flex-shrink-0`}
                  style={{ willChange: 'auto' }}
                >
                  {t.account}
                </Button>
              ) : (
                <Button
                  onClick={() => onNavigate('login')}
                  variant="ghost"
                  className={`hidden sm:flex ${
                    transparent
                      ? 'text-white hover:bg-white/10 backdrop-blur-sm border border-white/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
                  } font-semibold min-w-[90px] flex-shrink-0`}
                  style={{ 
                    willChange: 'auto',
                    color: transparent ? undefined : (darkMode ? '#e5e7eb' : '#1f2937')
                  }}
                >
                  {t.login}
                </Button>
              )}
              
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Open menu"
                    className={`sm:hidden ${
                      transparent
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } px-2`}
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[280px] sm:w-[350px] flex flex-col bg-white dark:bg-slate-900 border-l-2 border-gray-200 dark:border-gray-700"
                  style={{
                    backgroundColor: darkMode ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)',
                    borderLeftColor: darkMode ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)'
                  }}
                >
                  <SheetHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <SheetTitle
                      className="flex items-center gap-2"
                      style={{ color: darkMode ? '#f1f5f9' : '#111827' }}
                    >
                      <Anchor className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                      Menu
                    </SheetTitle>
                    <SheetDescription className="text-gray-600 dark:text-gray-400">
                      Navigate through different sections and settings
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col gap-4 overflow-y-auto flex-1 pr-2 pb-6">
                    {/* Navigation Links */}
                    {navLinks.map((link) => (
                      <Button
                        key={link.id}
                        onClick={() => handleNavigate(link.id)}
                        variant={currentPage === link.id ? 'default' : 'ghost'}
                        className={`w-full justify-start text-base ${
                          currentPage === link.id
                            ? 'bg-sky-600 hover:bg-sky-700 text-white font-semibold'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {link.label}
                      </Button>
                    ))}

                    <div className="h-px bg-gray-300 dark:bg-gray-600 my-2" />

                    {/* Dark Mode Toggle */}
                    <Button
                      onClick={toggleDarkMode}
                      variant="ghost"
                      className="w-full justify-start text-base text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {darkMode ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </Button>

                    {/* Language Selection */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3 mb-2">Language</p>
                      {languages.map((lang) => (
                        <Button
                          key={lang}
                          onClick={() => {
                            setLanguage(lang);
                            setMobileMenuOpen(false);
                          }}
                          variant={language === lang ? 'default' : 'ghost'}
                          className={`w-full justify-start text-base ${
                            language === lang
                              ? 'bg-sky-600 hover:bg-sky-700 text-white font-semibold'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          {lang}
                        </Button>
                      ))}
                    </div>

                    {/* Region Selection */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3 mb-2">Region</p>
                      {regions.map((reg) => (
                        <Button
                          key={reg}
                          onClick={() => {
                            setRegion(reg);
                            setMobileMenuOpen(false);
                          }}
                          variant={region === reg ? 'default' : 'ghost'}
                          className={`w-full justify-start text-base ${
                            region === reg
                              ? 'bg-sky-600 hover:bg-sky-700 text-white font-semibold'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          {reg}
                        </Button>
                      ))}
                    </div>

                    <div className="h-px bg-gray-300 dark:bg-gray-600 my-2" />
                    
                    {/* Account/Login */}
                    {isLoggedIn ? (
                      <Button
                        onClick={() => handleNavigate('account')}
                        className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
                      >
                        {t.account}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleNavigate('login')}
                        variant="outline"
                        className="w-full border-2"
                      >
                        {t.login}
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}