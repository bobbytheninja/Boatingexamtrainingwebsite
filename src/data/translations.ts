export type Language = 'English' | 'Bulgarian';

export interface Translations {
  // Navigation
  home: string;
  pricing: string;
  contact: string;
  account: string;
  login: string;
  backToHome: string;

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
  },
  Bulgarian: {
    // Navigation
    home: 'Начало',
    pricing: 'Цени',
    contact: 'Контакт',
    account: 'Акаунт',
    login: 'Вход',
    backToHome: 'Назад към Начало',

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
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language];
}
