export type Language = 'en' | 'hi' | 'mr' | 'te';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
    te: string;
  };
}

export const translations: Translations = {
  // App Branding & Navigation
  appName: {
    en: 'PocketPilot',
    hi: 'पॉकेटपायलट',
    mr: 'पॉकेटपायलट',
    te: 'పాకెట్‌పైలట్',
  },
  appTagline: {
    en: 'Free-First Personal Finance Platform',
    hi: 'निःशुल्क व्यक्तिगत वित्त मंच',
    mr: 'मोफत वैयक्तिक वित्त मंच',
    te: 'ఉచిత వ్యక్తిగత ఆర్థిక వేదిక',
  },
  sharedDbConnected: {
    en: 'Shared MySQL 8 DB Connected',
    hi: 'साझा MySQL 8 डेटाबेस कनेक्टेड',
    mr: 'सामायिक MySQL 8 डेटाबेस कनेक्टेड',
    te: 'భాగస్వామ్య MySQL 8 డేటాబేస్ కనెక్ట్ అయింది',
  },
  freeFirst: {
    en: 'Free-First',
    hi: 'पूर्णतः निःशुल्क',
    mr: 'पूर्णपणे मोफत',
    te: 'పూర్తిగా ఉచితం',
  },

  // Navigation Items
  navCoreFinance: {
    en: 'CORE FINANCE',
    hi: 'मुख्य वित्त',
    mr: 'मुख्य वित्त',
    te: 'ప్రధాన ఆర్థికం',
  },
  navDashboard: {
    en: 'Financial Dashboard',
    hi: 'वित्तीय डैशबोर्ड',
    mr: 'आर्थिक डॅशबोर्ड',
    te: 'ఆర్థిక డ్యాష్‌బోర్డ్',
  },
  navAccounts: {
    en: 'Accounts & Balances',
    hi: 'खाते और शेष राशि',
    mr: 'खाती आणि शिल्लक',
    te: 'ఖాతాలు మరియు నిల్వలు',
  },
  navLinked: {
    en: 'Link Bank, UPI & Investments',
    hi: 'बैंक, UPI और निवेश लिंक करें',
    mr: 'बँक, UPI आणि गुंतवणूक लिंक करा',
    te: 'బ్యాంక్, UPI & పెట్టుబడులను లింక్ చేయండి',
  },
  navIncome: {
    en: 'Income Streams',
    hi: 'आय के स्रोत',
    mr: 'उत्पन्नाचे स्रोत',
    te: 'ఆదాయ మార్గాలు',
  },
  navExpenses: {
    en: 'Expenses & Needs/Wants',
    hi: 'व्यय और आवश्यकताएं/इच्छाएं',
    mr: 'खर्च आणि गरजा/इच्छा',
    te: 'ఖర్చులు & అవసరాలు/కోరికలు',
  },
  navTransactions: {
    en: 'Transaction History',
    hi: 'लेन-देन इतिहास',
    mr: 'व्यवहार इतिहास',
    te: 'లావాదేవీల చరిత్ర',
  },
  navCategories: {
    en: 'Categories & Limits',
    hi: 'श्रेणियां और सीमाएं',
    mr: 'वर्ग आणि मर्यादा',
    te: 'వర్గాలు మరియు పరిమితులు',
  },
  navBudgetsGoals: {
    en: 'BUDGETS & GOALS',
    hi: 'बजट और लक्ष्य',
    mr: 'अंदाजपत्रक आणि उद्दिष्टे',
    te: 'బడ్జెట్లు & లక్ష్యాలు',
  },
  navMonthlyBudget: {
    en: 'Monthly Budget',
    hi: 'मासिक बजट',
    mr: 'मासिक अंदाजपत्रक',
    te: 'నెలవారీ బడ్జెట్',
  },
  navSavingsGoals: {
    en: 'Savings Goals',
    hi: 'बचत लक्ष्य',
    mr: 'बचत उद्दिष्टे',
    te: 'పొదుపు లక్ష్యాలు',
  },
  navBillsSubscriptions: {
    en: 'Bills & Subscriptions',
    hi: 'बिल और सदस्यताएं',
    mr: 'बिले आणि सदस्यता',
    te: 'బిల్లులు & సభ్యత్వాలు',
  },
  navWealthAssets: {
    en: 'WEALTH & ASSETS',
    hi: 'धन और संपत्ति',
    mr: 'संपत्ती आणि मालमत्ता',
    te: 'సంపద & ఆస్తులు',
  },
  navInvestments: {
    en: 'Investments & SIPs',
    hi: 'निवेश और SIP',
    mr: 'गुंतवणूक आणि SIP',
    te: 'పెట్టుబడులు & SIPలు',
  },
  navAssetsLiabilities: {
    en: 'Assets & Liabilities',
    hi: 'परिसंपत्तियां और देनदारियां',
    mr: 'मालमत्ता आणि दायित्वे',
    te: 'ఆస్తులు & అప్పులు',
  },
  navNetWorth: {
    en: 'Net Worth Tracker',
    hi: 'कुल संपत्ति ट्रैकर',
    mr: 'एकूण निव्वळ मूल्य',
    te: 'నికర విలువ ట్రాకర్',
  },
  navReportsAnalytics: {
    en: 'Reports & Analytics',
    hi: 'रिपोर्ट्स और विश्लेषण',
    mr: 'अहवाल आणि विश्लेषण',
    te: 'నివేదికలు & విశ్లేషణ',
  },
  navDesktopSync: {
    en: 'JavaFX Desktop App',
    hi: 'JavaFX डेस्कटॉप ऐप',
    mr: 'JavaFX डेस्कटॉप अॅप',
    te: 'JavaFX డెస్క్‌టాప్ యాప్',
  },
  navSettings: {
    en: 'Settings',
    hi: 'सेटिंग्स',
    mr: 'सेटिंग्ज',
    te: 'సెట్టింగ్‌లు',
  },
  signOut: {
    en: 'Sign Out',
    hi: 'साइन आउट',
    mr: 'साइन आउट',
    te: 'లాగ్ అవుట్',
  },

  // Languages names
  langEnglish: { en: 'English', hi: 'अंग्रेज़ी (English)', mr: 'इंग्रजी (English)', te: 'ఇంగ్లీష్ (English)' },
  langHindi: { en: 'Hindi (हिन्दी)', hi: 'हिन्दी', mr: 'हिंदी (हिन्दी)', te: 'హిందీ (हिन्दी)' },
  langMarathi: { en: 'Marathi (मराठी)', hi: 'मराठी', mr: 'मराठी', te: 'మరాఠీ (मराठी)' },
  langTelugu: { en: 'Telugu (తెలుగు)', hi: 'तेलुगु (తెలుగు)', mr: 'तेलुगू (తెలుగు)', te: 'తెలుగు' },

  // Themes
  themeLight: { en: 'Light Mode', hi: 'लाइट मोड', mr: 'लाइट मोड', te: 'లైట్ మోడ్' },
  themeDark: { en: 'Dark Mode', hi: 'डार्क मोड', mr: 'डार्क मोड', te: 'డార్క్ మోడ్' },
  toggleTheme: { en: 'Toggle Theme', hi: 'थीम बदलें', mr: 'थीम बदला', te: 'థీమ్ మార్చండి' },

  // Dashboard Page
  welcomeBack: {
    en: 'Welcome back, {name}!',
    hi: 'वापसी पर स्वागत है, {name}!',
    mr: 'पुन्हा स्वागत आहे, {name}!',
    te: 'తిరిగి స్వాగతం, {name}!',
  },
  dashboardSubtitle: {
    en: 'PocketPilot keeps your personal accounts, transactions, investments and budgets synchronized across both web and desktop clients.',
    hi: 'पॉकेटपायलट आपके व्यक्तिगत खातों, लेन-देन, निवेश और बजट को वेब और डेस्कटॉप दोनों पर सिंक रखता है।',
    mr: 'पॉकेटपायलट तुमची वैयक्तिक खाती, व्यवहार, गुंतवणूक आणि अंदाजपत्रक वेब आणि डेस्कटॉप दोन्हीवर सिंक ठेवते.',
    te: 'పాకెట్‌పైలట్ మీ వ్యక్తిగత ఖాతాలు, లావాదేవీలు, పెట్టుబడులు మరియు బడ్జెట్‌లను వెబ్ మరియు డెస్క్‌టాప్ రెండింటిలోనూ సమకాలీకరిస్తుంది.',
  },
  overviewTitle: { en: 'Personal Finance Overview', hi: 'व्यक्तिगत वित्त अवलोकन', mr: 'वैयक्तिक वित्त आढावा', te: 'వ్యక్తిగత ఆర్థిక సమాలోచన' },
  monthLabel: { en: 'Month', hi: 'माह', mr: 'महिना', te: 'నెల' },
  currentMonth: { en: 'Current', hi: 'वर्तमान', mr: 'वर्तमान', te: 'ప్రస్తుతం' },
  netWorth: { en: 'Net Worth', hi: 'कुल संपत्ति (Net Worth)', mr: 'एकूण निव्वळ संपत्ती', te: 'మొత్తం నికర విలువ' },
  totalAssets: { en: 'Total Assets', hi: 'कुल संपत्ति', mr: 'एकूण मालमत्ता', te: 'మొత్తం ఆస్తులు' },
  totalDebts: { en: 'Total Debts / Liabilities', hi: 'कुल ऋण / देनदारियां', mr: 'एकूण कर्ज / दायित्वे', te: 'మొత్తం అప్పులు / బాధ్యతలు' },
  monthlyIncome: { en: 'Monthly Income', hi: 'मासिक आय', mr: 'मासिक उत्पन्न', te: 'నెలవారీ ఆదాయం' },
  monthlyExpenses: { en: 'Monthly Expenses', hi: 'मासिक व्यय', mr: 'मासिक खर्च', te: 'నెలవారీ ఖర్చులు' },
  netSavings: { en: 'Net Monthly Savings', hi: 'शुद्ध मासिक बचत', mr: 'निव्वळ मासिक बचत', te: 'నికర నెలవారీ పొదుపు' },
  savingsRate: { en: 'Savings Rate', hi: 'बचत दर', mr: 'बचत दर', te: 'పొదుపు రేటు' },
  recentTransactions: { en: 'Recent Transactions', hi: 'हाल के लेन-देन', mr: 'नुकतेच झालेले व्यवहार', te: 'ఇటీవలి లావాదేవీలు' },
  yourAccounts: { en: 'Your Financial Accounts', hi: 'आपके वित्तीय खाते', mr: 'तुमची आर्थिक खाती', te: 'మీ ఆర్థిక ఖాతాలు' },
  budgetSnapshot: { en: 'Budget Snapshot (50/30/20)', hi: 'बजट सारांश (50/30/20)', mr: 'अंदाजपत्रक सारांश (50/30/20)', te: 'బడ్జెట్ సారాంశం (50/30/20)' },
  addTransaction: { en: 'Add Transaction', hi: 'लेन-देन जोड़ें', mr: 'व्यवहार जोडा', te: 'లావాదేవీని జోడించండి' },
  syncDesktop: { en: 'Sync Desktop Client', hi: 'डेस्कटॉप क्लाइंट सिंक करें', mr: 'डेस्कटॉप क्लायंट सिंक करा', te: 'డెస్క్‌టాప్ క్లయింట్‌ను సింక్ చేయండి' },
  manageAccounts: { en: 'Manage Accounts', hi: 'खातों का प्रबंधन', mr: 'खाती व्यवस्थापित करा', te: 'ఖాతాలను నిర్వహించండి' },
  viewAll: { en: 'View All', hi: 'सभी देखें', mr: 'सर्व पहा', te: 'అన్నీ చూడండి' },
  noTransactionsYet: { en: 'No transactions recorded yet.', hi: 'अभी तक कोई लेन-देन दर्ज नहीं किया गया है।', mr: 'अद्याप कोणतेही व्यवहार नोंदवलेले नाहीत.', te: 'ఇంకా ఎలాంటి లావాదేవీలు నమోదు కాలేదు.' },
  noAccountsYet: { en: 'No accounts created yet.', hi: 'अभी तक कोई खाता नहीं बनाया गया है।', mr: 'अद्याप कोणतीही खाती तयार केलेली नाहीत.', te: 'ఇంకా ఖాతాలు సృష్టించబడలేదు.' },
  createAccountPrompt: { en: 'Create your first account to begin tracking.', hi: 'ट्रैकिंग शुरू करने के लिए अपना पहला खाता बनाएं।', mr: 'ट्रॅकिंग सुरू करण्यासाठी आपले पहिले खाते तयार करा.', te: 'ట్రాకింగ్ ప్రారంభించడానికి మీ మొదటి ఖాతాను సృష్టించండి.' },

  // Linked Bank, UPI & Investments
  linkedTitle: {
    en: 'Link Bank Account, UPI & Investments',
    hi: 'बैंक खाता, UPI और निवेश लिंक करें',
    mr: 'बँक खाते, UPI आणि गुंतवणूक लिंक करा',
    te: 'బ్యాంక్ ఖాతా, UPI & పెట్టుబడులను లింక్ చేయండి',
  },
  linkedSubtitle: {
    en: 'Connect your bank accounts, UPI VPAs, and mutual fund SIPs with automatic growth and live balance synchronization.',
    hi: 'स्वचालित वृद्धि और लाइव बैलेंस सिंक्रोनाइज़ेशन के साथ अपने बैंक खाते, UPI आईडी और म्यूचुअल फंड SIP कनेक्ट करें।',
    mr: 'स्वयंचलित वाढ आणि थेट शिल्लक समक्रमण सह तुमची बँक खाती, UPI पत्ते आणि म्युच्युअल फंड SIP कनेक्ट करा.',
    te: 'ఆటోమేటిక్ పెరుగుదల మరియు ప్రత్యక్ష బ్యాలెన్స్ సమకాలీకరణతో మీ బ్యాంక్ ఖాతాలు, UPI IDలు మరియు మ్యూచువల్ ఫండ్ SIPలను కనెక్ట్ చేయండి.',
  },
  linkBankAccountBtn: {
    en: '+ Link Bank Account',
    hi: '+ बैंक खाता लिंक करें',
    mr: '+ बँक खाते जोडा',
    te: '+ బ్యాంక్ ఖాతాను లింక్ చేయండి',
  },
  linkUpiBtn: {
    en: '+ Link UPI ID',
    hi: '+ UPI आईडी लिंक करें',
    mr: '+ UPI आयडी जोडा',
    te: '+ UPI IDని లింక్ చేయండి',
  },
  linkInvestmentBtn: {
    en: '+ Link Investment Portfolio',
    hi: '+ निवेश पोर्टफोलियो लिंक करें',
    mr: '+ गुंतवणूक पोर्टफोलिओ जोडा',
    te: '+ పెట్టుబడి పోర్ట్‌ఫోలియోను లింక్ చేయండి',
  },
  simulateUpiPaymentBtn: {
    en: 'Simulate Live UPI Payment',
    hi: 'लाइव UPI भुगतान सिमुलेट करें',
    mr: 'थेट UPI पेमेंटचे अनुकरण करा',
    te: 'ప్రత్యక్ష UPI చెల్లింపును పరీక్షించండి',
  },
  triggerAutoGrowthBtn: {
    en: 'Run Auto-Growth & Interest Accrual',
    hi: 'ऑटो-ग्रोथ और ब्याज संचय चलाएं',
    mr: 'ऑटो-ग्रोथ आणि व्याज संचयन चालवा',
    te: 'ఆటో-పెరుగుదల & వడ్డీని నడపండి',
  },
  autoGrowthSuccess: {
    en: 'Auto-growth executed! Bank interest and investment returns calculated and credited.',
    hi: 'ऑटो-ग्रोथ निष्पादित! बैंक ब्याज और निवेश रिटर्न की गणना और क्रेडिट की गई।',
    mr: 'ऑटो-ग्रोथ यशस्वी! बँक व्याज आणि गुंतवणूक परतावा मोजला आणि जमा केला.',
    te: 'ఆటో-పెరుగుదల అమలు చేయబడింది! బ్యాంక్ వడ్డీ మరియు పెట్టుబడి రాబడులు లెక్కించబడి జమ చేయబడ్డాయి.',
  },
  linkedBanks: { en: 'Linked Banks', hi: 'लिंक किए गए बैंक', mr: 'जोडलेल्या बँका', te: 'లింక్ చేయబడిన బ్యాంకులు' },
  linkedUpis: { en: 'Linked UPI IDs', hi: 'लिंक किए गए UPI आईडी', mr: 'जोडलेले UPI पत्ते', te: 'లింక్ చేసిన UPI IDలు' },
  linkedInvestments: { en: 'Linked Portfolios & SIPs', hi: 'लिंक किए गए पोर्टफोलियो और SIP', mr: 'जोडलेले पोर्टफोलिओ आणि SIP', te: 'లింక్ చేసిన పోర్ట్‌ఫోలియోలు & SIPలు' },
  autoGrowthStatusBadge: { en: 'Auto-Growth Engine: Active', hi: 'ऑटो-ग्रोथ इंजन: सक्रिय', mr: 'ऑटो-ग्रोथ इंजिन: सक्रिय', te: 'ఆటో-పెరుగుదల ఇంజిన్: క్రియాశీలకం' },
  growthYieldDesc: {
    en: 'Bank savings accounts accrue 3.5% p.a. interest. Portfolios and SIPs compound according to their annual CAGR yield.',
    hi: 'बैंक बचत खातों पर 3.5% वार्षिक ब्याज मिलता है। पोर्टफोलियो और SIP अपने वार्षिक सीएजीआर रिटर्न के अनुसार बढ़ते हैं।',
    mr: 'बँक बचत खात्यांवर ३.५% वार्षिक व्याज मिळते. पोर्टफोलिओ आणि SIP त्यांच्या वार्षिक CAGR परताव्यानुसार वाढतात.',
    te: 'బ్యాంక్ పొదుపు ఖాతాలు సంవత్సరానికి 3.5% వడ్డీని పొందుతాయి. పోర్ట్‌ఫోలియోలు మరియు SIPలు వాటి వార్షిక CAGR ప్రకారం వృద్ధి చెందుతాయి.',
  },
  unlink: { en: 'Unlink', hi: 'अनलिंक करें', mr: 'अनलिंक करा', te: 'అన్‌లింక్ చేయండి' },
  lastSynced: { en: 'Last Synced', hi: 'अंतिम सिंक', mr: 'शेवटचे सिंक', te: 'చివరిగా సమకాలీకరించబడింది' },

  // Transaction Types & Fields
  typeIncome: { en: 'Income', hi: 'आय', mr: 'उत्पन्न', te: 'ఆదాయం' },
  typeExpense: { en: 'Expense', hi: 'व्यय', mr: 'खर्च', te: 'ఖర్చు' },
  typeTransfer: { en: 'Transfer', hi: 'स्थानांतरण', mr: 'हस्तांतरण', te: 'బదిలీ' },
  typeRefund: { en: 'Refund', hi: 'वापसी (रिफंड)', mr: 'परतावा', te: 'వాపసు' },
  date: { en: 'Date', hi: 'दिनांक', mr: 'दिनांक', te: 'తేదీ' },
  amount: { en: 'Amount', hi: 'राशि', mr: 'रक्कम', te: 'మొత్తం' },
  account: { en: 'Account', hi: 'खाता', mr: 'खाते', te: 'ఖాతా' },
  toAccount: { en: 'Transfer To Account', hi: 'प्राप्तकर्ता खाता', mr: 'हस्तांतरण खाते', te: 'బదిలీ చేయవలసిన ఖాతా' },
  category: { en: 'Category', hi: 'श्रेणी', mr: 'वर्ग', te: 'వర్గం' },
  payee: { en: 'Payee / Merchant', hi: 'प्राप्तकर्ता / व्यापारी', mr: 'प्राप्तकर्ता / व्यापारी', te: 'గ్రహీత / వ్యాపారి' },
  notes: { en: 'Notes', hi: 'टिप्पणियां', mr: 'नोंदी', te: 'గమనికలు' },
  status: { en: 'Status', hi: 'स्थिति', mr: 'स्थिती', te: 'స్థితి' },
  actions: { en: 'Actions', hi: 'कार्रवाई', mr: 'कृती', te: 'చర్యలు' },
  reconciled: { en: 'Reconciled', hi: 'समाधानित (Reconciled)', mr: 'तपासलेले (Reconciled)', te: 'సరిచూడబడింది' },
  pending: { en: 'Pending', hi: 'लंबित', mr: 'प्रलंबित', te: 'పెండింగ్‌లో ఉంది' },

  // Classifications
  classificationNeed: { en: 'Need (Essential)', hi: 'आवश्यकता (अनिवार्य)', mr: 'गरज (अत्यावश्यक)', te: 'అవసరం (ముఖ్యం)' },
  classificationWant: { en: 'Want (Lifestyle)', hi: 'इच्छा (जीवनशैली)', mr: 'इच्छा (जीवनशैली)', te: 'కోరిక (జీవనశైలి)' },
  classificationSavings: { en: 'Savings & Debt', hi: 'बचत और ऋण', mr: 'बचत आणि कर्ज', te: 'పొదుపు & అప్పు' },

  // Buttons & Dialogs
  save: { en: 'Save', hi: 'सहेजें', mr: 'जतन करा', te: 'భద్రపరచండి' },
  cancel: { en: 'Cancel', hi: 'रद्द करें', mr: 'रद्द करा', te: 'రద్దు చేయండి' },
  delete: { en: 'Delete', hi: 'हटाएं', mr: 'हटवा', te: 'తొలగించండి' },
  edit: { en: 'Edit', hi: 'संपादित करें', mr: 'संपादित करा', te: 'సవరించండి' },
  confirm: { en: 'Confirm', hi: 'पुष्टि करें', mr: 'पुष्टी करा', te: 'ధృవీకరించండి' },
  close: { en: 'Close', hi: 'बंद करें', mr: 'बंद करा', te: 'మూసివేయండి' },
  search: { en: 'Search...', hi: 'खोजें...', mr: 'शोधा...', te: 'వెతకండి...' },
  all: { en: 'All', hi: 'सभी', mr: 'सर्व', te: 'అన్నీ' },
  filter: { en: 'Filter', hi: 'फ़िल्टर', mr: 'फिल्टर', te: 'ఫిల్టర్' },
  exportCsv: { en: 'Export CSV', hi: 'CSV निर्यात करें', mr: 'CSV निर्यात करा', te: 'CSV ఎగుమతి చేయండి' },
  importCsv: { en: 'Import CSV', hi: 'CSV आयात करें', mr: 'CSV आयात करा', te: 'CSV దిగుమతి చేయండి' },
  loading: { en: 'Loading...', hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...', te: 'లోడ్ అవుతోంది...' },

  // Accounts
  accountsTitle: { en: 'Financial Accounts', hi: 'वित्तीय खाते', mr: 'आर्थिक खाती', te: 'ఆర్థిక ఖాతాలు' },
  accountsSubtitle: { en: 'Manage checking, savings, cash, credit cards and investment balances.', hi: 'चालू, बचत, नकद, क्रेडिट कार्ड और निवेश शेष प्रबंधित करें।', mr: 'चालू, बचत, रोख, क्रेडिट कार्ड आणि गुंतवणूक शिल्लक व्यवस्थापित करा.', te: 'కరెంట్, పొదుపు, నగదు, క్రెడిట్ కార్డు మరియు పెట్టుబడి నిల్వలను నిర్వహించండి.' },
  addAccountBtn: { en: '+ Add Account', hi: '+ खाता जोड़ें', mr: '+ खाते जोडा', te: '+ ఖాతాను జోడించండి' },
  accountName: { en: 'Account Name', hi: 'खाता नाम', mr: 'खात्याचे नाव', te: 'ఖాతా పేరు' },
  accountType: { en: 'Account Type', hi: 'खाता प्रकार', mr: 'खात्याचा प्रकार', te: 'ఖాతా రకం' },
  institution: { en: 'Institution / Bank', hi: 'संस्थान / बैंक', mr: 'संस्था / बँक', te: 'సంస్థ / బ్యాంక్' },
  accountNumber: { en: 'Account Number', hi: 'खाता संख्या', mr: 'खाते क्रमांक', te: 'ఖాతా సంఖ్య' },
  checkingAccount: { en: 'Checking Account', hi: 'चालू खाता (Checking)', mr: 'चालू खाते', te: 'కరెంట్ ఖాతా' },
  savingsAccount: { en: 'Savings Account', hi: 'बचत खाता (Savings)', mr: 'बचत खाते', te: 'పొదుపు ఖాతా' },
  cashWallet: { en: 'Cash Wallet', hi: 'नकद वॉलेट', mr: 'रोख पाकीट', te: 'నగదు వాలెట్' },
  creditCard: { en: 'Credit Card', hi: 'क्रेडिट कार्ड', mr: 'क्रेडिट कार्ड', te: 'క్రెడిట్ కార్డు' },
  investmentAccount: { en: 'Investment Account', hi: 'निवेश खाता', mr: 'गुंतवणूक खाते', te: 'పెట్టుబడి ఖాతా' },
  openingBalance: { en: 'Opening Balance', hi: 'प्रारंभिक शेष', mr: 'सुरुवातीची शिल्लक', te: 'ప్రారంభ నిల్వ' },
  currentBalance: { en: 'Current Balance', hi: 'वर्तमान शेष', mr: 'सध्याची शिल्लक', te: 'ప్రస్తుత నిల్వ' },
  reconcileAccount: { en: 'Reconcile Account', hi: 'खाते का मिलान करें', mr: 'खाते तपासा', te: 'ఖాతాను సరిచూడండి' },
  currency: { en: 'Currency', hi: 'मुद्रा', mr: 'चलन', te: 'కరెన్సీ' },

  // Transactions Page
  transactionsTitle: { en: 'Transaction History', hi: 'लेन-देन इतिहास', mr: 'व्यवहार इतिहास', te: 'లావాదేవీల చరిత్ర' },
  transactionsSubtitle: { en: 'Add, filter, reconcile and categorize personal income, expenses, refunds and transfers.', hi: 'आय, व्यय, रिफंड और स्थानांतरण को जोड़ें, फ़िल्टर करें और वर्गीकृत करें।', mr: 'उत्पन्न, खर्च, परतावा आणि हस्तांतरण जोडा, फिल्टर करा आणि वर्गीकृत करा.', te: 'ఆదాయం, ఖర్చులు, వాపసులు మరియు బదిలీలను జోడించండి, ఫిల్టర్ చేయండి మరియు వర్గీకరించండి.' },
  filterByType: { en: 'All Types', hi: 'सभी प्रकार', mr: 'सर्व प्रकार', te: 'అన్ని రకాలు' },
  filterByAccount: { en: 'All Accounts', hi: 'सभी खाते', mr: 'सर्व खाती', te: 'అన్ని ఖాతాలు' },
  filterByCategory: { en: 'All Categories', hi: 'सभी श्रेणियां', mr: 'सर्व वर्ग', te: 'అన్ని వర్గాలు' },
  startDate: { en: 'Start Date', hi: 'प्रारंभ तिथि', mr: 'सुरुवात तारीख', te: 'ప్రారంభ తేదీ' },
  endDate: { en: 'End Date', hi: 'अंतिम तिथि', mr: 'शेवट तारीख', te: 'ముగింపు తేదీ' },
  clearFilters: { en: 'Clear Filters', hi: 'फ़िल्टर हटाएं', mr: 'फिल्टर साफ करा', te: 'ఫిల్టర్లను తొలగించండి' },
  totalCount: { en: 'Total Records', hi: 'कुल रिकॉर्ड', mr: 'एकूण नोंदी', te: 'మొత్తం రికార్డులు' },

  // Income & Expenses
  incomeTitle: { en: 'Income Streams', hi: 'आय के स्रोत', mr: 'उत्पन्नाचे स्रोत', te: 'ఆదాయ మార్గాలు' },
  incomeSubtitle: { en: 'Track salaries, freelance contracts, dividends and other inflows.', hi: 'वेतन, फ्रीलांस अनुबंध, लाभांश और अन्य आमदनी ट्रैक करें।', mr: 'पगार, फ्रीलान्स कंत्राटे, लाभांश आणि इतर उत्पन्न ट्रॅक करा.', te: 'జీతాలు, ఫ్రీలాన్స్ కాంట్రాక్టులు, డివిడెండ్లు మరియు ఇతర ఆదాయాలను ట్రాక్ చేయండి.' },
  expensesTitle: { en: 'Expenses & Needs vs Wants', hi: 'व्यय और आवश्यकताएं बनाम इच्छाएं', mr: 'खर्च आणि गरजा विरुद्ध इच्छा', te: 'ఖర్చులు & అవసరాలు vs కోరికలు' },
  expensesSubtitle: { en: 'Monitor your spending breakdown and stay within planned budgets.', hi: 'अपने खर्चों के विवरण की निगरानी करें और बजट सीमा में रहें।', mr: 'तुमच्या खर्चाच्या तपशीलाचे निरीक्षण करा आणि अंदाजपत्रकाच्या मर्यादेत राहा.', te: 'మీ ఖర్చుల వివరాలను పర్యవేక్షించండి మరియు బడ్జెట్ పరిమితిలో ఉండండి.' },

  // Budgets & Goals
  budgetTitle: { en: 'Monthly Budget Planning', hi: 'मासिक बजट योजना', mr: 'मासिक अंदाजपत्रक नियोजन', te: 'నెలవారీ బడ్జెట్ ప్రణాళిక' },
  budgetSubtitle: { en: 'Allocate monthly income across Needs (50%), Wants (30%), and Savings (20%).', hi: 'आवश्यकताओं (50%), इच्छाओं (30%) और बचत (20%) में मासिक आय आवंटित करें।', mr: 'गरजा (50%), इच्छा (30%) आणि बचत (20%) मध्ये मासिक उत्पन्न वाटप करा.', te: 'అవసరాలు (50%), కోరికలు (30%) మరియు పొదుపు (20%) లో నెలవారీ ఆదాయాన్ని కేటాయించండి.' },
  incomeTarget: { en: 'Monthly Income Target', hi: 'मासिक आय लक्ष्य', mr: 'मासिक उत्पन्न लक्ष्य', te: 'నెలవారీ ఆదాయ లక్ష్యం' },
  needsTarget: { en: 'Needs Allocation', hi: 'आवश्यकताएं आवंटन', mr: 'गरजा वाटप', te: 'అవసరాల కేటాయింపు' },
  wantsTarget: { en: 'Wants Allocation', hi: 'इच्छाएं आवंटन', mr: 'इच्छा वाटप', te: 'కోరికల కేటాయింపు' },
  savingsTarget: { en: 'Savings Allocation', hi: 'बचत आवंटन', mr: 'बचत वाटप', te: 'పొదుపు కేటాయింపు' },
  remainingUnallocated: { en: 'Remaining Unallocated', hi: 'शेष अनिर्धारित', mr: 'उर्वरित अनिर्धारित', te: 'మిగిలిన కేటాయించని మొత్తం' },

  // Savings Goals
  goalsTitle: { en: 'Savings Goals & Targets', hi: 'बचत लक्ष्य और उद्देश्य', mr: 'बचत उद्दिष्टे आणि लक्ष्ये', te: 'పొదుపు లక్ష్యాలు & గమ్యాలు' },
  goalsSubtitle: { en: 'Set target dates and track progress toward multiple financial goals.', hi: 'लक्षित तिथियां निर्धारित करें और कई लक्ष्यों की प्रगति ट्रैक करें।', mr: 'लक्ष्य तारखा निश्चित करा आणि उद्दिष्टांच्या प्रगतीचा मागोवा घ्या.', te: 'లక్ష్య తేదీలను నిర్ణయించండి మరియు బహుళ ఆర్థిక లక్ష్యాల పురోగతిని ట్రాక్ చేయండి.' },
  addGoalBtn: { en: '+ Add Goal', hi: '+ नया लक्ष्य जोड़ें', mr: '+ नवीन उद्दिष्ट जोडा', te: '+ కొత్త లక్ష్యాన్ని జోడించండి' },
  goalName: { en: 'Goal Name', hi: 'लक्ष्य का नाम', mr: 'उद्दिष्टाचे नाव', te: 'లక్ష్యం పేరు' },
  targetAmount: { en: 'Target Amount', hi: 'लक्ष्य राशि', mr: 'लक्ष्य रक्कम', te: 'లక్ష్య మొత్తం' },
  currentSavings: { en: 'Current Savings', hi: 'वर्तमान बचत', mr: 'सध्याची बचत', te: 'ప్రస్తుత పొదుపు' },
  targetDate: { en: 'Target Date', hi: 'लक्षित तिथि', mr: 'लक्ष्य तारीख', te: 'లక్ష్య తేదీ' },
  progress: { en: 'Progress', hi: 'प्रगति', mr: 'प्रगती', te: 'పురోగతి' },

  // Bills
  billsTitle: { en: 'Bills & Subscriptions', hi: 'बिल और सदस्यताएं', mr: 'बिले आणि सदस्यता', te: 'బిల్లులు & సభ్యత్వాలు' },
  billsSubtitle: { en: 'Keep track of recurring obligations and avoid late payment penalties.', hi: 'आवर्ती देयताओं को ट्रैक करें और विलंब शुल्क से बचें।', mr: 'आवर्ती दायित्वांचा मागोवा घ्या आणि विलंब दंड टाळा.', te: 'పునరావృత బిల్లులను ట్రాక్ చేయండి మరియు ఆలస్య రుసుములను నివారించండి.' },
  addBillBtn: { en: '+ Add Recurring Bill', hi: '+ आवर्ती बिल जोड़ें', mr: '+ आवर्ती बिल जोडा', te: '+ పునరావృత బిల్లును జోడించండి' },
  dueDay: { en: 'Due Day of Month', hi: 'माह का देय दिवस', mr: 'महिन्याचा देय दिवस', te: 'నెలలో చెల్లించాల్సిన తేదీ' },
  frequency: { en: 'Frequency', hi: 'आवृत्ति', mr: 'वारंवारता', te: 'ఫ్రీక్వెన్సీ' },
  autopay: { en: 'Autopay Enabled', hi: 'ऑटोपे सक्षम', mr: 'ऑटोपे सक्षम', te: 'ఆటోపే ప్రారంభించబడింది' },

  // Investments
  investmentsTitle: { en: 'Investments, SIPs & Fixed Deposits', hi: 'निवेश, SIP और सावधि जमा (FD)', mr: 'गुंतवणूक, SIP आणि मुदत ठेवी (FD)', te: 'పెట్టుబడులు, SIP & ఫిక్స్‌డ్ డిపాజిట్లు' },
  investmentsSubtitle: { en: 'Track mutual funds, systematic investment plans, and fixed yields with transparent growth calculations.', hi: 'म्यूचुअल फंड, व्यवस्थित निवेश योजनाओं और पारदर्शी विकास की निगरानी करें।', mr: 'म्युच्युअल फंड, सिस्टिमॅटिक इन्व्हेस्टमेंट प्लॅन आणि परतावा ट्रॅक करा.', te: 'మ్యూచువల్ ఫండ్లు, క్రమబద్ధమైన పెట్టుబడులు మరియు రాబడులను ట్రాక్ చేయండి.' },
  addInvestmentBtn: { en: '+ Add Investment', hi: '+ निवेश जोड़ें', mr: '+ गुंतवणूक जोडा', te: '+ పెట్టుబడిని జోడించండి' },
  investedAmount: { en: 'Invested Capital', hi: 'निवेशित पूंजी', mr: 'गुंतवलेले भांडवल', te: 'పెట్టుబడి పెట్టిన మొత్తం' },
  currentValue: { en: 'Current Value', hi: 'वर्तमान मूल्य', mr: 'सध्याचे मूल्य', te: 'ప్రస్తుత విలువ' },
  expectedReturnRate: { en: 'Annual Yield Rate (%)', hi: 'वार्षिक रिटर्न दर (%)', mr: 'वार्षिक परतावा दर (%)', te: 'వార్షిక రాబడి రేటు (%)' },
  gainLoss: { en: 'Total Gain / Loss', hi: 'कुल लाभ / हानि', mr: 'एकूण नफा / तोटा', te: 'మొత్తం లాభం / నష్టం' },

  // Assets & Liabilities
  assetsLiabilitiesTitle: { en: 'Assets & Liabilities', hi: 'परिसंपत्तियां और देनदारियां', mr: 'मालमत्ता आणि दायित्वे', te: 'ఆస్తులు & అప్పులు' },
  assetsLiabilitiesSubtitle: { en: 'Document real estate, vehicles, gold, personal loans and mortgages.', hi: 'अचल संपत्ति, वाहन, सोना, व्यक्तिगत ऋण और बंधक दर्ज करें।', mr: 'स्थावर मालमत्ता, वाहने, सोने, वैयक्तिक कर्जे आणि तारण नोंदवा.', te: 'స్థిరాస్తి, వాహనాలు, బంగారం, వ్యక్తిగత రుణాలు మరియు తనఖాలను నమోదు చేయండి.' },
  addAssetBtn: { en: '+ Add Asset', hi: '+ परिसंपत्ति जोड़ें', mr: '+ मालमत्ता जोडा', te: '+ ఆస్తిని జోడించండి' },
  addLiabilityBtn: { en: '+ Add Liability / Loan', hi: '+ देनदारी / ऋण जोड़ें', mr: '+ दायित्व / कर्ज जोडा', te: '+ అప్పు / రుణాన్ని జోడించండి' },

  // Net Worth
  netWorthTitle: { en: 'Net Worth Tracker', hi: 'कुल संपत्ति ट्रैकर', mr: 'एकूण निव्वळ संपत्ती ट्रॅकर', te: 'నికర విలువ ట్రాకర్' },
  netWorthSubtitle: { en: 'Your complete financial solvency = Total Assets minus Total Liabilities.', hi: 'आपकी वित्तीय संपन्नता = कुल संपत्ति ऋण कुल देनदारियां।', mr: 'तुमची आर्थिक पत = एकूण मालमत्ता वजा एकूण दायित्वे.', te: 'మీ మొత్తం ఆర్థిక స్థితి = మొత్తం ఆస్తులు మైనస్ మొత్తం అప్పులు.' },

  // Reports
  reportsTitle: { en: 'Reports & Analytics', hi: 'रिपोर्ट्स और विश्लेषण', mr: 'अहवाल आणि विश्लेषण', te: 'నివేదికలు & విశ్లేషణ' },
  reportsSubtitle: { en: 'Data-driven visual insights on income, expenses, category distribution and savings ratios.', hi: 'आय, व्यय, श्रेणी वितरण और बचत अनुपात पर डेटा-संचालित विश्लेषण।', mr: 'उत्पन्न, खर्च, वर्ग वितरण आणि बचत गुणोत्तरावर डेटा-आधारित विश्लेषण.', te: 'ఆదాయం, ఖర్చులు, వర్గాల కేటాయింపు మరియు పొదుపుపై డేటా ఆధారిత అంతర్దృష్టులు.' },

  // Categories
  categoriesTitle: { en: 'Categories & Spending Limits', hi: 'श्रेणियां और व्यय सीमाएं', mr: 'वर्ग आणि खर्च मर्यादा', te: 'వర్గాలు & ఖర్చు పరిమితులు' },
  categoriesSubtitle: { en: 'Customize your spending tags and set monthly category thresholds.', hi: 'अपने व्यय टैग कस्टमाइज़ करें और मासिक श्रेणी सीमाएं निर्धारित करें।', mr: 'तुमचे खर्च टॅग्ज सानुकूलित करा आणि मासिक वर्ग मर्यादा सेट करा.', te: 'మీ ఖర్చు ట్యాగ్‌లను అనుకూలీకరించండి మరియు నెలవారీ వర్గ పరిమితులను సెట్ చేయండి.' },
  addCategoryBtn: { en: '+ Add Category', hi: '+ श्रेणी जोड़ें', mr: '+ वर्ग जोडा', te: '+ వర్గాన్ని జోడించండి' },
  monthlyLimit: { en: 'Monthly Limit', hi: 'मासिक सीमा', mr: 'मासिक मर्यादा', te: 'నెలవారీ పరిమితి' },

  // Settings & Numbers
  settingsTitle: { en: 'System Settings & Preferences', hi: 'सिस्टम सेटिंग्स और प्राथमिकताएं', mr: 'प्रणाली सेटिंग्ज आणि प्राधान्ये', te: 'సిస్టమ్ సెట్టింగ్‌లు & ప్రాధాన్యతలు' },
  settingsSubtitle: { en: 'Configure language, theme, currency, Indic numerals, and synchronized desktop integration.', hi: 'भाषा, थीम, मुद्रा, भारतीय अंक और डेस्कटॉप एकीकरण कॉन्फ़िगर करें।', mr: 'भाषा, थीम, चलन, भारतीय अंक आणि डेस्कटॉप एकत्रीकरण कॉन्फिगर करा.', te: 'భాష, థీమ్, కరెన్సీ, భారతీయ అంకెలు మరియు డెస్క్‌టాప్ అనుసంధానాన్ని కాన్ఫిగర్ చేయండి.' },
  userProfile: { en: 'User Profile', hi: 'उपयोगकर्ता प्रोफ़ाइल', mr: 'वापरकर्ता प्रोफाइल', te: 'వినియోగదారు ప్రొఫైల్' },
  fullName: { en: 'Full Name', hi: 'पूरा नाम', mr: 'पूर्ण नाव', te: 'పూర్తి పేరు' },
  emailAddress: { en: 'Email Address', hi: 'ईमेल पता', mr: 'ईमेल पत्ता', te: 'ఈమెయిల్ చిరునామా' },
  accountIdLabel: { en: 'User Account ID', hi: 'उपयोगकर्ता खाता आईडी', mr: 'वापरकर्ता खाते आयडी', te: 'వినియోగదారు ఖాతా ID' },
  verificationStatus: { en: 'Verification Status', hi: 'सत्यापन स्थिति', mr: 'पडताळणी स्थिती', te: 'ధృవీకరణ స్థితి' },
  verifiedBadge: { en: 'Email OTP Verified', hi: 'ईमेल OTP सत्यापित', mr: 'ईमेल OTP तपासले', te: 'ఈమెయిల్ OTP ధృవీకరించబడింది' },
  displayPreferences: { en: 'Display, Language & Currency Preferences', hi: 'प्रदर्शन, भाषा और मुद्रा प्राथमिकताएं', mr: 'प्रदर्शन, भाषा आणि चलन प्राधान्ये', te: 'ప్రదర్శన, భాష & కరెన్సీ ప్రాధాన్యతలు' },
  themeMode: { en: 'Theme Mode', hi: 'थीम मोड', mr: 'थीम मोड', te: 'థీమ్ మోడ్' },
  baseCurrency: { en: 'Base Currency', hi: 'आधार मुद्रा', mr: 'मूळ चलन', te: 'ప్రాథమిక కరెన్సీ' },
  indicNumeralsToggle: {
    en: 'Display Native Indic Numerals',
    hi: 'देवनागरी भारतीय अंक प्रदर्शित करें (०, १, २, ३...)',
    mr: 'मराठी देवनागरी अंक प्रदर्शित करा (०, १, २, ३...)',
    te: 'తెలుగు లిపి అంకెలను చూపించండి (౦, ౧, ౨, ౩...)',
  },
  indicNumeralsDesc: {
    en: 'Toggle between traditional Indic numerals and standard numerals across all balances, amounts, calculations and dates.',
    hi: 'सभी शेष, राशियों, गणनाओं और तिथियों पर पारंपरिक भारतीय अंकों और मानक अंकों के बीच स्विच करें।',
    mr: 'सर्व शिल्लक, रक्कम, आकडेमोड आणि तारखांवर पारंपारिक भारतीय अंक आणि मानक अंकांमध्ये स्विच करा.',
    te: 'అన్ని బ్యాలెన్స్‌లు, మొత్తాలు, లెక్కలు మరియు తేదీలలో సాంప్రదాయ భారతీయ అంకెలు మరియు ప్రామాణిక అంకెల మధ్య మార్చండి.',
  },
  selectLanguage: { en: 'Language', hi: 'भाषा', mr: 'भाषा', te: 'భాష' },
  demoDataTitle: { en: 'Synthetic Demo Data Generator', hi: 'सिंथेटिक डेमो डेटा जनरेटर', mr: 'सिंथेटिक डेमो डेटा जनरेटर', te: 'డెమో డేటా జనరేటర్' },
  demoDataDesc: { en: 'Populate realistic test records on-demand for immediate evaluation.', hi: 'मूल्यांकन के लिए मांग पर यथार्थवादी परीक्षण रिकॉर्ड बनाएं।', mr: 'मूल्यांकनासाठी वास्तववादी चाचणी नोंदी तयार करा.', te: 'తక్షణ పరిశీలన కోసం వాస్తవిక పరీక్ష రికార్డులను లోడ్ చేయండి.' },
  demoDataBtn: { en: 'Load Sample Financial Records', hi: 'नमूना वित्तीय रिकॉर्ड लोड करें', mr: 'नमुना आर्थिक नोंदी लोड करा', te: 'నమూనా ఆర్థిక రికార్డులను లోడ్ చేయండి' },
  generating: { en: 'Generating...', hi: 'तैयार किया जा रहा है...', mr: 'तयार होत आहे...', te: 'రూపొందిస్తోంది...' },
  demoDataSuccess: { en: 'Synthetic demo data loaded successfully! View Dashboard & Accounts.', hi: 'सिंथेटिक डेटा लोड हो गया! डैशबोर्ड और खातों की जांच करें।', mr: 'सिंथेटिक डेटा यशस्वीरित्या लोड झाला!', te: 'డెమో డేటా విజయవంతంగా లోడ్ అయింది!' },
  otpModeTitle: { en: 'Email OTP Mode Configuration', hi: 'ईमेल OTP मोड कॉन्फ़िगरेशन', mr: 'ईमेल OTP मोड कॉन्फिगरेशन', te: 'ఈమెయిల్ OTP మోడ్ కాన్ఫిగరేషన్' },
  otpDevDesc: {
    en: 'Development Mode (Active): OTP codes are automatically printed in server logs and UI banner for instantaneous testing without SMTP dependencies.',
    hi: 'विकास मोड (सक्रिय): OTP कोड बिना किसी निर्भरता के तुरंत परीक्षण के लिए सर्वर लॉग और UI बैनर में मुद्रित होते हैं।',
    mr: 'डेव्हलपमेंट मोड (सक्रिय): OTP कोड त्वरित चाचणीसाठी सर्व्हर लॉग आणि UI बॅनरमध्ये मुद्रित केले जातात.',
    te: 'డెవలప్‌మెంట్ మోడ్ (క్రియాశీలకం): తక్షణ పరీక్ష కోసం OTP కోడ్‌లు సర్వర్ లాగ్‌లు మరియు UI బ్యానర్‌లో స్వయంచాలకంగా చూపబడతాయి.',
  },

  // Desktop Simulator Modal
  desktopSyncTitle: { en: 'PocketPilot Desktop Client Live Companion', hi: 'पॉकेटपायलट डेस्कटॉप क्लाइंट लाइव साथी', mr: 'पॉकेटपायलट डेस्कटॉप साथी', te: 'పాకెట్‌పైలట్ డెస్క్‌టాప్ క్లయింట్ లైవ్ సహచరుడు' },
  desktopSyncSubtitle: { en: 'Java 21 + JavaFX Native Desktop Application sharing the identical MySQL 8 database schema.', hi: 'समान MySQL 8 डेटाबेस साझा करने वाला Java 21 + JavaFX डेस्कटॉप एप्लिकेशन।', mr: 'समान MySQL 8 डेटाबेस शेअर करणारे Java 21 + JavaFX डेस्कटॉप अॅप्लिकेशन.', te: 'అదే MySQL 8 డేటాబేస్‌ను పంచుకునే Java 21 + JavaFX డెస్క్‌టాప్ అప్లికేషన్.' },
  launchNativeDesktop: { en: 'Launch Native Desktop App via Shell', hi: 'शेल के माध्यम से डेस्कटॉप ऐप लॉन्च करें', mr: 'शेलद्वारे नेटिव्ह डेस्कटॉप अॅप सुरू करा', te: 'షెల్ ద్వారా స్థానిక డెస్క్‌టాప్ యాప్‌ను ప్రారంభించండి' },
  refreshLiveState: { en: 'Refresh Live State', hi: 'लाइव स्थिति ताज़ा करें', mr: 'थेट स्थिती रीफ्रेश करा', te: 'లైవ్ స్థితిని రిఫ్రెష్ చేయండి' },
  connectedClients: { en: 'Active Backend Sessions', hi: 'सक्रिय बैकएंड सत्र', mr: 'सक्रिय बॅकएंड सत्रे', te: 'క్రియాశీల బ్యాకెండ్ సెషన్‌లు' },
};
