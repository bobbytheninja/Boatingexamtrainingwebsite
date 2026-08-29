import React, { useEffect, useRef, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, GraduationCap } from 'lucide-react';
import { getTranslation } from '../data/translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const CACHE_KEY = 'bsb_partners_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface PartnersPageProps {
  onNavigate: (page: string) => void;
  selectedPartnerIndex?: number;
  isLoggedIn?: boolean;
}

interface Partner {
  id: string;
  name: string;
  description: string;
  specializations: string[];
  website: string;
  classesLink: string;
  image: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

function getDefaultPartners(): Partner[] {
  return [
    {
      id: 'default_1',
      name: 'Maritime Academy Bulgaria',
      description: 'Leading maritime training institution offering comprehensive sailing courses, yacht certifications, and professional skipper training. With over 15 years of experience and certified instructors, we provide hands-on training in modern vessels and state-of-the-art facilities.',
      specializations: ['RYA Certified Courses', 'Yacht Charter Qualifications', 'Advanced Navigation', 'Safety at Sea Training', 'VHF Radio Operator License'],
      website: 'https://www.naval-acad.bg/en',
      classesLink: 'https://www.naval-acad.bg/en',
      image: 'https://images.unsplash.com/photo-1599444941426-db010d9b5ef7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWlsaW5nJTIwc2Nob29sJTIwdHJhaW5pbmclMjBpbnN0cnVjdG9yfGVufDF8fHx8MTc2MjQzNzU1NHww&ixlib=rb-4.1.0&q=80&w=800',
      order: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'default_2',
      name: 'Black Sea Yacht Charters',
      description: 'Premium yacht charter service with a fleet of modern sailing and motor yachts. We offer bareboat and skippered charters along the Bulgarian and Greek coastlines. Perfect for practicing your newly acquired skills in real-world conditions.',
      specializations: ['Bareboat Charter', 'Skippered Charter', 'Sailing Holidays', 'Team Building Events', 'Corporate Charters'],
      website: 'https://bmtc.bg/en/index.html',
      classesLink: 'https://bmtc.bg/en/STCW-courses/c2.html',
      image: 'https://images.unsplash.com/photo-1630840754024-8e3817c5e623?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5YWNodCUyMGNoYXJ0ZXIlMjBib2F0JTIwcmVudGFsfGVufDF8fHx8MTc2MjQzODE3MXww&ixlib=rb-4.1.0&q=80&w=800',
      order: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'default_3',
      name: 'Neptune Marine Equipment',
      description: 'Your one-stop shop for all maritime safety and navigation equipment. We supply professional-grade gear for exam preparation including safety equipment, navigation tools, and communication devices. Special discounts for our partner exam students.',
      specializations: ['Safety Equipment', 'Navigation Instruments', 'VHF Radios', 'Life Jackets & Safety Gear', 'Electronic Charts'],
      website: 'https://neptune-marine.bg',
      classesLink: 'https://neptune-marine.bg/shop',
      image: 'https://images.unsplash.com/photo-1601534961131-1526b4741505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJpbmUlMjBlcXVpcG1lbnQlMjBzaG9wfGVufDF8fHx8MTc2MjQzODE3NXww&ixlib=rb-4.1.0&q=80&w=800',
      order: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
}

export function PartnersPage({ onNavigate, selectedPartnerIndex = 0, isLoggedIn = false }: PartnersPageProps) {
  usePageTitle('Partners | Black Sea Bulgaria');
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { darkMode } = useDarkMode();
  const partnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleNavigate = (page: string) => {
    if (page === 'partners') return;
    if (page === 'home') {
      onNavigate('/');
    } else if (page === 'login') {
      onNavigate('/login');
    } else if (page === 'contact') {
      onNavigate('/contact');
    } else {
      onNavigate(`/${page}`);
    }
  };

  useEffect(() => {
    // Check localStorage cache first for instant display
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { partners: cached, cachedAt } = JSON.parse(raw);
        if (Array.isArray(cached)) {
          setPartners(cached);
          setInitialLoading(false);
          // If cache is still fresh, skip the network request
          if (Date.now() - cachedAt < CACHE_TTL) return;
          // Otherwise fall through to refresh in background
        }
      }
    } catch {
      // corrupted cache — ignore and fetch fresh
    }

    // Fetch from API (first visit or stale cache — runs silently if we already showed cached data)
    fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-d36f8f91/partners`,
      { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
    )
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        const fetched: Partner[] = Array.isArray(data?.partners) ? data.partners : [];
        setPartners(fetched);
        setInitialLoading(false);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ partners: fetched, cachedAt: Date.now() }));
        } catch {
          // storage full — ignore
        }
      })
      .catch(() => {
        setInitialLoading(false);
      });
  }, []);

  // Scroll to selected partner once content is ready
  useEffect(() => {
    if (partnerRefs.current[selectedPartnerIndex] && !initialLoading) {
      setTimeout(() => {
        const element = partnerRefs.current[selectedPartnerIndex];
        if (element) {
          const yOffset = -150;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [selectedPartnerIndex, initialLoading]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Navigation
        currentPage="partners"
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
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fadeIn">
            <h2
              className="gradient-ocean mb-4 tracking-tight transition-colors duration-[400ms]"
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: '800',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              {t.partnersTitle}
            </h2>
            <p
              className="max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed transition-colors duration-[400ms]"
              style={{
                color: darkMode ? '#d1d5db' : '#475569',
                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
              }}
            >
              {t.partnersSubtitle}
            </p>
          </div>

          {/* Partners List */}
          <div className="space-y-8">
            {initialLoading ? (
              // Skeleton cards — shown only on true first visit (no cache)
              [0, 1, 2].map(i => (
                <div
                  key={i}
                  className="rounded-xl h-64 animate-pulse"
                  style={{ background: darkMode ? '#334155' : '#e2e8f0' }}
                />
              ))
            ) : partners.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🤝</p>
                <h3 className="text-xl font-semibold mb-2 transition-colors duration-[400ms]" style={{ color: darkMode ? '#f3f4f6' : '#1e293b' }}>
                  No partners yet
                </h3>
                <p className="text-sm" style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
                  Partner listings will appear here once added.
                </p>
              </div>
            ) : (
              partners.map((partner, index) => (
                <div key={index} ref={(el) => { partnerRefs.current[index] = el; }}>
                  <Card
                    className="group border-2 shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-[400ms]"
                    style={{
                      backgroundColor: darkMode ? '#334155' : '#ffffff',
                      borderColor: darkMode ? '#475569' : '#e2e8f0',
                      transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                    }}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Partner Image */}
                      <div className="relative h-64 lg:h-auto overflow-hidden">
                        <ImageWithFallback
                          src={partner.image}
                          alt={partner.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r" />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute bottom-4 left-4 lg:hidden">
                          <h3 className="text-white text-xl font-bold">{partner.name}</h3>
                        </div>
                      </div>

                      {/* Partner Info */}
                      <div className="p-6 lg:py-8">
                        <CardHeader className="p-0 mb-4 hidden lg:block">
                          <CardTitle
                            className="text-2xl mb-2 transition-colors duration-[400ms]"
                            style={{
                              color: darkMode ? '#f3f4f6' : '#1e293b',
                              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                            }}
                          >{partner.name}</CardTitle>
                          <CardDescription
                            className="text-sm transition-colors duration-[400ms]"
                            style={{
                              color: darkMode ? '#d1d5db' : '#64748b',
                              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                            }}
                          ></CardDescription>
                        </CardHeader>

                        <CardContent className="p-0 space-y-6">
                          {/* Description */}
                          <div>
                            <p
                              className="text-sm leading-relaxed transition-colors duration-[400ms]"
                              style={{
                                color: darkMode ? '#e5e7eb' : '#334155',
                                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                              }}
                            >
                              {partner.description}
                            </p>
                          </div>

                          {/* Specializations */}
                          <div>
                            <h4
                              className="flex items-center gap-2 mb-3 transition-colors duration-[400ms]"
                              style={{
                                color: darkMode ? '#22d3ee' : '#0e7490',
                                transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                              }}
                            >
                              <GraduationCap className="w-4 h-4" />
                              <span className="text-sm font-semibold">
                                {language === 'English' ? 'Specializations' : 'Специализации'}
                              </span>
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {partner.specializations.map((spec, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-center gap-2 text-xs transition-colors duration-[400ms]"
                                  style={{
                                    color: darkMode ? '#d1d5db' : '#475569',
                                    transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                                  }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                  {spec}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                              onClick={() => window.open(partner.website, '_blank')}
                              className="flex-1 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white shadow-md"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {t.visitWebsite}
                            </Button>
                            <Button
                              onClick={() => window.open(partner.classesLink, '_blank')}
                              variant="outline"
                              className="flex-1 border-sky-400 text-sky-600 hover:bg-white hover:text-sky-700 hover:border-sky-500 hover:shadow-md dark:border-cyan-600 dark:text-cyan-400 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-300 transition-all duration-200"
                            >
                              <GraduationCap className="w-4 h-4 mr-2" />
                              {t.viewClasses}
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>

          {/* Call to Action */}
          <Card
            className="mt-12 border-2 shadow-md transition-all duration-[400ms]"
            style={{
              background: darkMode
                ? 'linear-gradient(to bottom right, #334155, #1e293b)'
                : 'linear-gradient(to bottom right, #fff7ed, #ffffff)',
              borderColor: darkMode ? '#ea580c' : '#fed7aa',
              transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
            }}
          >
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3
                className="text-xl font-bold mb-2 transition-colors duration-[400ms]"
                style={{
                  color: darkMode ? '#f3f4f6' : '#1e293b',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >
                {language === 'English' ? 'Interested in Partnering?' : 'Интересувате ли се от партньорство?'}
              </h3>
              <p
                className="text-sm mb-4 max-w-2xl mx-auto transition-colors duration-[400ms]"
                style={{
                  color: darkMode ? '#d1d5db' : '#475569',
                  transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >
                {language === 'English'
                  ? 'We\'re always looking to collaborate with quality maritime training providers. Contact us to discuss partnership opportunities.'
                  : 'Винаги търсим да сътрудничим с качествени доставчици на морско оучение. Свържете се с нас, за да обсъдим възможности за партньорство.'}
              </p>
              <Button
                onClick={() => onNavigate('/contact')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md"
              >
                {language === 'English' ? 'Get in Touch' : 'Свържете се с нас'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
