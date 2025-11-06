import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Skeleton } from './ui/skeleton';
import { ArrowLeft, Check, CreditCard, Mail } from 'lucide-react';
import { ExamType, examData } from '../data/examQuestions';
import { toast } from 'sonner';
import { ButtonSpinner } from './LoadingSpinner';

interface PaymentPageProps {
  userEmail: string;
  onBack: () => void;
  onComplete: (paidExams: ExamType[]) => void;
}

export function PaymentPage({ userEmail, onBack, onComplete }: PaymentPageProps) {
  const [selectedExams, setSelectedExams] = useState<ExamType[]>([]);
  const [email, setEmail] = useState(userEmail);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const examTypes: { type: ExamType; title: string; description: string }[] = [
    { type: 'jet', title: examData.jet.title, description: examData.jet.description },
    { type: 'small', title: examData.small.title, description: examData.small.description },
    { type: 'big', title: examData.big.title, description: examData.big.description },
    { type: 'yacht', title: examData.yacht.title, description: examData.yacht.description },
    { type: 'navigation', title: examData.navigation.title, description: examData.navigation.description },
  ];

  const toggleExam = (examType: ExamType) => {
    if (selectedExams.includes(examType)) {
      setSelectedExams(selectedExams.filter(e => e !== examType));
    } else {
      setSelectedExams([...selectedExams, examType]);
    }
  };

  const totalPrice = selectedExams.length * 5;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedExams.length === 0) {
      toast.error('Please select at least one exam category');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast.success(`Payment successful! Receipt sent to ${email}`);
      setTimeout(() => {
        setIsProcessing(false);
        onComplete(selectedExams);
      }, 800);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button onClick={onBack} variant="ghost" className="mb-8 hover:bg-blue-100 dark:hover:bg-slate-700 dark:text-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block mb-4 px-6 py-2 bg-blue-100 dark:bg-blue-900 rounded-full border border-blue-200 dark:border-blue-700">
            <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold tracking-wide uppercase">Unlock Full Access</span>
          </div>
          <h2 className="gradient-ocean mb-6 tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: '800' }}>
            Premium Exam Access
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Select the exam categories you want to unlock. Each category is €5 per month with unlimited attempts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 shadow-xl dark:bg-slate-700 dark:border-slate-600">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">Select Exam Categories</CardTitle>
                <CardDescription className="dark:text-gray-300">Choose which exams you want full access to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {examTypes.map((exam) => (
                  <div
                    key={exam.type}
                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedExams.includes(exam.type)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => toggleExam(exam.type)}
                  >
                    <Checkbox
                      checked={selectedExams.includes(exam.type)}
                      onCheckedChange={() => toggleExam(exam.type)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="dark:text-gray-100">{exam.title}</h4>
                        <Badge variant="secondary" className="dark:bg-slate-600 dark:text-gray-200">€5/month</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{exam.description}</p>
                      <div className="flex gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>• 40 Questions</span>
                        <span>• Unlimited Attempts</span>
                        <span>• Study & Exam Modes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 shadow-xl dark:bg-slate-700 dark:border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address (for receipt)
                    </Label>
                    <Input
                      id="payment-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-2"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="border-2"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        required
                        className="border-2"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                        className="border-2"
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                    size="lg"
                    disabled={selectedExams.length === 0 || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <ButtonSpinner className="mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      `Complete Payment - €${totalPrice}/month`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-2 border-blue-200 dark:border-blue-600 shadow-xl sticky top-6 bg-gradient-to-br from-blue-50 to-white dark:from-slate-700 dark:to-slate-600">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedExams.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No exams selected
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {selectedExams.map((examType) => {
                        const exam = examTypes.find(e => e.type === examType);
                        return (
                          <div key={examType} className="flex items-center justify-between text-sm dark:text-gray-200">
                            <span>{exam?.title}</span>
                            <span className="font-medium">€5/mo</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t dark:border-slate-500 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="dark:text-gray-200">Monthly Total</span>
                        <span className="text-2xl font-semibold text-blue-600 dark:text-blue-400">€{totalPrice}</span>
                      </div>
                    </div>

                    <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200">What's included:</p>
                      <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>Full access to all 40 questions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>Unlimited exam attempts</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>Study and exam modes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>Track your progress</span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
