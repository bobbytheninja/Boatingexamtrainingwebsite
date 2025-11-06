import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Mail, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Language, getTranslation } from '../data/translations';

interface ContactPageProps {
  onNavigate: (page: string) => void;
  language: Language;
}

export function ContactPage({ onNavigate, language }: ContactPageProps) {
  const t = getTranslation(language);
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

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          onClick={() => onNavigate('home')}
          variant="ghost"
          className="mb-6 hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          {t.backToHome}
        </Button>

        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-block mb-3 px-4 py-1.5 bg-sky-100 dark:bg-sky-900 rounded-full border border-sky-200 dark:border-sky-700">
            <span className="text-sky-700 dark:text-sky-300 text-xs font-semibold tracking-wide uppercase">{t.getInTouch}</span>
          </div>
          <h2 className="gradient-ocean mb-4 tracking-tight" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800' }}>
            {t.contactTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed" dangerouslySetInnerHTML={{ __html: t.contactSubtitle }}>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-gray-200 dark:border-gray-600 dark:bg-slate-700 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg dark:text-gray-100">{t.sendMessage}</CardTitle>
                <CardDescription className="text-xs dark:text-gray-300">Fill out the form below and we'll get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm">{t.fullName}</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">{t.email}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-sm">{t.message}</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="min-h-[120px] resize-none text-sm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-9 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 shadow-md text-sm"
                  >
                    {t.sendMessage}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <Card className="border-2 border-gray-200 dark:border-gray-600 dark:bg-slate-700 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base dark:text-gray-100">{t.contactInfo}</CardTitle>
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
  );
}
