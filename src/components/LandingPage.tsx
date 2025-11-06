import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Waves, Ship, Anchor, Sailboat, Compass } from 'lucide-react';
import { ExamType } from '../data/examQuestions';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onSelectExam: (examType: ExamType) => void;
}

export function LandingPage({ onSelectExam }: LandingPageProps) {
  const examTypes = [
    {
      type: 'jet' as ExamType,
      title: 'Jet Ski License',
      description: 'Test your knowledge for operating personal watercraft',
      icon: Waves,
      image: 'https://images.unsplash.com/photo-1745285282175-8f666307c2b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXQlMjBza2klMjB3YXRlcnxlbnwxfHx8fDE3NjIzNDkyNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'bg-cyan-500',
    },
    {
      type: 'small' as ExamType,
      title: 'Small Boat License',
      description: 'Qualify for operating small motorboats and vessels',
      icon: Anchor,
      image: 'https://images.unsplash.com/photo-1761918176516-af00413964ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMG1vdG9yYm9hdCUyMG9jZWFufGVufDF8fHx8MTc2MjM0OTI3Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'bg-blue-500',
    },
    {
      type: 'big' as ExamType,
      title: 'Large Vessel License',
      description: 'Advanced certification for operating yachts and large boats',
      icon: Ship,
      image: 'https://images.unsplash.com/photo-1739125856470-ee250175c612?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXJnZSUyMHlhY2h0JTIwc2FpbGluZ3xlbnwxfHx8fDE3NjIzNDkyNzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'bg-indigo-500',
    },
    {
      type: 'yacht' as ExamType,
      title: 'Yacht License (up to 50 tons)',
      description: 'Certification for operating yachts up to 50 tons',
      icon: Sailboat,
      image: 'https://images.unsplash.com/photo-1740482881430-53d0e1c04fef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5YWNodCUyMGhhcmJvciUyMGx1eHVyeXxlbnwxfHx8fDE3NjIzNTAwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'bg-purple-500',
    },
    {
      type: 'navigation' as ExamType,
      title: 'Navigation Device License',
      description: 'Specialized certification for marine navigation equipment',
      icon: Compass,
      image: 'https://images.unsplash.com/photo-1723988433925-035f8625b5c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJpbmUlMjBuYXZpZ2F0aW9uJTIwY29tcGFzc3xlbnwxfHx8fDE3NjIzNTAwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'bg-teal-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-20">
        <div className="text-center mb-20 animate-fadeIn">
          <div className="inline-block mb-4 px-6 py-2 bg-blue-100 rounded-full border border-blue-200">
            <span className="text-blue-700 text-sm font-semibold tracking-wide uppercase">Training Programs</span>
          </div>
          <h2 className="gradient-ocean mb-6 tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800' }}>
            Choose Your Certification Path
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl font-light leading-relaxed">
            Select your maritime training program. Professional preparation for real-world certification exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {examTypes.map((exam, index) => {
            const Icon = exam.icon;
            return (
              <Card 
                key={exam.type} 
                className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200/50 bg-white backdrop-blur-sm hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={exam.image}
                    alt={exam.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative h-full flex items-end p-5">
                    <div className={`absolute top-5 right-5 ${exam.color} p-3.5 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{exam.title}</CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">{exam.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => onSelectExam(exam.type)}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] font-semibold"
                    size="lg"
                  >
                    Begin Training
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-0 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
            <CardHeader className="relative text-center pb-10 pt-12">
              <div className="inline-block mb-4 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-blue-200 text-sm font-semibold tracking-wider uppercase">How It Works</span>
              </div>
              <CardTitle className="text-white text-3xl md:text-4xl font-bold tracking-tight">
                Professional Training Process
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
                <div className="text-center group">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold">1</span>
                    </div>
                  </div>
                  <h4 className="text-white mb-3 text-lg font-semibold">Select Your Path</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">Choose from our range of maritime certifications</p>
                </div>
                <div className="text-center group">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold">2</span>
                    </div>
                  </div>
                  <h4 className="text-white mb-3 text-lg font-semibold">Train & Practice</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">Master the material with our comprehensive question bank</p>
                </div>
                <div className="text-center group">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold">3</span>
                    </div>
                  </div>
                  <h4 className="text-white mb-3 text-lg font-semibold">Track Progress</h4>
                  <p className="text-blue-200 text-sm leading-relaxed">Monitor your improvement and achieve excellence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
