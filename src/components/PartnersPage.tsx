import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, GraduationCap } from 'lucide-react';
import { getTranslation } from '../data/translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface PartnersPageProps {
  onNavigate: (page: string) => void;
  selectedPartnerIndex?: number;
  isLoggedIn?: boolean;
}

export function PartnersPage({ onNavigate, selectedPartnerIndex = 0, isLoggedIn = false }: PartnersPageProps) {
  const { language } = useLanguage();
  const t = getTranslation(language);
  const { darkMode } = useDarkMode();
  const partnerRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Partner data - can be expanded to multiple partners
  const partners = [
    {
      name: 'Maritime Academy Bulgaria',
      description: language === 'English' 
        ? 'Leading maritime training institution offering comprehensive sailing courses, yacht certifications, and professional skipper training. With over 15 years of experience and certified instructors, we provide hands-on training in modern vessels and state-of-the-art facilities.'
        : 'Водеща институция за морско обучение, предлагаща цялостни курсове по ветроходство, сертификати за яхти и професионално обучение за капитани. С над 15 години опит и сертифицирани инструктори, ние предоставяме практическо обучение в модерни плавателни съдове и най-съвременни съоръжения.',
      specializations: language === 'English'
        ? ['RYA Certified Courses', 'Yacht Charter Qualifications', 'Advanced Navigation', 'Safety at Sea Training', 'VHF Radio Operator License']
        : ['RYA Сертифицирани Курсове', 'Квалификации за Чартър на Яхти', 'Напреднала Навигация', 'Обучение за Безопасност на Море', 'Лиценз за VHF Радио Оператор'],
      website: 'https://maritime-academy-bg.com',
      classesLink: 'https://maritime-academy-bg.com/classes',
      image: 'https://images.unsplash.com/photo-1599444941426-db010d9b5ef7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWlsaW5nJTIwc2Nob29sJTIwdHJhaW5pbmclMjBpbnN0cnVjdG9yfGVufDF8fHx8MTc2MjQzNzU1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Black Sea Yacht Charters',
      description: language === 'English' 
        ? 'Premium yacht charter service with a fleet of modern sailing and motor yachts. We offer bareboat and skippered charters along the Bulgarian and Greek coastlines. Perfect for practicing your newly acquired skills in real-world conditions.'
        : 'Премиум услуга за чартър на яхти с флот от модерни ветроходни и моторни яхти. Предлагаме чартър без екипаж и със скипер по българското и гръцкото крайбрежие. Перфектно за практикуване на новопридобитите ви умения в реални условия.',
      specializations: language === 'English'
        ? ['Bareboat Charter', 'Skippered Charter', 'Sailing Holidays', 'Team Building Events', 'Corporate Charters']
        : ['Чартър без Екипаж', 'Чартър със Скипер', 'Ветроходни Ваканции', 'Тийм Билдинг Събития', 'Корпоративни Чартъри'],
      website: 'https://blacksea-yachts.com',
      classesLink: 'https://blacksea-yachts.com/charter',
      image: 'https://images.unsplash.com/photo-1630840754024-8e3817c5e623?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5YWNodCUyMGNoYXJ0ZXIlMjBib2F0JTIwcmVudGFsfGVufDF8fHx8MTc2MjQzODE3MXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Neptune Marine Equipment',
      description: language === 'English' 
        ? 'Your one-stop shop for all maritime safety and navigation equipment. We supply professional-grade gear for exam preparation including safety equipment, navigation tools, and communication devices. Special discounts for our partner exam students.'
        : 'Вашият магазин на едно място за всички морски безопасност и навигационно оборудване. Предлагаме професионално оборудване за подготовка за изпити, включително оборудване за безопасност, навигационни инструменти и комуникационни устройства. Специални отстъпки за студенти от партньорски изпити.',
      specializations: language === 'English'
        ? ['Safety Equipment', 'Navigation Instruments', 'VHF Radios', 'Life Jackets & Safety Gear', 'Electronic Charts']
        : ['Оборудване за Безопасност', 'Навигационни Инструменти', 'VHF Радиостанции', 'Спасителни Жилетки', 'Електронни Карти'],
      website: 'https://neptune-marine.bg',
      classesLink: 'https://neptune-marine.bg/shop',
      image: 'https://images.unsplash.com/photo-1601534961131-1526b4741505?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJpbmUlMjBlcXVpcG1lbnQlMjBzaG9wfGVufDF8fHx8MTc2MjQzODE3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  // Scroll to selected partner on mount
  useEffect(() => {
    if (partnerRefs.current[selectedPartnerIndex]) {
      setTimeout(() => {
        const element = partnerRefs.current[selectedPartnerIndex];
        if (element) {
          const yOffset = -150; // Offset for navbar + banner + some spacing
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [selectedPartnerIndex]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Navigation
        currentPage="partners"
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        transparent={false}
      />
      
      <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fadeIn">
            <h2 className="gradient-ocean mb-4 tracking-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800' }}>
              {t.partnersTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
              {t.partnersSubtitle}
            </p>
          </div>

          {/* Partners List */}
          <div className="space-y-8">
            {partners.map((partner, index) => (
              <div key={index} ref={(el) => partnerRefs.current[index] = el}>
                <Card className="border-2 border-gray-200 dark:border-gray-600 dark:bg-slate-700 shadow-lg overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Partner Image */}
                    <div className="relative h-64 lg:h-auto">
                      <ImageWithFallback
                        src={partner.image}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r" />
                      <div className="absolute bottom-4 left-4 lg:hidden">
                        <h3 className="text-white text-xl font-bold">{partner.name}</h3>
                      </div>
                    </div>

                    {/* Partner Info */}
                    <div className="p-6 lg:py-8">
                      <CardHeader className="p-0 mb-4 hidden lg:block">
                        <CardTitle className="text-2xl dark:text-gray-100 mb-2">{partner.name}</CardTitle>
                        <CardDescription className="text-sm dark:text-gray-300"></CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-0 space-y-6">
                        {/* Description */}
                        <div>
                          <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                            {partner.description}
                          </p>
                        </div>

                        {/* Specializations */}
                        <div>
                          <h4 className="flex items-center gap-2 mb-3 text-cyan-700 dark:text-cyan-400">
                            <GraduationCap className="w-4 h-4" />
                            <span className="text-sm font-semibold">
                              {language === 'English' ? 'Specializations' : 'Специализации'}
                            </span>
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {partner.specializations.map((spec, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-xs">
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
                            className="flex-1 border-cyan-500 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-400 dark:hover:bg-cyan-900/30"
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
            ))}
          </div>

          {/* Call to Action */}
          <Card className="mt-12 border-2 border-orange-200 dark:border-orange-600 bg-gradient-to-br from-orange-50 to-white dark:from-slate-700 dark:to-slate-600 shadow-md">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {language === 'English' ? 'Interested in Partnering?' : 'Интересувате ли се от партньорство?'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
                {language === 'English' 
                  ? 'We\'re always looking to collaborate with quality maritime training providers. Contact us to discuss partnership opportunities.'
                  : 'Винаги търсим да сътрудничим с качествени доставчици на морско обучение. Свържете се с нас, за да обсъдим възможности за партньорство.'}
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
