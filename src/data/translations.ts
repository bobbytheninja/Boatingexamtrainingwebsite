// To add a new language:
// 1. Add the language name to the Language type below (e.g., 'German' | 'French')
// 2. Create a new translation object in the translations record at the bottom
// 3. Copy all the English translations and translate each string to the new language

export type Language = 'English' | 'Bulgarian' | 'Spanish' | 'Greek';

export interface Translations {
  // Navigation
  home: string;
  pricing: string;
  contact: string;
  account: string;
  login: string;
  backToHome: string;
  partners: string;

  // Home Page
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  getStarted: string;
  learnMore: string;
  examCategories: string;
  examCategoriesSubtitle: string;
  jetSki: string;
  jetSkiDesc: string;
  smallBoat: string;
  smallBoatDesc: string;
  bigBoat: string;
  bigBoatDesc: string;
  yacht: string;
  yachtDesc: string;
  navigationDevice: string;
  navigationDeviceDesc: string;
  selectExam: string;
  howItWorks: string;
  howItWorksSubtitle: string;
  chooseCategory: string;
  chooseCategoryDesc: string;
  selectMode: string;
  selectModeDesc: string;
  takeExam: string;
  takeExamDesc: string;
  getResults: string;
  getResultsDesc: string;
  disclaimer: string;
  disclaimerText: string;

  // Pricing Page
  pricingTitle: string;
  pricingSubtitle: string;
  free: string;
  practiceMode: string;
  practiceModeDesc: string;
  perMonth: string;
  questionsPerExam: string;
  allCategories: string;
  studyExamModes: string;
  noCardRequired: string;
  getStartedFree: string;
  mostPopular: string;
  fullAccess: string;
  fullAccessDesc: string;
  perMonthPerCategory: string;
  allQuestions: string;
  unlimitedAttempts: string;
  bothModes: string;
  progressTracking: string;
  timedExams: string;
  cancelAnytime: string;
  getFullAccess: string;

  // Contact Page
  contactTitle: string;
  contactSubtitle: string;
  getInTouch: string;
  fullName: string;
  email: string;
  message: string;
  sendMessage: string;
  contactInfo: string;
  emailUs: string;
  location: string;
  phone: string;

  // Login Page
  welcomeAboard: string;
  signInToContinue: string;
  accountAccess: string;
  enterCredentials: string;
  signIn: string;
  signUp: string;
  password: string;
  createAccount: string;
  demoMode: string;
  welcomeBack: string;
  accountCreated: string;

  // Account Page
  myAccount: string;
  accountInfo: string;
  memberSince: string;
  subscriptions: string;
  yourSubscriptions: string;
  active: string;
  viewExams: string;
  noSubscriptions: string;
  upgradeNow: string;
  logout: string;
  accountDetails: string;
  accountStatus: string;
  manageSubscriptions: string;
  activeSubscriptions: string;
  currentExamAccess: string;
  noActiveSubscriptions: string;
  noActiveSubscriptionsDesc: string;
  browsePlans: string;
  validUntil: string;
  daysRemaining: string;
  expiringSoon: string;
  monthlySubscription: string;
  startExam: string;
  startStudy: string;
  wantMoreExams: string;
  additionalCategories: string;
  addMore: string;
  yourProgress: string;
  trackPerformance: string;
  activeExams: string;
  examsCompleted: string;
  averageScore: string;
  manageAccount: string;

  // Exam Mode Selection
  selectExamMode: string;
  selectModeTitle: string;
  studyMode: string;
  studyModeDesc: string;
  examMode: string;
  examModeDesc: string;
  mockExam: string;
  mockExamDesc: string;
  paidExam: string;
  paidExamDesc: string;
  questionsAvailable: string;
  unlockAll: string;
  startExam: string;
  upgradeRequired: string;
  instantFeedback: string;
  learnAsPractice: string;
  perfectForBeginners: string;
  realisticExamSim: string;
  sixtyMinTimer: string;
  resultsAtCompletion: string;
  selectExamType: string;
  freePractice: string;
  freePracticeDesc: string;
  tenQuestions: string;
  bothStudyExamModes: string;
  startFree: string;
  fullAccessTitle: string;
  fullAccessDescription: string;
  fortyQuestions: string;
  trackProgress: string;
  startFull: string;
  fullAccessNote: string;

  // Exam Page
  timeRemaining: string;
  question: string;
  of: string;
  points: string;
  point: string;
  questionNavigator: string;
  answered: string;
  answeredCorrectly: string;
  answeredIncorrectly: string;
  unanswered: string;
  current: string;
  submitAndNext: string;
  next: string;
  previous: string;
  finish: string;
  continue: string;
  finishExam: string;
  submitExam: string;
  examResults: string;
  yourScore: string;
  passed: string;
  notPassed: string;
  failed: string;
  correctAnswers: string;
  select: string;
  selectMultipleAnswers: string;
  timeUsed: string;
  passingScore: string;
  reviewAnswers: string;
  retakeExam: string;
  backToExams: string;
  exitExam: string;
  exitExamTitle: string;
  exitExamMessage: string;
  continueExam: string;
  exitAndLoseProgress: string;
  submitExamTitle: string;
  submitExamMessage: string;
  cancelSubmit: string;
  confirmSubmit: string;
  complete: string;
  pointsLost: string;
  maximum: string;
  correct: string;
  incorrect: string;
  noPointsLost: string;
  pointsLostMessage: string;
  correctAnswerHighlighted: string;
  wantToUpgrade: string;
  upgradeMessage: string;
  upgradeNowLink: string;

  // Payment Page
  selectCategories: string;
  selectCategoriesDesc: string;
  monthlyPerCategory: string;
  totalMonthly: string;
  noCategoriesSelected: string;
  proceedToPayment: string;
  paymentDetails: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  completePayment: string;
  securePayment: string;

  // Partners Page
  partnersTitle: string;
  partnersSubtitle: string;
  ourPartners: string;
  visitWebsite: string;
  viewClasses: string;
  partnerBannerText1: string;
  partnerBannerText2: string;
  partnerBannerText3: string;
}

export const translations: Record<Language, Translations> = {
  English: {
    // Navigation
    home: 'Home',
    pricing: 'Pricing',
    contact: 'Contact',
    account: 'Account',
    login: 'Login',
    backToHome: 'Back to Home',
    partners: 'Partners',

    // Home Page
    heroTitle: 'Master Your Maritime Certification',
    heroSubtitle: 'Professional Yacht & Boat Exam Training',
    heroDescription: 'Comprehensive online training platform for maritime certification exams. Practice with real exam questions and pass with confidence.',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    examCategories: 'Exam Categories',
    examCategoriesSubtitle: 'Choose your path',
    jetSki: 'Jet Ski',
    jetSkiDesc: 'Master personal watercraft operation',
    smallBoat: 'Small Boat',
    smallBoatDesc: 'Essential skills for small vessel navigation',
    bigBoat: 'Big Boat',
    bigBoatDesc: 'Advanced techniques for larger vessels',
    yacht: 'Yacht (up to 50 tons)',
    yachtDesc: 'Professional yacht certification',
    navigationDevice: 'Navigation Device',
    navigationDeviceDesc: 'Master maritime navigation technology',
    selectExam: 'Select Exam',
    howItWorks: 'How It Works',
    howItWorksSubtitle: 'Your path to certification success',
    chooseCategory: 'Choose Category',
    chooseCategoryDesc: 'Select from 5 exam categories',
    selectMode: 'Select Mode',
    selectModeDesc: 'Study or exam mode',
    takeExam: 'Take Exam',
    takeExamDesc: '40 questions, 60 minutes',
    getResults: 'Get Results',
    getResultsDesc: 'Instant feedback and analysis',
    disclaimer: 'Training Disclaimer',
    disclaimerText: 'These exams are for training purposes only and do not provide certification. They are designed to help you prepare for maritime exams.',

    // Pricing Page
    pricingTitle: 'Simple, Transparent Pricing',
    pricingSubtitle: 'Choose the plan that works for you',
    free: 'Free',
    practiceMode: 'Practice Mode',
    practiceModeDesc: 'Perfect for getting started',
    perMonth: '/month',
    questionsPerExam: '10 practice questions per exam',
    allCategories: 'All 5 exam categories',
    studyExamModes: 'Study & exam modes',
    noCardRequired: 'No credit card required',
    getStartedFree: 'Get Started Free',
    mostPopular: 'Most Popular',
    fullAccess: 'Full Access',
    fullAccessDesc: 'Complete training experience',
    perMonthPerCategory: '/month per category',
    allQuestions: 'All 40 exam questions',
    unlimitedAttempts: 'Unlimited practice attempts',
    bothModes: 'Both study & exam modes',
    progressTracking: 'Detailed progress tracking',
    timedExams: '60-minute timed exams',
    cancelAnytime: 'Cancel anytime',
    getFullAccess: 'Get Full Access',

    // Contact Page
    contactTitle: 'Contact Us',
    contactSubtitle: 'Have questions? We\'d love to hear from you. Have business opportunities for us regarding class teachings or would you like to advertise on our page? We\'d love to hear from you even more!',
    getInTouch: 'Get in Touch',
    fullName: 'Full Name',
    email: 'Email',
    message: 'Message',
    sendMessage: 'Send Message',
    contactInfo: 'Contact Information',
    emailUs: 'Email us at',
    location: 'Location',
    phone: 'Phone',

    // Login Page
    welcomeAboard: 'Welcome Aboard',
    signInToContinue: 'Sign in to continue your maritime training',
    accountAccess: 'Account Access',
    enterCredentials: 'Enter your credentials to get started',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    password: 'Password',
    createAccount: 'Create Account',
    demoMode: '✨ Demo Mode: Enter any email to continue',
    welcomeBack: 'Welcome back!',
    accountCreated: 'Account created successfully!',

    // Account Page
    myAccount: 'My Account',
    accountInfo: 'Account Information',
    memberSince: 'Member since',
    subscriptions: 'Subscriptions',
    yourSubscriptions: 'Your Subscriptions',
    active: 'Active',
    viewExams: 'View Exams',
    noSubscriptions: 'No active subscriptions',
    upgradeNow: 'Upgrade Now',
    logout: 'Logout',
    accountDetails: 'Account Details',
    accountStatus: 'Account Status',
    manageSubscriptions: 'Manage Subscriptions',
    activeSubscriptions: 'Active Subscriptions',
    currentExamAccess: 'Your current exam access and validity periods',
    noActiveSubscriptions: 'No Active Subscriptions',
    noActiveSubscriptionsDesc: 'You don\'t have any active exam subscriptions yet',
    browsePlans: 'Browse Plans',
    validUntil: 'Valid until',
    daysRemaining: 'days remaining',
    expiringSoon: 'Expiring Soon',
    monthlySubscription: 'Monthly subscription',
    startExam: 'Start Exam',
    startStudy: 'Start Study',
    wantMoreExams: 'Want to add more exams?',
    additionalCategories: 'Get access to additional exam categories',
    addMore: 'Add More',
    yourProgress: 'Your Progress',
    trackPerformance: 'Track your training performance',
    activeExams: 'Active Exams',
    examsCompleted: 'Exams Completed',
    averageScore: 'Average Score',
    manageAccount: 'Manage your subscriptions and account settings',

    // Exam Mode Selection
    selectExamMode: 'Select Exam Mode',
    selectModeTitle: 'Choose your learning approach',
    studyMode: 'Study Mode',
    studyModeDesc: 'See correct answers immediately after each question',
    examMode: 'Exam Mode',
    examModeDesc: 'Simulate real exam conditions with results at the end',
    mockExam: 'Mock Exam',
    mockExamDesc: 'Free practice with limited questions',
    paidExam: 'Paid Exam',
    paidExamDesc: 'Full exam experience with all questions',
    questionsAvailable: 'questions available',
    unlockAll: 'Unlock all 40 questions',
    startExam: 'Start Exam',
    upgradeRequired: 'Upgrade Required',
    instantFeedback: 'Instant feedback on answers',
    learnAsPractice: 'Learn as you practice',
    perfectForBeginners: 'Perfect for beginners',
    realisticExamSim: 'Realistic exam simulation',
    sixtyMinTimer: '60-minute timer',
    resultsAtCompletion: 'Results at completion',
    selectExamType: 'Select Exam Type',
    freePractice: 'Free Practice',
    freePracticeDesc: 'Try 10 questions for free to get started',
    tenQuestions: '10 practice questions',
    bothStudyExamModes: 'Both study & exam modes',
    startFree: 'Start Free',
    fullAccessTitle: 'Full Access',
    fullAccessDescription: 'Complete training with all 40 questions',
    fortyQuestions: 'All 40 exam questions',
    trackProgress: 'Track your progress',
    startFull: 'Start Full',
    fullAccessNote: 'Note: Full access requires €5/month per category. Try our free practice to experience the platform before upgrading.',

    // Exam Page
    timeRemaining: 'Time Remaining',
    question: 'Question',
    of: 'of',
    points: 'points',
    point: 'point',
    questionNavigator: 'Question Navigator',
    answered: 'Answered',
    answeredCorrectly: 'Answered Correctly',
    answeredIncorrectly: 'Answered Incorrectly',
    unanswered: 'Unanswered',
    current: 'Current',
    submitAndNext: 'Submit & Next',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    continue: 'Continue',
    finishExam: 'Finish Exam',
    submitExam: 'Submit Exam',
    examResults: 'Exam Results',
    yourScore: 'Your Score',
    passed: 'Passed',
    notPassed: 'Not Passed',
    failed: 'Failed',
    correctAnswers: 'Correct Answers',
    select: 'Select',
    selectMultipleAnswers: 'Select {count} answers',
    timeUsed: 'Time Used',
    passingScore: 'Passing Score',
    reviewAnswers: 'Review Answers',
    retakeExam: 'Retake Exam',
    backToExams: 'Back to Exams',
    exitExam: 'Exit Exam',
    exitExamTitle: 'Exit Exam?',
    exitExamMessage: 'You will lose all your progress if you exit the exam. This action cannot be undone.',
    continueExam: 'Continue Exam',
    exitAndLoseProgress: 'Exit and Lose Progress',
    submitExamTitle: 'Submit Exam?',
    submitExamMessage: 'Are you sure you want to submit your exam? You will not be able to change your answers after submission.',
    cancelSubmit: 'Cancel',
    confirmSubmit: 'Submit',
    complete: 'Complete',
    pointsLost: 'Points Lost',
    maximum: 'Maximum',
    correct: 'Correct!',
    incorrect: 'Incorrect.',
    noPointsLost: 'No points lost',
    pointsLostMessage: 'points lost. The correct answer is highlighted above.',
    correctAnswerHighlighted: 'The correct answer is highlighted above.',
    wantToUpgrade: 'Want to practice with all 40 questions?',
    upgradeMessage: 'Upgrade to the full exam for just €5/month per category.',
    upgradeNowLink: 'Upgrade Now →',

    // Payment Page
    selectCategories: 'Select Exam Categories',
    selectCategoriesDesc: 'Choose which exam categories you want to unlock',
    monthlyPerCategory: 'monthly per category',
    totalMonthly: 'Total Monthly',
    noCategoriesSelected: 'No categories selected',
    proceedToPayment: 'Proceed to Payment',
    paymentDetails: 'Payment Details',
    cardNumber: 'Card Number',
    expiryDate: 'Expiry Date',
    cvv: 'CVV',
    completePayment: 'Complete Payment',
    securePayment: 'Secure payment powered by industry-standard encryption',

    // Partners Page
    partnersTitle: 'People We Partner With',
    partnersSubtitle: 'Partners help us prepare test materials',
    ourPartners: 'Our Partners',
    visitWebsite: 'Visit Website',
    viewClasses: 'View Classes',
    partnerBannerText1: '⚓ Maritime Academy Bulgaria - Professional sailing courses and yacht certifications',
    partnerBannerText2: '🌊 Black Sea Yacht Charters - Premium yacht rentals and skippered charters',
    partnerBannerText3: '⛵ Neptune Marine Equipment - All your maritime safety and navigation gear',
  },
  Bulgarian: {
    // Navigation
    home: 'Начало',
    pricing: 'Цени',
    contact: 'Контакт',
    account: 'Акаунт',
    login: 'Вход',
    backToHome: 'Назад към Начало',
    partners: 'Партньори',

    // Home Page
    heroTitle: 'Овладейте Морската Си Сертификация',
    heroSubtitle: 'Професионално Обучение за Яхти и Лодки',
    heroDescription: 'Цялостна онлайн платформа за обучение за морски сертификационни изпити. Практикувайте с реални изпитни въпроси и издържайте с увереност.',
    getStarted: 'Започнете',
    learnMore: 'Научете Повече',
    examCategories: 'Категории Изпити',
    examCategoriesSubtitle: 'Изберете вашия път',
    jetSki: 'Джет Ски',
    jetSkiDesc: 'Овладейте управлението на личен воден скутер',
    smallBoat: 'Малка Лодка',
    smallBoatDesc: 'Основни умения за навигация на малки кораби',
    bigBoat: 'Голяма Лодка',
    bigBoatDesc: 'Усъвършенствани техники за по-големи кораби',
    yacht: 'Яхта (до 50 тона)',
    yachtDesc: 'Професионална сертификация за яхти',
    navigationDevice: 'Навигационно Устройство',
    navigationDeviceDesc: 'Овладейте морската навигационна технология',
    selectExam: 'Изберете Изпит',
    howItWorks: 'Как Работи',
    howItWorksSubtitle: 'Вашият път към ус��еха на сертификацията',
    chooseCategory: 'Изберете Катего��ия',
    chooseCategoryDesc: 'Изберете от 5 категории изпити',
    selectMode: 'Изберете Режим',
    selectModeDesc: 'Режим на обучение или изпит',
    takeExam: 'Започнете Изпит',
    takeExamDesc: '40 въпроса, 60 минути',
    getResults: 'Получете Резултати',
    getResultsDesc: 'Незабавна обратна връзка и анализ',
    disclaimer: 'Декларация за Обучение',
    disclaimerText: 'Тези изпити са само за обучителни цели и не предоставят сертификация. Те са проектирани да ви помогнат да се подготвите за морски изпити.',

    // Pricing Page
    pricingTitle: 'Прости, Прозрачни Цени',
    pricingSubtitle: 'Изберете плана, който работи за вас',
    free: 'Безплатно',
    practiceMode: 'Режим на Практика',
    practiceModeDesc: 'Перфектно за начало',
    perMonth: '/месец',
    questionsPerExam: '10 практически въпроса на изпит',
    allCategories: 'Всички 5 категории изпити',
    studyExamModes: 'Режими на обучение и изпит',
    noCardRequired: 'Не се изисква кредитна карта',
    getStartedFree: 'Започнете Безплатно',
    mostPopular: 'Най-Популярно',
    fullAccess: 'Пълен Достъп',
    fullAccessDesc: 'Пълно обучително преживяване',
    perMonthPerCategory: '/месец на категория',
    allQuestions: 'Всички 40 изпитни въпроса',
    unlimitedAttempts: 'Неограничени опити за практика',
    bothModes: 'Двата режима на обучение и изпит',
    progressTracking: 'Детайлно проследяване на напредъка',
    timedExams: '60-минутни изпити с време',
    cancelAnytime: 'Отменете по всяко време',
    getFullAccess: 'Получете Пълен Достъп',

    // Contact Page
    contactTitle: 'Свържете се с Нас',
    contactSubtitle: 'Имате въпроси? Ще се радваме да чуем от вас. Имате бизнес <strong>възможности</strong> за нас относно <strong>преподаване на класове</strong> или искате да <strong>рекламирате</strong> на нашата страница? Ще се радваме да чуем от вас още повече!',
    getInTouch: 'Свържете се',
    fullName: 'Пълно Име',
    email: 'Имейл',
    message: 'Съобщение',
    sendMessage: 'Изпрати Съобщение',
    contactInfo: 'Информация за Контакт',
    emailUs: 'Пишете ни на',
    location: 'Местоположение',
    phone: 'Телефон',

    // Login Page
    welcomeAboard: 'Добре Дошли на Борда',
    signInToContinue: 'Влезте, за да продължите морското си обучение',
    accountAccess: 'Достъп до Акаунт',
    enterCredentials: 'Въведете вашите данни за начало',
    signIn: 'Вход',
    signUp: 'Регистрация',
    password: 'Парола',
    createAccount: 'Създай Акаунт',
    demoMode: '✨ Демо Режим: Въведете произволен имейл за продължаване',
    welcomeBack: 'Добре дошли отново!',
    accountCreated: 'Акаунтът е създаден успешно!',

    // Account Page
    myAccount: 'Моят Акаунт',
    accountInfo: 'Информация за Акаунта',
    memberSince: 'Член от',
    subscriptions: 'Абонаменти',
    yourSubscriptions: 'Вашите Абонаменти',
    active: 'Активен',
    viewExams: 'Виж Изпити',
    noSubscriptions: 'Няма активни абонаменти',
    upgradeNow: 'Надстройте Сега',
    logout: 'Изход',
    accountDetails: 'Детайли за Акаунта',
    accountStatus: 'Статус на Акаунта',
    manageSubscriptions: 'Управление на Абонаментите',
    activeSubscriptions: 'Активни Абонаменти',
    currentExamAccess: 'Вашият текущ достъп до изпити и валидност',
    noActiveSubscriptions: 'Няма Активни Абонаменти',
    noActiveSubscriptionsDesc: 'Все още нямате активни абонаменти за изпити',
    browsePlans: 'Разгледай Планове',
    validUntil: 'Валиден до',
    daysRemaining: 'оставащи дни',
    expiringSoon: 'Изтича Скоро',
    monthlySubscription: 'Месечен абонамент',
    startExam: 'Започни Изпит',
    startStudy: 'Започни Обучение',
    wantMoreExams: 'Искате да добавите повече изпити?',
    additionalCategories: 'Получете достъп до допълнителни категории изпити',
    addMore: 'Добави Още',
    yourProgress: 'Вашият Напредък',
    trackPerformance: 'Проследете вашето обучение',
    activeExams: 'Активни Изпити',
    examsCompleted: 'Завършени Изпити',
    averageScore: 'Среден Резултат',
    manageAccount: 'Управлявайте вашите абонаменти и настройки на акаунта',

    // Exam Mode Selection
    selectExamMode: 'Изберете Режим на Изпит',
    selectModeTitle: 'Изберете вашия подход на обучение',
    studyMode: 'Режим на Обучение',
    studyModeDesc: 'Вижте правилните отговори веднага след всеки въпрос',
    examMode: 'Режим на Изпит',
    examModeDesc: 'Симулирайте реални условия на изпит с резултати в края',
    mockExam: 'Пробен Изпит',
    mockExamDesc: 'Безплатна практика с ограничени въпроси',
    paidExam: 'Платен Изпит',
    paidExamDesc: 'Пълно изпитно преживяване с всички въпроси',
    questionsAvailable: 'налични въпроси',
    unlockAll: 'Отключете всички 40 въпроса',
    startExam: 'Започни Изпит',
    upgradeRequired: 'Изисква се Надстройка',
    instantFeedback: 'Незабавна обратна връзка за отговорите',
    learnAsPractice: 'Учете докато практикувате',
    perfectForBeginners: 'Перфектен за начинаещи',
    realisticExamSim: 'Реалистична симулация на изпит',
    sixtyMinTimer: '60-минутен таймер',
    resultsAtCompletion: 'Резултати при завършване',
    selectExamType: 'Изберете Тип Изпит',
    freePractice: 'Безплатна Практика',
    freePracticeDesc: 'Опитайте 10 въпроса безплатно за начало',
    tenQuestions: '10 практически въпроса',
    bothStudyExamModes: 'Двата режима на обучение и изпит',
    startFree: 'Започни Безплатно',
    fullAccessTitle: 'Пълен Достъп',
    fullAccessDescription: 'Пълно обучение с всички 40 въпроса',
    fortyQuestions: 'Всички 40 изпитни въпроса',
    trackProgress: 'Проследявайте напредъка си',
    startFull: 'Започни Пълен',
    fullAccessNote: 'Забележка: Пълният достъп изисква €5/месец на категория. Опитайте нашата безплатна практика, за да изпитате платформата преди надграждане.',

    // Exam Page
    timeRemaining: 'Оставащо Време',
    question: 'Въпрос',
    of: 'от',
    points: 'точки',
    point: 'точка',
    questionNavigator: 'Навигатор на Въпроси',
    answered: 'Отговорени',
    answeredCorrectly: 'Верно Отговорени',
    answeredIncorrectly: 'Грешно Отговорени',
    unanswered: 'Неотговорени',
    current: 'Текущ',
    submitAndNext: 'Изпрати и Следващ',
    next: 'Следващ',
    previous: 'Предишен',
    finish: 'Завърши',
    continue: 'Продължи',
    finishExam: 'Завърши Изпит',
    submitExam: 'Предай Изпит',
    examResults: 'Резултати от Изпит',
    yourScore: 'Вашият Резултат',
    passed: 'Издържан',
    notPassed: 'Неиздържан',
    failed: 'Неиздържан',
    correctAnswers: 'Верни Отговори',
    select: 'Изберете',
    selectMultipleAnswers: 'Изберете {count} отговора',
    timeUsed: 'Използвано Време',
    passingScore: 'Минимален Резултат',
    reviewAnswers: 'Преглед на Отговорите',
    retakeExam: 'Повтори Изпит',
    backToExams: 'Назад към Изпитите',
    exitExam: 'Излез от Изпит',
    exitExamTitle: 'Излизане от Изпит?',
    exitExamMessage: 'Ще загубите целия си напредък, ако излезете от изпита. Това действие не може да бъде отменено.',
    continueExam: 'Продължи Изпит',
    exitAndLoseProgress: 'Излез и Загуби Напредък',
    submitExamTitle: 'Предаване на Изпит?',
    submitExamMessage: 'Сигурни ли сте, че искате да предадете изпита си? Няма да можете да промените отговорите си след предаването.',
    cancelSubmit: 'Отказ',
    confirmSubmit: 'Предай',
    complete: 'Завършен',
    pointsLost: 'Загубени Точки',
    maximum: 'Максимум',
    correct: 'Вярно!',
    incorrect: 'Грешно.',
    noPointsLost: 'Без загубени точки',
    pointsLostMessage: 'загубени точки. Правилният отговор е маркиран по-горе.',
    correctAnswerHighlighted: 'Правилният отговор е маркиран по-горе.',
    wantToUpgrade: 'Искате да практикувате с всички 40 въпроса?',
    upgradeMessage: 'Надстройте до пълния изпит само за €5/месец на категория.',
    upgradeNowLink: 'Надстройте Сега →',

    // Payment Page
    selectCategories: 'Изберете Категории Изпити',
    selectCategoriesDesc: 'Изберете кои категории изпити искате да отключите',
    monthlyPerCategory: 'месечно на категория',
    totalMonthly: 'Общо Месечно',
    noCategoriesSelected: 'Не са избрани категории',
    proceedToPayment: 'Продължете към Плащане',
    paymentDetails: 'Детайли за Плащане',
    cardNumber: 'Номер на Карта',
    expiryDate: 'Дата на Изтичане',
    cvv: 'CVV',
    completePayment: 'Завършете Плащането',
    securePayment: 'Сигурно плащане, защитено с индустриален стандарт за криптиране',

    // Partners Page
    partnersTitle: 'Хора, с Които Партнираме',
    partnersSubtitle: 'Партньорите ни помагат да подготвим тестови материали',
    ourPartners: 'Нашите Партньори',
    visitWebsite: 'Посетете Уебсайта',
    viewClasses: 'Вижте Курсовете',
    partnerBannerText1: '⚓ Maritime Academy Bulgaria - Професионални курсове по ветроходство и сертификати за яхти',
    partnerBannerText2: '🌊 Black Sea Yacht Charters - Премиум чартър на яхти със и без екипаж',
    partnerBannerText3: '⛵ Neptune Marine Equipment - Всичко за морска безопасност и навигационно оборудване',
  },
  Spanish: {
    // Navigation
    home: 'Inicio',
    pricing: 'Precios',
    contact: 'Contacto',
    account: 'Cuenta',
    login: 'Iniciar Sesión',
    backToHome: 'Volver al Inicio',
    partners: 'Socios',

    // Home Page
    heroTitle: 'Domine Su Certificación Marítima',
    heroSubtitle: 'Capacitación Profesional en Exámenes de Yates y Embarcaciones',
    heroDescription: 'Plataforma de capacitación en línea integral para exámenes de certificación marítima. Practique con preguntas de examen reales y apruebe con confianza.',
    getStarted: 'Comenzar',
    learnMore: 'Saber Más',
    examCategories: 'Categorías de Examen',
    examCategoriesSubtitle: 'Elija su camino',
    jetSki: 'Moto de Agua',
    jetSkiDesc: 'Domine la operación de motos acuáticas',
    smallBoat: 'Embarcación Pequeña',
    smallBoatDesc: 'Habilidades esenciales para navegación de embarcaciones pequeñas',
    bigBoat: 'Embarcación Grande',
    bigBoatDesc: 'Técnicas avanzadas para embarcaciones más grandes',
    yacht: 'Yate (hasta 50 toneladas)',
    yachtDesc: 'Certificación profesional de yates',
    navigationDevice: 'Dispositivo de Navegación',
    navigationDeviceDesc: 'Domine la tecnología de navegación marítima',
    selectExam: 'Seleccionar Examen',
    howItWorks: 'Cómo Funciona',
    howItWorksSubtitle: 'Su camino al éxito en la certificación',
    chooseCategory: 'Elegir Categoría',
    chooseCategoryDesc: 'Seleccione de 5 categorías de examen',
    selectMode: 'Seleccionar Modo',
    selectModeDesc: 'Modo de estudio o examen',
    takeExam: 'Realizar Examen',
    takeExamDesc: '40 preguntas, 60 minutos',
    getResults: 'Obtener Resultados',
    getResultsDesc: 'Retroalimentación y análisis instantáneos',
    disclaimer: 'Aviso de Capacitación',
    disclaimerText: 'Estos exámenes son solo para fines de capacitación y no proporcionan certificación. Están diseñados para ayudarle a prepararse para exámenes marítimos.',

    // Pricing Page
    pricingTitle: 'Precios Simples y Transparentes',
    pricingSubtitle: 'Elija el plan que funcione para usted',
    free: 'Gratis',
    practiceMode: 'Modo de Práctica',
    practiceModeDesc: 'Perfecto para empezar',
    perMonth: '/mes',
    questionsPerExam: '10 preguntas de práctica por examen',
    allCategories: 'Las 5 categorías de examen',
    studyExamModes: 'Modos de estudio y examen',
    noCardRequired: 'No se requiere tarjeta de crédito',
    getStartedFree: 'Comenzar Gratis',
    mostPopular: 'Más Popular',
    fullAccess: 'Acceso Completo',
    fullAccessDesc: 'Experiencia de capacitación completa',
    perMonthPerCategory: '/mes por categoría',
    allQuestions: 'Las 40 preguntas del examen',
    unlimitedAttempts: 'Intentos de práctica ilimitados',
    bothModes: 'Ambos modos de estudio y examen',
    progressTracking: 'Seguimiento detallado del progreso',
    timedExams: 'Exámenes cronometrados de 60 minutos',
    cancelAnytime: 'Cancele en cualquier momento',
    getFullAccess: 'Obtener Acceso Completo',

    // Contact Page
    contactTitle: 'Contáctenos',
    contactSubtitle: '¿Tiene preguntas? Nos encantaría saber de usted. ¿Tiene oportunidades de negocio para nosotros sobre enseñanza de clases o le gustaría anunciarse en nuestra página? ¡Nos encantaría saber de usted aún más!',
    getInTouch: 'Póngase en Contacto',
    fullName: 'Nombre Completo',
    email: 'Correo Electrónico',
    message: 'Mensaje',
    sendMessage: 'Enviar Mensaje',
    contactInfo: 'Información de Contacto',
    emailUs: 'Envíenos un correo a',
    location: 'Ubicación',
    phone: 'Teléfono',

    // Login Page
    welcomeAboard: 'Bienvenido a Bordo',
    signInToContinue: 'Inicie sesión para continuar su capacitación marítima',
    accountAccess: 'Acceso a la Cuenta',
    enterCredentials: 'Ingrese sus credenciales para comenzar',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    password: 'Contraseña',
    createAccount: 'Crear Cuenta',
    demoMode: '✨ Modo Demo: Ingrese cualquier correo para continuar',
    welcomeBack: '¡Bienvenido de nuevo!',
    accountCreated: '¡Cuenta creada exitosamente!',

    // Account Page
    myAccount: 'Mi Cuenta',
    accountInfo: 'Información de la Cuenta',
    memberSince: 'Miembro desde',
    subscriptions: 'Suscripciones',
    yourSubscriptions: 'Sus Suscripciones',
    active: 'Activo',
    viewExams: 'Ver Exámenes',
    noSubscriptions: 'Sin suscripciones activas',
    upgradeNow: 'Actualizar Ahora',
    logout: 'Cerrar Sesión',
    accountDetails: 'Detalles de la Cuenta',
    accountStatus: 'Estado de la Cuenta',
    manageSubscriptions: 'Administrar Suscripciones',
    activeSubscriptions: 'Suscripciones Activas',
    currentExamAccess: 'Su acceso actual a exámenes y períodos de validez',
    noActiveSubscriptions: 'Sin Suscripciones Activas',
    noActiveSubscriptionsDesc: 'Aún no tiene ninguna suscripción de examen activa',
    browsePlans: 'Explorar Planes',
    validUntil: 'Válido hasta',
    daysRemaining: 'días restantes',
    expiringSoon: 'Expira Pronto',
    monthlySubscription: 'Suscripción mensual',
    startExam: 'Iniciar Examen',
    startStudy: 'Iniciar Estudio',
    wantMoreExams: '¿Quiere agregar más exámenes?',
    additionalCategories: 'Obtenga acceso a categorías de examen adicionales',
    addMore: 'Agregar Más',
    yourProgress: 'Su Progreso',
    trackPerformance: 'Rastree su rendimiento de capacitación',
    activeExams: 'Exámenes Activos',
    examsCompleted: 'Exámenes Completados',
    averageScore: 'Puntuación Promedio',
    manageAccount: 'Administre sus suscripciones y configuración de cuenta',

    // Exam Mode Selection
    selectExamMode: 'Seleccionar Modo de Examen',
    selectModeTitle: 'Elija su enfoque de aprendizaje',
    studyMode: 'Modo de Estudio',
    studyModeDesc: 'Vea las respuestas correctas inmediatamente después de cada pregunta',
    examMode: 'Modo de Examen',
    examModeDesc: 'Simule condiciones de examen reales con resultados al final',
    mockExam: 'Examen de Práctica',
    mockExamDesc: 'Práctica gratuita con preguntas limitadas',
    paidExam: 'Examen de Pago',
    paidExamDesc: 'Experiencia de examen completa con todas las preguntas',
    questionsAvailable: 'preguntas disponibles',
    unlockAll: 'Desbloquear las 40 preguntas',
    startExam: 'Iniciar Examen',
    upgradeRequired: 'Actualización Requerida',
    instantFeedback: 'Retroalimentación instantánea sobre las respuestas',
    learnAsPractice: 'Aprenda mientras practica',
    perfectForBeginners: 'Perfecto para principiantes',
    realisticExamSim: 'Simulación de examen realista',
    sixtyMinTimer: 'Temporizador de 60 minutos',
    resultsAtCompletion: 'Resultados al completar',
    selectExamType: 'Seleccionar Tipo de Examen',
    freePractice: 'Práctica Gratuita',
    freePracticeDesc: 'Pruebe 10 preguntas gratis para comenzar',
    tenQuestions: '10 preguntas de práctica',
    bothStudyExamModes: 'Ambos modos de estudio y examen',
    startFree: 'Comenzar Gratis',
    fullAccessTitle: 'Acceso Completo',
    fullAccessDescription: 'Capacitación completa con las 40 preguntas',
    fortyQuestions: 'Las 40 preguntas del examen',
    trackProgress: 'Rastree su progreso',
    startFull: 'Iniciar Completo',
    fullAccessNote: 'Nota: El acceso completo requiere €5/mes por categoría. Pruebe nuestra práctica gratuita para experimentar la plataforma antes de actualizar.',

    // Exam Page
    timeRemaining: 'Tiempo Restante',
    question: 'Pregunta',
    of: 'de',
    points: 'puntos',
    point: 'punto',
    questionNavigator: 'Navegador de Preguntas',
    answered: 'Respondidas',
    answeredCorrectly: 'Respondidas Correctamente',
    answeredIncorrectly: 'Respondidas Incorrectamente',
    unanswered: 'Sin Responder',
    current: 'Actual',
    submitAndNext: 'Enviar y Siguiente',
    next: 'Siguiente',
    previous: 'Anterior',
    finish: 'Finalizar',
    continue: 'Continuar',
    finishExam: 'Finalizar Examen',
    submitExam: 'Enviar Examen',
    examResults: 'Resultados del Examen',
    yourScore: 'Su Puntuación',
    passed: 'Aprobado',
    notPassed: 'No Aprobado',
    failed: 'Reprobado',
    correctAnswers: 'Respuestas Correctas',
    select: 'Seleccionar',
    selectMultipleAnswers: 'Seleccione {count} respuestas',
    timeUsed: 'Tiempo Utilizado',
    passingScore: 'Puntuación de Aprobación',
    reviewAnswers: 'Revisar Respuestas',
    retakeExam: 'Repetir Examen',
    backToExams: 'Volver a Exámenes',
    exitExam: 'Salir del Examen',
    exitExamTitle: '¿Salir del Examen?',
    exitExamMessage: 'Perderá todo su progreso si sale del examen. Esta acción no se puede deshacer.',
    continueExam: 'Continuar Examen',
    exitAndLoseProgress: 'Salir y Perder Progreso',
    submitExamTitle: '¿Enviar Examen?',
    submitExamMessage: '¿Está seguro de que desea enviar su examen? No podrá cambiar sus respuestas después del envío.',
    cancelSubmit: 'Cancelar',
    confirmSubmit: 'Enviar',
    complete: 'Completo',
    pointsLost: 'Puntos Perdidos',
    maximum: 'Máximo',
    correct: '¡Correcto!',
    incorrect: 'Incorrecto.',
    noPointsLost: 'Sin puntos perdidos',
    pointsLostMessage: 'puntos perdidos. La respuesta correcta está resaltada arriba.',
    correctAnswerHighlighted: 'La respuesta correcta está resaltada arriba.',
    wantToUpgrade: '¿Quiere practicar con las 40 preguntas?',
    upgradeMessage: 'Actualice al examen completo por solo €5/mes por categoría.',
    upgradeNowLink: 'Actualizar Ahora →',

    // Payment Page
    selectCategories: 'Seleccionar Categorías de Examen',
    selectCategoriesDesc: 'Elija qué categorías de examen desea desbloquear',
    monthlyPerCategory: 'mensual por categoría',
    totalMonthly: 'Total Mensual',
    noCategoriesSelected: 'No se seleccionaron categorías',
    proceedToPayment: 'Proceder al Pago',
    paymentDetails: 'Detalles de Pago',
    cardNumber: 'Número de Tarjeta',
    expiryDate: 'Fecha de Vencimiento',
    cvv: 'CVV',
    completePayment: 'Completar Pago',
    securePayment: 'Pago seguro con cifrado estándar de la industria',

    // Partners Page
    partnersTitle: 'Personas con las que Colaboramos',
    partnersSubtitle: 'Los socios nos ayudan a preparar materiales de examen',
    ourPartners: 'Nuestros Socios',
    visitWebsite: 'Visitar Sitio Web',
    viewClasses: 'Ver Clases',
    partnerBannerText1: '⚓ Maritime Academy Bulgaria - Cursos profesionales de vela y certificaciones de yates',
    partnerBannerText2: '🌊 Black Sea Yacht Charters - Alquiler de yates premium con o sin tripulación',
    partnerBannerText3: '⛵ Neptune Marine Equipment - Todo su equipo de seguridad y navegación marítima',
  },
  Greek: {
    // Navigation
    home: 'Αρχική',
    pricing: 'Τιμές',
    contact: 'Επικοινωνία',
    account: 'Λογαριασμός',
    login: 'Σύνδεση',
    backToHome: 'Επιστροφή στην Αρχική',
    partners: 'Συνεργάτες',

    // Home Page
    heroTitle: 'Κατακτήστε την Ναυτική σας Πιστοποίηση',
    heroSubtitle: 'Επαγγελματική Εκπαίδευση για Εξετάσεις Γιοτ και Σκαφών',
    heroDescription: 'Ολοκληρωμένη διαδικτυακή πλατφόρμα εκπαίδευσης για εξετάσεις ναυτικής πιστοποίησης. Εξασκηθείτε με πραγματικές ερωτήσεις εξετάσεων και περάστε με αυτοπεποίθηση.',
    getStarted: 'Ξεκινήστε',
    learnMore: 'Μάθετε Περισσότερα',
    examCategories: 'Κατηγορίες Εξετάσεων',
    examCategoriesSubtitle: 'Επιλέξτε το μονοπάτι σας',
    jetSki: 'Τζετ Σκι',
    jetSkiDesc: 'Κατακτήστε τη λειτουργία προσωπικών θαλάσσιων οχημάτων',
    smallBoat: 'Μικρό Σκάφος',
    smallBoatDesc: 'Βασικές δεξιότητες για πλοήγηση μικρών σκαφών',
    bigBoat: 'Μεγάλο Σκάφος',
    bigBoatDesc: 'Προηγμένες τεχνικές για μεγαλύτερα σκάφη',
    yacht: 'Γιοτ (έως 50 τόνους)',
    yachtDesc: 'Επαγγελματική πιστοποίηση γιοτ',
    navigationDevice: 'Συσκευή Πλοήγησης',
    navigationDeviceDesc: 'Κατακτήστε την τεχνολογία ναυτικής πλοήγησης',
    selectExam: 'Επιλογή Εξέτασης',
    howItWorks: 'Πώς Λειτουργεί',
    howItWorksSubtitle: 'Το μονοπάτι σας προς την επιτυχία της πιστοποίησης',
    chooseCategory: 'Επιλέξτε Κατηγορία',
    chooseCategoryDesc: 'Επιλέξτε από 5 κατηγορίες εξετάσεων',
    selectMode: 'Επιλέξτε Λειτουργία',
    selectModeDesc: 'Λειτουργία μελέτης ή εξέτασης',
    takeExam: 'Δώστε Εξέταση',
    takeExamDesc: '40 ερωτήσεις, 60 λεπτά',
    getResults: 'Λάβετε Αποτελέσματα',
    getResultsDesc: 'Άμεση ανατροφοδότηση και ανάλυση',
    disclaimer: 'Αποποίηση Εκπαίδευσης',
    disclaimerText: 'Αυτές οι εξετάσεις είναι μόνο για εκπαιδευτικούς σκοπούς και δεν παρέχουν πιστοποίηση. Έχουν σχεδιαστεί για να σας βοηθήσουν να προετοιμαστείτε για ναυτικές εξετάσεις.',

    // Pricing Page
    pricingTitle: 'Απλές, Διαφανείς Τιμές',
    pricingSubtitle: 'Επιλέξτε το πλάνο που σας ταιριάζει',
    free: 'Δωρεάν',
    practiceMode: 'Λειτουργία Εξάσκησης',
    practiceModeDesc: 'Ιδανικό για να ξεκινήσετε',
    perMonth: '/μήνα',
    questionsPerExam: '10 ερωτήσεις εξάσκησης ανά εξέταση',
    allCategories: 'Και οι 5 κατηγορίες εξετάσεων',
    studyExamModes: 'Λειτουργίες μελέτης και εξέτασης',
    noCardRequired: 'Δεν απαιτείται πιστωτική κάρτα',
    getStartedFree: 'Ξεκινήστε Δωρεάν',
    mostPopular: 'Πιο Δημοφιλής',
    fullAccess: 'Πλήρης Πρόσβαση',
    fullAccessDesc: 'Πλήρης εμπειρία εκπαίδευσης',
    perMonthPerCategory: '/μήνα ανά κατηγορία',
    allQuestions: 'Όλες οι 40 ερωτήσεις εξέτασης',
    unlimitedAttempts: 'Απεριόριστες προσπάθειες εξάσκησης',
    bothModes: 'Και οι δύο λειτουργίες μελέτης και εξέτασης',
    progressTracking: 'Λεπτομερής παρακολούθηση προόδου',
    timedExams: 'Εξετάσεις 60 λεπτών με χρονόμετρο',
    cancelAnytime: 'Ακύρωση ανά πάσα στιγμή',
    getFullAccess: 'Αποκτήστε Πλήρη Πρόσβαση',

    // Contact Page
    contactTitle: 'Επικοινωνήστε Μαζί Μας',
    contactSubtitle: 'Έχετε ερωτήσεις; Θα χαρούμε να ακούσουμε από εσάς. Έχετε επιχειρηματικές ευκαιρίες για εμάς σχετικά με τη διδασκαλία μαθημάτων ή θα θέλατε να διαφημιστείτε στη σελίδα μας; Θα χαρούμε να ακούσουμε από εσάς ακόμη περισσότερο!',
    getInTouch: 'Επικοινωνήστε',
    fullName: 'Ονοματεπώνυμο',
    email: 'Email',
    message: 'Μήνυμα',
    sendMessage: 'Αποστολή Μηνύματος',
    contactInfo: 'Στοιχεία Επικοινωνίας',
    emailUs: 'Στείλτε μας email στο',
    location: 'Τοποθεσία',
    phone: 'Τηλέφωνο',

    // Login Page
    welcomeAboard: 'Καλώς Ήρθατε στο Σκάφος',
    signInToContinue: 'Συνδεθείτε για να συνεχίσετε την ναυτική σας εκπαίδευση',
    accountAccess: 'Πρόσβαση Λογαριασμού',
    enterCredentials: 'Εισάγετε τα διαπιστευτήριά σας για να ξεκινήσετε',
    signIn: 'Σύνδεση',
    signUp: 'Εγγραφή',
    password: 'Κωδικός',
    createAccount: 'Δημιουργία Λογαριασμού',
    demoMode: '✨ Λειτουργία Demo: Εισάγετε οποιοδήποτε email για να συνεχίσετε',
    welcomeBack: 'Καλώς ήρθατε πίσω!',
    accountCreated: 'Ο λογαριασμός δημιουργήθηκε με επιτυχία!',

    // Account Page
    myAccount: 'Ο Λογαριασμός Μου',
    accountInfo: 'Πληροφορίες Λογαριασμού',
    memberSince: 'Μέλος από',
    subscriptions: 'Συνδρομές',
    yourSubscriptions: 'Οι Συνδρομές σας',
    active: 'Ενεργό',
    viewExams: 'Προβολή Εξετάσεων',
    noSubscriptions: 'Δεν υπάρχουν ενεργές συνδρομές',
    upgradeNow: 'Αναβάθμιση Τώρα',
    logout: 'Αποσύνδεση',
    accountDetails: 'Στοιχεία Λογαριασμού',
    accountStatus: 'Κατάσταση Λογαριασμού',
    manageSubscriptions: 'Διαχείριση Συνδρομών',
    activeSubscriptions: 'Ενεργές Συνδρομές',
    currentExamAccess: 'Η τρέχουσα πρόσβαση στις εξετάσεις σας και οι περίοδοι ισχύος',
    noActiveSubscriptions: 'Δεν Υπάρχουν Ενεργές Συνδρομές',
    noActiveSubscriptionsDesc: 'Δεν έχετε ακόμη ενεργές συνδρομές εξετάσεων',
    browsePlans: 'Περιήγηση Πλάνων',
    validUntil: 'Ισχύει μέχρι',
    daysRemaining: 'ημέρες που απομένουν',
    expiringSoon: 'Λήγει Σύντομα',
    monthlySubscription: 'Μηνιαία συνδρομή',
    startExam: 'Έναρξη Εξέτασης',
    startStudy: 'Έναρξη Μελέτης',
    wantMoreExams: 'Θέλετε να προσθέσετε περισσότερες εξετάσεις;',
    additionalCategories: 'Αποκτήστε πρόσβαση σε επιπλέον κατηγορίες εξετάσεων',
    addMore: 'Προσθήκη Περισσότερων',
    yourProgress: 'Η Πρόοδός σας',
    trackPerformance: 'Παρακολουθήστε την απόδοση της εκπαίδευσής σας',
    activeExams: 'Ενεργές Εξετάσεις',
    examsCompleted: 'Εξετάσεις που Ολοκληρώθηκαν',
    averageScore: 'Μέση Βαθμολογία',
    manageAccount: 'Διαχειριστείτε τις συνδρομές και τις ρυθμίσεις του λογαριασμού σας',

    // Exam Mode Selection
    selectExamMode: 'Επιλογή Λειτουργίας Εξέτασης',
    selectModeTitle: 'Επιλέξτε την προσέγγιση μάθησής σας',
    studyMode: 'Λειτουργία Μελέτης',
    studyModeDesc: 'Δείτε τις σωστές απαντήσεις αμέσως μετά από κάθε ερώτηση',
    examMode: 'Λειτουργία Εξέτασης',
    examModeDesc: 'Προσομοιώστε πραγματικές συνθήκες εξέτασης με αποτελέσματα στο τέλος',
    mockExam: 'Δοκιμαστική Εξέταση',
    mockExamDesc: 'Δωρεάν εξάσκηση με περιορισμένες ερωτήσεις',
    paidExam: 'Επί Πληρωμή Εξέταση',
    paidExamDesc: 'Πλήρης εμπειρία εξέτασης με όλες τις ερωτήσεις',
    questionsAvailable: 'διαθέσιμες ερωτήσεις',
    unlockAll: 'Ξεκλειδώστε και τις 40 ερωτήσεις',
    startExam: 'Έναρξη Εξέτασης',
    upgradeRequired: 'Απαιτείται Αναβάθμιση',
    instantFeedback: 'Άμεση ανατροφοδότηση στις απαντήσεις',
    learnAsPractice: 'Μάθετε ενώ εξασκείστε',
    perfectForBeginners: 'Ιδανικό για αρχάριους',
    realisticExamSim: 'Ρεαλιστική προσομοίωση εξέτασης',
    sixtyMinTimer: 'Χρονόμετρο 60 λεπτών',
    resultsAtCompletion: 'Αποτελέσματα κατά την ολοκλήρωση',
    selectExamType: 'Επιλογή Τύπου Εξέτασης',
    freePractice: 'Δωρεάν Εξάσκηση',
    freePracticeDesc: 'Δοκιμάστε 10 ερωτήσεις δωρεάν για να ξεκινήσετε',
    tenQuestions: '10 ερωτήσεις εξάσκησης',
    bothStudyExamModes: 'Και οι δύο λειτουργίες μελέτης και εξέτασης',
    startFree: 'Έναρξη Δωρεάν',
    fullAccessTitle: 'Πλήρης Πρόσβαση',
    fullAccessDescription: 'Πλήρης εκπαίδευση με όλες τις 40 ερωτήσεις',
    fortyQuestions: 'Όλες οι 40 ερωτήσεις εξέτασης',
    trackProgress: 'Παρακολουθήστε την πρόοδό σας',
    startFull: 'Έναρξη Πλήρους',
    fullAccessNote: 'Σημείωση: Η πλήρης πρόσβαση απαιτεί €5/μήνα ανά κατηγορία. Δοκιμάστε τη δωρεάν εξάσκησή μας για να δοκιμάσετε την πλατφόρμα πριν την αναβάθμιση.',

    // Exam Page
    timeRemaining: 'Υπολειπόμενος Χρόνος',
    question: 'Ερώτηση',
    of: 'από',
    points: 'πόντοι',
    point: 'πόντος',
    questionNavigator: 'Πλοηγός Ερωτήσεων',
    answered: 'Απαντημένες',
    answeredCorrectly: 'Απαντημένες Σωστά',
    answeredIncorrectly: 'Απαντημένες Λάθος',
    unanswered: 'Χωρίς Απάντηση',
    current: 'Τρέχουσα',
    submitAndNext: 'Υποβολή και Επόμενη',
    next: 'Επόμενη',
    previous: 'Προηγούμενη',
    finish: 'Τέλος',
    continue: 'Συνέχεια',
    finishExam: 'Ολοκλήρωση Εξέτασης',
    submitExam: 'Υποβολή Εξέτασης',
    examResults: 'Αποτελέσματα Εξέτασης',
    yourScore: 'Η Βαθμολογία σας',
    passed: 'Πέρασε',
    notPassed: 'Δεν Πέρασε',
    failed: 'Απέτυχε',
    correctAnswers: 'Σωστές Απαντήσεις',
    select: 'Επιλέξτε',
    selectMultipleAnswers: 'Επιλέξτε {count} απαντήσεις',
    timeUsed: 'Χρόνος που Χρησιμοποιήθηκε',
    passingScore: 'Βαθμός Επιτυχίας',
    reviewAnswers: 'Ανασκόπηση Απαντήσεων',
    retakeExam: 'Επανάληψη Εξέτασης',
    backToExams: 'Επιστροφή στις Εξετάσεις',
    exitExam: 'Έξοδος από την Εξέταση',
    exitExamTitle: 'Έξοδος από την Εξέταση;',
    exitExamMessage: 'Θα χάσετε όλη την πρόοδό σας αν βγείτε από την εξέταση. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.',
    continueExam: 'Συνέχεια Εξέτασης',
    exitAndLoseProgress: 'Έξοδος και Απώλεια Προόδου',
    submitExamTitle: 'Υποβολή Εξέτασης;',
    submitExamMessage: 'Είστε βέβαιοι ότι θέλετε να υποβάλετε την εξέτασή σας; Δεν θα μπορείτε να αλλάξετε τις απαντήσεις σας μετά την υποβολή.',
    cancelSubmit: 'Ακύρωση',
    confirmSubmit: 'Υποβολή',
    complete: 'Ολοκληρώθηκε',
    pointsLost: 'Πόντοι που Χάθηκαν',
    maximum: 'Μέγιστο',
    correct: 'Σωστό!',
    incorrect: 'Λάθος.',
    noPointsLost: 'Δεν χάθηκαν πόντοι',
    pointsLostMessage: 'πόντοι χάθηκαν. Η σωστή απάντηση επισημαίνεται παραπάνω.',
    correctAnswerHighlighted: 'Η σωστή απάντηση επισημαίνεται παραπάνω.',
    wantToUpgrade: 'Θέλετε να εξασκηθείτε με όλες τις 40 ερωτήσεις;',
    upgradeMessage: 'Αναβαθμίστε στην πλήρη εξέταση για μόνο €5/μήνα ανά κατηγορία.',
    upgradeNowLink: 'Αναβάθμιση Τώρα →',

    // Payment Page
    selectCategories: 'Επιλογή Κατηγοριών Εξέτασης',
    selectCategoriesDesc: 'Επιλέξτε ποιες κατηγορίες εξετάσεων θέλετε να ξεκλειδώσετε',
    monthlyPerCategory: 'μηνιαία ανά κατηγορία',
    totalMonthly: 'Σύνολο Μηνιαίως',
    noCategoriesSelected: 'Δεν επιλέχθηκαν κατηγορίες',
    proceedToPayment: 'Συνέχεια στην Πληρωμή',
    paymentDetails: 'Στοιχεία Πληρωμής',
    cardNumber: 'Αριθμός Κάρτας',
    expiryDate: 'Ημερομηνία Λήξης',
    cvv: 'CVV',
    completePayment: 'Ολοκλήρωση Πληρωμής',
    securePayment: 'Ασφαλής πληρωμή με τυπική κρυπτογράφηση βιομηχανίας',

    // Partners Page
    partnersTitle: 'Άνθρωποι με τους Οποίους Συνεργαζόμαστε',
    partnersSubtitle: 'Οι συνεργάτες μας βοηθούν να προετοιμάσουμε εξεταστικό υλικό',
    ourPartners: 'Οι Συνεργάτες Μας',
    visitWebsite: 'Επίσκεψη Ιστοσελίδας',
    viewClasses: 'Προβολή Μαθημάτων',
    partnerBannerText1: '⚓ Maritime Academy Bulgaria - Επαγγελματικά μαθήματα ιστιοπλοΐας και πιστοποιήσεις γιοτ',
    partnerBannerText2: '🌊 Black Sea Yacht Charters - Premium ενοικίαση γιοτ με και χωρίς πλήρωμα',
    partnerBannerText3: '⛵ Neptune Marine Equipment - Όλος ο εξοπλισμός ναυτικής ασφάλειας και πλοήγησης',
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language];
}
