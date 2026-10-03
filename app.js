const STORAGE_KEY = "elmanar-learning-space-v1";
const SUPABASE_STORAGE_KEY = "sb-klgrrdmfrviyayeyhmki-auth-token";
const app = document.getElementById("app");
const welcomeShell = document.getElementById("welcome-shell");
const welcomeContent = document.getElementById("welcome-content");
const appShell = document.getElementById("app-shell");
const toastRegion = document.getElementById("toast-region");
const navContainer = document.getElementById("primary-nav");
const breadcrumb = document.getElementById("breadcrumb-current");
const statusBadge = document.getElementById("connection-status");

/* ================================================================
   TRILINGUAL DICTIONARY (EN · AR · FR)
   ================================================================ */
const i18n = {
  en: {
    brandCaption: "A brighter way to learn",
    signIn: "Sign in",
    signOut: "Sign out",
    switchTheme: "Switch appearance",
    today: "Today",
    checkingAi: "Checking AI",
    aiReady: "AI ready",
    sampleMode: "Sample mode",
    aiUnavailable: "AI unavailable",
    backHome: "Back to Elmanar",
    backToSignin: "Back to sign in",
    createAccount: "Create account",
    welcomeEyebrow: "A LEARNING COMMUNITY BUILT AROUND YOU",
    welcomeHeroTitle: "Every learner<br/>deserves a <span>little light.</span>",
    welcomeHeroDesc: "Learning feels different when teachers, students and families move forward together. Welcome to a brighter kind of classroom.",
    findYourPlace: "Find your place",
    welcomeNote: "Your own portal. Your own progress.",
    welcomeProof: "For everyone who helps a learner grow.",
    portalsEyebrow: "THREE PORTALS · ONE COMMUNITY",
    portalsHeading: "There’s a place for <span>you here.</span>",
    portalsDesc: "Choose your role to create a personal account and step into your own Elmanar space.",
    bottomNote: "Thoughtful teaching. Confident learners. Connected families.",
    footerMotto: "Learning makes a brighter future.",
    siteFooterText: "Made for the moments when learning <span>clicks.</span>",
    sidebarNote: "Small steps add up to <strong>big understanding.</strong>",
    teacherName: "Teacher",
    studentName: "Student",
    parentName: "Parent",
    teacherHeadline: "Turn what you taught into a thoughtful quiz in seconds.",
    teacherBenefit: "LESSON · QUIZ · FEEDBACK",
    studentHeadline: "A quiet space to check what clicked and see how you’re doing.",
    studentBenefit: "PRACTICE · EXPLANATIONS · PROGRESS",
    parentHeadline: "See what they’re learning and where they might need a hand.",
    parentBenefit: "SUMMARY · CONVERSATIONS · CELEBRATION",
    teacherStudio: "Teacher studio",
    welcomeBack: "Welcome back",
    makeLearningStick: "Let’s make learning stick.",
    teacherSubtitle: "Turn today’s lesson into a thoughtful quiz or clear simplified notes, share it with your class, and see where students need support.",
    quizzesCreated: "quizzes created",
    quizCreated: "quiz created",
    tabQuiz: "Create Quiz",
    tabSimplifier: "Summarize & Simplify Difficulties",
    buildQuizTitle: "Build a quiz from a lesson or document",
    buildQuizDesc: "Paste your teaching notes, or drop a PDF document below.",
    step1: "STEP 01 / 03",
    whatTeaching: "What are you teaching?",
    topicPlaceholder: "e.g. How plants make food",
    questionCount: "Question count",
    questionsLabel: "questions",
    whoIsFor: "Who is this quiz for?",
    whoIsForDesc: "Set the class level and subject so the AI can tailor wording and difficulty.",
    yourLesson: "Your lesson or notes",
    lessonHint: "A paragraph, chapter notes, or uploaded document",
    lessonPlaceholder: "Paste a lesson, class notes, or key ideas you want students to master…",
    useSampleLesson: "Use sample lesson",
    dropDocument: "Drop PDF or document here, or click to browse",
    dropDocumentSub: "Supports .pdf, .txt, .docx, .md · Automatic text extraction & analysis",
    analyzingDoc: "Analyzing document with AI...",
    orTrySampleDocs: "Or try a sample document:",
    generateQuizBtn: "Generate AI Quiz",
    simplifyDifficultiesBtn: "Summarize & Simplify Difficulties",
    sampleQuizBtn: "Explore a sample",
    aiTeacherNote: "Your lesson stays yours. The AI drafts questions; you review and approve every one before students see them.",
    simplifierTitle: "Lesson Simplifier & Difficulty Breakdown",
    simplifierSubtitle: "Dense lessons made small, clear, and relatable.",
    tldrLabel: "The Core Essence in 30 Seconds",
    keyPointsTitle: "Key Points at a Glance",
    difficultiesTitle: "Difficulties Decoded & Everyday Analogies",
    whyHardLabel: "Why it's tricky:",
    simplifiedLabel: "Simple explanation:",
    analogyLabel: "Everyday analogy:",
    vocabTitle: "Academic Vocabulary Decoded",
    quickCheckTitle: "Quick Concept Check",
    turnIntoQuiz: "Turn this into an Interactive Quiz",
    copySummary: "Copy Simplified Notes",
    copiedToast: "Simplified notes copied to clipboard!",
    classroomTitle: "YOUR CLASSROOM",
    sharedWithStudents: "Shared with your students",
    sharedPrivate: "Every quiz is private to your teacher account.",
    classCode: "CLASS CODE",
    editQuiz: "Edit quiz",
    finishDraft: "Finish draft",
    studentPortal: "YOUR PERSONAL STUDENT PORTAL",
    readyWhenYouAre: "Ready when you are.",
    studentSubtitle: "Your quizzes live here — just for you. Enter the code your teacher shared or simplify hard lessons.",
    gotClassCode: "Got a class code?",
    gotClassCodeDesc: "Your teacher gives every quiz a private code. Enter it here to add that quiz to your own learning space.",
    joinQuizBtn: "Join my quiz",
    privateFamilyLink: "Your private family link",
    privateFamilyDesc: "Share this code with a parent so they can celebrate your learning.",
    copyCode: "Copy code",
    learningProfile: "YOUR LEARNING PROFILE",
    makeProfileFit: "Make your learning space fit you",
    profileDesc: "Choose your stage, year and subject. Your profile is private and can be updated any time.",
    saveProfile: "Save my learning profile",
    yourLearningAllInOne: "Your learning, all in one place",
    quizzesJoined: "Quizzes you’ve joined and the progress you’ve made.",
    startQuizBtn: "Start quiz",
    reviewAnswersBtn: "Review answers",
    readyBadge: "READY",
    matchesProfile: "MATCHES YOUR PROFILE",
    classQuiz: "CLASS QUIZ",
    myQuizzes: "My quizzes",
    finishAndScore: "Finish & see my score",
    tryAgain: "Try again",
    yourScore: "YOUR SCORE",
    familyOverview: "A calm, shared view of school progress",
    familySubtitle: "See the topics your child is mastering and the gentle next steps you can explore together at home.",
    connectChildTitle: "Connect to your learner",
    connectChildDesc: "Enter the private family code from your child’s student portal.",
    connectFamilyBtn: "Connect to my child",
    studyAssistantTitle: "AI Study Assistant & Simplifier",
    studyAssistantDesc: "Having trouble understanding a complex chapter? Paste your notes or drop a PDF document to break it down simply.",
    cancel: "Cancel",
    save: "Save",
    loading: "Loading...",
    protoBadge: "Prototype"
  },
  ar: {
    brandCaption: "طريقك الأوضح نحو المعرفة",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    switchTheme: "تغيير المظهر",
    today: "اليوم",
    checkingAi: "جاري فحص الذكاء الاصطناعي",
    aiReady: "الذكاء الاصطناعي جاهز",
    sampleMode: "الوضع التجريبي",
    aiUnavailable: "الذكاء الاصطناعي غير متوفر",
    backHome: "العودة إلى المنار",
    backToSignin: "الرجوع لتسجيل الدخول",
    createAccount: "إنشاء حساب جديد",
    welcomeEyebrow: "مجتمع تعليمي متكامل صُمم من أجلك",
    welcomeHeroTitle: "لكل متعلّم حق في<br/><span>قبسٍ من نور.</span>",
    welcomeHeroDesc: "يكتسب التعلم معنى حقيقياً عندما يسير المعلم والمتعلم والأسرة معاً بخطى واثقة. مرحباً بكم في فضاء المنار التعليمي الأذكى والأبسط.",
    findYourPlace: "اكتشف مساحتك الآن",
    welcomeNote: "بوابتك الخاصة. وتطورك المستمر.",
    welcomeProof: "لكل من يساند متعلماً ليزدهر وينمو.",
    portalsEyebrow: "ثلاث بوابات · مجتمع تعليمي واحد",
    portalsHeading: "لكل منا مكان <span>هنا معكم.</span>",
    portalsDesc: "اختر دورك لإنشاء حسابك الشخصي والانطلاق في فضاء المنار المخصص لك.",
    bottomNote: "تعليم ملهم. متعلّمون واثقون. وأسر مترابطة.",
    footerMotto: "بالعلم نصنع مستقبلاً أكثر إشراقاً.",
    siteFooterText: "صُمم لتلك اللحظات التي تضيء فيها المعرفة.",
    sidebarNote: "الخطوات البسيطة تصنع <strong>فهماً عظيماً وراسخاً.</strong>",
    teacherName: "المعلم",
    studentName: "التلميذ",
    parentName: "ولي الأمر",
    teacherHeadline: "حوّل الدرس إلى اختبار ذكي وملخص مبسط في ثوانٍ معدودة.",
    teacherBenefit: "درس · اختبار · تقييم فوري",
    studentHeadline: "مساحتك الهادئة لاختبار فهمك وتبسيط أصعب الدروس بسهولة.",
    studentBenefit: "تدريب · شروحات مبسطة · تقدم مستمر",
    parentHeadline: "تابع ما يتعلمه ابنك واكتشف أين يحتاج إلى دعم وتشجيع.",
    parentBenefit: "ملخص أداء · حوار أسري · احتفاء بالنجاح",
    teacherStudio: "استوديو المعلم",
    welcomeBack: "مرحباً بعودتك",
    makeLearningStick: "لنجعل المعرفة تدوم وترسخ.",
    teacherSubtitle: "حوّل درس اليوم إلى اختبار تفاعلي مدروس أو ملخص مبسط يفكك الصعوبات، وشاركه مع صفك بضغطة زر.",
    quizzesCreated: "اختبارات منشأة",
    quizCreated: "اختبار منشأ",
    tabQuiz: "إنشاء اختبار ذكي",
    tabSimplifier: "تلخيص وتبسيط الصعوبات",
    buildQuizTitle: "بناء اختبار من درس أو مستند",
    buildQuizDesc: "ألصق ملاحظات الدرس، أو اسحب ملف PDF مباشرة إلى المربع أدناه.",
    step1: "الخطوة 01 / 03",
    whatTeaching: "ما هو موضوع درس اليوم؟",
    topicPlaceholder: "مثال: كيفية صنع النبات لغذائه (التركيب الضوئي)",
    questionCount: "عدد الأسئلة",
    questionsLabel: "أسئلة",
    whoIsFor: "لمن هذا الاختبار؟",
    whoIsForDesc: "حدد الطور التعليمي والمستوى والمادة ليقوم الذكاء الاصطناعي بتكييف مستوى الصعوبة بدقة.",
    yourLesson: "محتوى الدرس أو الملاحظات",
    lessonHint: "فقرة أو ملخص الدرس أو مستند مرفوع",
    lessonPlaceholder: "ألصق نص الدرس أو النقاط الرئيسية التي تريد أن يستوعبها الطلاب…",
    useSampleLesson: "استخدام درس نموذجي",
    dropDocument: "اسحب ملف PDF أو مستند هنا، أو انقر للاختيار",
    dropDocumentSub: "يدعم صيغ PDF، TXT، DOCX، MD · استخراج وتحليل فوري للنصوص",
    analyzingDoc: "جاري تحليل المستند بالذكاء الاصطناعي...",
    orTrySampleDocs: "أو جرّب أحد المستندات النموذجية:",
    generateQuizBtn: "توليد الاختبار بالذكاء الاصطناعي",
    simplifyDifficultiesBtn: "تلخيص وتبسيط الصعوبات",
    sampleQuizBtn: "استعراض نموذج جاهز",
    aiTeacherNote: "الدرس ملك لك دائماً. الذكاء الاصطناعي يقترح الأسئلة؛ وأنت تراجع وتعتمد كل سؤال قبل أن يراه التلاميذ.",
    simplifierTitle: "ملخص الدرس وتبسيط الصعوبات (Make it Small & Simple)",
    simplifierSubtitle: "تحويل النصوص الطويلة والمعقدة إلى خطوات واضحة وممتعة.",
    tldrLabel: "الخلاصة الجوهرية في 30 ثانية",
    keyPointsTitle: "النقاط الأساسية باختصار",
    difficultiesTitle: "تفكيك الصعوبات وأمثلة من الواقع",
    whyHardLabel: "لماذا تبدو صعبة:",
    simplifiedLabel: "الشرح المبسط:",
    analogyLabel: "تشبيه من الحياة اليومية:",
    vocabTitle: "قاموس المصطلحات الصعبة",
    quickCheckTitle: "سؤال سريع لاختبار الاستيعاب",
    turnIntoQuiz: "تحويل هذا الملخص إلى اختبار تفاعلي",
    copySummary: "نسخ الملخص المبسط",
    copiedToast: "تم نسخ الملخص إلى الحافظة بنجاح!",
    classroomTitle: "قسمك الدراسي",
    sharedWithStudents: "المشاركات مع طلابك",
    sharedPrivate: "كل اختبار خاص ومحمي داخل حساب المعلم الخاص بك.",
    classCode: "رمز الفصل",
    editQuiz: "تعديل الاختبار",
    finishDraft: "إكمال المسودة",
    studentPortal: "بوابتك الدراسية الخاصة",
    readyWhenYouAre: "مستعد في أي وقت.",
    studentSubtitle: "اختباراتك وملاحظاتك هنا من أجلك. أدخل الرمز الذي شاركه معلمك أو قم بتبسيط دروسك الصعبة.",
    gotClassCode: "هل لديك رمز فصل دراسي؟",
    gotClassCodeDesc: "يعطي معلمك لكل اختبار رمزاً خاصاً. أدخله هنا لإضافة الاختبار إلى مساحتك التعليمية.",
    joinQuizBtn: "الانضمام للاختبار",
    privateFamilyLink: "رابط الأسرة الخاص بك",
    privateFamilyDesc: "شارك هذا الرمز مع ولي أمرك ليتابع تقدمك ويفرح بنجاحك دون الاطلاع على إجاباتك الفردية.",
    copyCode: "نسخ الرمز",
    learningProfile: "ملفك الدراسي",
    makeProfileFit: "اضبط مساحتك التعليمية لتناسب مستواك",
    profileDesc: "اختر الطور والسنة والمادة. ملفك خاص ويمكنك تعديله في أي وقت.",
    saveProfile: "حفظ ملفي الدراسي",
    yourLearningAllInOne: "تعلمك وإنجازاتك في مكان واحد",
    quizzesJoined: "الاختبارات التي شاركت فيها والتقدم الذي أحرزته.",
    startQuizBtn: "بدء الاختبار",
    reviewAnswersBtn: "مراجعة الإجابات",
    readyBadge: "جاهز",
    matchesProfile: "يتوافق مع ملفك الدراسي",
    classQuiz: "اختبار صفي",
    myQuizzes: "اختباراتي",
    finishAndScore: "إنهاء وحساب النتيجة",
    tryAgain: "إعادة المحاولة",
    yourScore: "نتيجتك النهائية",
    familyOverview: "رؤية هادئة وشاملة لتطور الأبناء",
    familySubtitle: "اكتشف المفاهيم التي يتقنها ابنك والخطوات البسيطة التي يمكنكما استكشافها معاً في البيت.",
    connectChildTitle: "ربط حساب الابن / الابنة",
    connectChildDesc: "أدخل الرمز العائلي الخاص الموجود في بوابة الطالب لابنك.",
    connectFamilyBtn: "ربط حساب ابني",
    studyAssistantTitle: "المساعد الدراسي الذكي لتبسيط الدروس",
    studyAssistantDesc: "هل تواجه صعوبة في فهم درس طويل أو معقد؟ ألصق نص الدرس أو ارفع ملف PDF ليقوم الذكاء الاصطناعي بتفكيكه وتبسيطه لك خطوة بخطوة.",
    cancel: "إلغاء",
    save: "حفظ",
    loading: "جاري التحميل...",
    protoBadge: "نموذج تجريبي"
  },
  fr: {
    brandCaption: "Une façon plus lumineuse d'apprendre",
    signIn: "Connexion",
    signOut: "Déconnexion",
    switchTheme: "Changer l'apparence",
    today: "Aujourd'hui",
    checkingAi: "Vérification de l'IA",
    aiReady: "IA prête",
    sampleMode: "Mode démo",
    aiUnavailable: "IA indisponible",
    backHome: "Retour à Elmanar",
    backToSignin: "Retour à la connexion",
    createAccount: "Créer un compte",
    welcomeEyebrow: "UNE COMMUNAUTÉ D'APPRENTISSAGE PENSÉE POUR VOUS",
    welcomeHeroTitle: "Chaque apprenant mérite<br/><span>sa part de lumière.</span>",
    welcomeHeroDesc: "L'apprentissage prend tout son sens lorsque enseignants, élèves et familles avancent d'un même pas. Bienvenue dans un espace éducatif plus clair et stimulant.",
    findYourPlace: "Trouvez votre place",
    welcomeNote: "Votre portail dédié. Vos propres progrès.",
    welcomeProof: "Pour tous ceux qui font grandir un apprenant.",
    portalsEyebrow: "TROIS PORTAILS · UNE COMMUNAUTÉ",
    portalsHeading: "Il y a une place <span>pour vous ici.</span>",
    portalsDesc: "Choisissez votre profil pour créer votre compte personnel et rejoindre votre espace Elmanar.",
    bottomNote: "Enseignement réfléchi. Élèves confiants. Familles connectées.",
    footerMotto: "Le savoir éclaire l'avenir.",
    siteFooterText: "Conçu pour les moments où le savoir <span>s'illumine.</span>",
    sidebarNote: "Les petits pas mènent à de <strong>grandes compréhensions.</strong>",
    teacherName: "Enseignant",
    studentName: "Élève",
    parentName: "Parent",
    teacherHeadline: "Transformez votre cours en quiz pertinent et fiches simples en quelques secondes.",
    teacherBenefit: "COURS · QUIZ · FEEDBACK",
    studentHeadline: "Un espace serein pour tester ses connaissances et simplifier les leçons difficiles.",
    studentBenefit: "ENTRAÎNEMENT · EXPLICATIONS · PROGRÈS",
    parentHeadline: "Suivez les acquis de votre enfant et découvrez où l'encourager au quotidien.",
    parentBenefit: "SYNTHÈSE · DIALOGUE · ENCOURAGEMENT",
    teacherStudio: "Studio enseignant",
    welcomeBack: "Ravi de vous revoir",
    makeLearningStick: "Rendons le savoir durable.",
    teacherSubtitle: "Transformez la leçon du jour en un quiz ciblé ou simplifiez les points complexes pour vos élèves.",
    quizzesCreated: "quiz créés",
    quizCreated: "quiz créé",
    tabQuiz: "Créer un quiz IA",
    tabSimplifier: "Résumer & Simplifier les difficultés",
    buildQuizTitle: "Créer un quiz depuis un cours ou document",
    buildQuizDesc: "Collez vos notes pédagogiques ou déposez un fichier PDF ci-dessous.",
    step1: "ÉTAPE 01 / 03",
    whatTeaching: "Quel est le sujet du cours ?",
    topicPlaceholder: "ex: La photosynthèse chez les plantes",
    questionCount: "Nombre de questions",
    questionsLabel: "questions",
    whoIsFor: "À qui s'adresse ce quiz ?",
    whoIsForDesc: "Précisez le niveau et la matière pour calibrer le vocabulaire et la complexité des questions.",
    yourLesson: "Contenu de la leçon",
    lessonHint: "Un paragraphe, des notes de synthèse ou un document déposé",
    lessonPlaceholder: "Collez votre cours, vos notes ou les notions fondamentales à retenir…",
    useSampleLesson: "Utiliser un exemple",
    dropDocument: "Glissez un fichier PDF ou document ici, ou cliquez pour parcourir",
    dropDocumentSub: "Compatible PDF, TXT, DOCX, MD · Extraction et analyse instantanées",
    analyzingDoc: "Analyse du document par l'IA...",
    orTrySampleDocs: "Ou essayez un document modèle :",
    generateQuizBtn: "Générer le quiz avec l'IA",
    simplifyDifficultiesBtn: "Résumer & Simplifier les difficultés",
    sampleQuizBtn: "Explorer un exemple",
    aiTeacherNote: "Votre cours reste le vôtre. L'IA propose une ébauche ; vous validez chaque question avant diffusion aux élèves.",
    simplifierTitle: "Résumé & Simplification des difficultés (Make it Simple)",
    simplifierSubtitle: "Les leçons longues et denses rendues limpides et accessibles.",
    tldrLabel: "L'essentiel en 30 secondes",
    keyPointsTitle: "Points clés en un coup d'œil",
    difficultiesTitle: "Notions difficiles démystifiées & Analogies",
    whyHardLabel: "Pourquoi c'est difficile :",
    simplifiedLabel: "Explication simplifiée :",
    analogyLabel: "Analogie du quotidien :",
    vocabTitle: "Vocabulaire académique décodé",
    quickCheckTitle: "Question flash d'auto-évaluation",
    turnIntoQuiz: "Transformer en quiz interactif",
    copySummary: "Copier la fiche simplifiée",
    copiedToast: "Fiche simplifiée copiée dans le presse-papiers !",
    classroomTitle: "VOTRE CLASSE",
    sharedWithStudents: "Partagés avec vos élèves",
    sharedPrivate: "Chaque quiz est sécurisé et privé dans votre espace enseignant.",
    classCode: "CODE CLASSE",
    editQuiz: "Modifier le quiz",
    finishDraft: "Terminer le brouillon",
    studentPortal: "VOTRE PORTAIL ÉLÈVE PERSONNEL",
    readyWhenYouAre: "Prêt quand vous l'êtes.",
    studentSubtitle: "Vos quiz et révisions réunis ici. Entrez le code de votre enseignant ou simplifiez un cours difficile.",
    gotClassCode: "Vous avez un code classe ?",
    gotClassCodeDesc: "Votre enseignant attribue un code privé à chaque quiz. Entrez-le pour l'ajouter à vos révisions.",
    joinQuizBtn: "Rejoindre mon quiz",
    privateFamilyLink: "Votre code familial privé",
    privateFamilyDesc: "Partagez ce code avec un parent pour qu'il puisse célébrer vos réussites en toute bienveillance.",
    copyCode: "Copier le code",
    learningProfile: "VOTRE PROFIL D'ÉTUDES",
    makeProfileFit: "Personnalisez votre espace d'apprentissage",
    profileDesc: "Sélectionnez votre cycle, votre année et votre filière. Modifiable à tout moment.",
    saveProfile: "Enregistrer mon profil",
    yourLearningAllInOne: "Vos révisions au même endroit",
    quizzesJoined: "Les quiz que vous avez rejoints et vos résultats.",
    startQuizBtn: "Commencer le quiz",
    reviewAnswersBtn: "Revoir mes réponses",
    readyBadge: "PRÊT",
    matchesProfile: "ADAPTÉ À VOTRE PROFIL",
    classQuiz: "QUIZ DE CLASSE",
    myQuizzes: "Mes quiz",
    finishAndScore: "Terminer et voir mon score",
    tryAgain: "Recommencer",
    yourScore: "VOTRE SCORE",
    familyOverview: "Un regard serein sur le parcours scolaire",
    familySubtitle: "Découvrez les notions maîtrisées par votre enfant et les pistes de discussion à explorer à la maison.",
    connectChildTitle: "Connecter un compte élève",
    connectChildDesc: "Saisissez le code familial confidentiel généré sur le portail de votre enfant.",
    connectFamilyBtn: "Associer mon enfant",
    studyAssistantTitle: "Assistant IA de simplification",
    studyAssistantDesc: "Un chapitre difficile à réviser ? Collez votre cours ou déposez un fichier PDF pour obtenir une explication pas à pas.",
    cancel: "Annuler",
    save: "Enregistrer",
    loading: "Chargement en cours...",
    protoBadge: "Prototype"
  }
};

function t(key) {
  const lang = state.lang || "en";
  return i18n[lang]?.[key] || i18n.en[key] || key;
}

/* ================================================================
   SAMPLE CURRICULUM DOCUMENTS (PDF DEMOS)
   ================================================================ */
const sampleDocuments = [
  {
    id: "algeria_physics",
    name: "Physique_3AS_Circuits_Electriques.pdf",
    label: "⚡ Physique 3AS - Circuits & Loi d'Ohm",
    topic: "Les circuits électriques et la loi d'Ohm",
    stage: "secondary",
    year: 3,
    subject: "Physique",
    text: `Dans le programme de physique de troisième année secondaire, l'étude des circuits électriques repose sur la compréhension du courant électrique et de la tension.
Un circuit électrique comprend un générateur de tension, des conducteurs ohmiques de résistance R, et un interrupteur.
La loi d'Ohm stipule que la tension U aux bornes d'un dipôle ohmique est directement proportionnelle à l'intensité I qui le traverse : U = R × I.
Dans un montage en série, l'intensité est la même en tout point du circuit, tandis que les tensions s'additionnent (loi d'additivité des tensions).
Dans un montage en dérivation (parallèle), la tension est identique aux bornes de chaque branche, et l'intensité totale délivrée par le générateur est égale à la somme des intensités des branches (loi des nœuds).
La puissance électrique dissipée par effet Joule est donnée par P = R × I² = U × I.
Le courant continu (DC) circule dans un seul sens, alors que le courant alternatif (AC) change de sens périodiquement sous une forme sinusoïdale.`
  },
  {
    id: "arabic_bio",
    name: "علوم_الطبيعة_التركيب_الضوئي_4م.pdf",
    label: "🌿 علوم 4 متوسط - التركيب الضوئي والخلية",
    topic: "عملية التركيب الضوئي في النباتات الخضراء",
    stage: "middle",
    year: 4,
    subject: "علوم الطبيعة والحياة",
    text: `تعتبر عملية التركيب الضوئي الظاهرة البيولوجية الأساسية التي تضمن استمرار الحياة على كوكب الأرض، حيث تقوم النباتات الخضراء بصنع مادتها العضوية ذاتياً.
تتم هذه العملية داخل الصانعات الخضراء (الكلوروبلاست) الموجودة في خلايا الأوراق، والتي تحتوي على صبغة اليخضور (الكلوروفيل).
يمتص اليخضور الطاقة الضوئية من الشمس، وتقوم الجذور بامتصاص الماء والأملاح المعدنية من التربة (النسغ الناقص)، وتدخل جزيئات غاز ثنائي أكسيد الكربون (CO2) عبر فتحات مجهرية على سطح الورقة تسمى الثغور.
باستخدام هذه العناصر، ينتج النبات السكريات البسيطة (الغلوكوز) ويخزن الفائض منها على شكل نشاء، ويحرر غاز الأكسجين (O2) الضروري لتنفس الكائنات الحية.
معادلة التركيب الضوئي الإجمالية: 6CO2 + 6H2O + طاقة ضوئية -> C6H12O6 + 6O2.`
  },
  {
    id: "history_civ",
    name: "History_Primary5_Ancient_Civilizations.pdf",
    label: "🏛️ History Year 5 - Ancient Civilizations",
    topic: "Ancient Civilizations and the Mediterranean",
    stage: "primary",
    year: 5,
    subject: "History",
    text: `Early human civilizations developed along great river valleys and coastal regions where fertile land and freshwater made agriculture possible.
In North Africa and the Mediterranean basin, the Nile River nurtured ancient Egypt, while coastal settlements like Carthage and Tipasa became thriving trade hubs.
Writing was one of humanity's greatest milestones: the Phoenicians developed an alphabet that simplified trading records and communication, which influenced many modern alphabets.
Trade routes connected distant regions, exchanging goods like olive oil, wheat, ceramics, and textiles, as well as architectural ideas and scientific discoveries.
Understanding our shared Mediterranean heritage shows how diverse cultures interacted, learned from one another, and contributed to our world today.`
  }
];

const sampleLesson = `Plants make their own food through photosynthesis. This process happens mainly in the leaves, where chlorophyll captures energy from sunlight. The roots absorb water and minerals from the soil, while tiny openings called stomata let carbon dioxide enter the leaf. Using sunlight, water, and carbon dioxide, a plant produces glucose and releases oxygen. The glucose provides energy for growth, and the oxygen enters the air.`;
const sampleQuiz = {
  topic: "How plants make food",
  education: { stage: "primary", year: 4, subject: "Science", specialty: "" },
  difficulty: "Balanced",
  lesson: sampleLesson,
  questions: [
    {
      prompt: "What is the name of the process plants use to make their own food?",
      options: ["Pollination", "Photosynthesis", "Germination", "Respiration"],
      answerIndex: 1,
      topic: "Photosynthesis",
      explanation: "Photosynthesis is the process plants use to turn sunlight, water, and carbon dioxide into food."
    },
    {
      prompt: "What captures energy from sunlight in a plant's leaves?",
      options: ["Chlorophyll", "Stomata", "Minerals", "Glucose"],
      answerIndex: 0,
      topic: "Parts of a plant",
      explanation: "Chlorophyll, the green pigment in leaves, captures energy from sunlight."
    },
    {
      prompt: "Which gas do plants release into the air during photosynthesis?",
      options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Water vapour"],
      answerIndex: 2,
      topic: "Photosynthesis",
      explanation: "Plants release oxygen as a product of photosynthesis."
    }
  ]
};

const icon = {
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h7M8 10h9"/></svg>',
  timer: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 1.5M9 2h6M18 5l1.5-1.5"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  trend: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></svg>',
  people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></svg>',
  teacher: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 8 12 13l9.5-5L12 3Z"/><path d="M6 10v5c3.7 3 8.3 3 12 0v-5M21.5 8v7"/></svg>',
  student: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0M5 5l7-3 7 3"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 14A8.5 8.5 0 0 1 10 3.2 8.6 8.6 0 1 0 20.8 14Z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>'
};

function validQuiz(quiz) {
  return Boolean(quiz && typeof quiz === "object" && typeof quiz.topic === "string" &&
    Array.isArray(quiz.questions) && quiz.questions.length > 0 &&
    quiz.questions.every((question) => question && typeof question.prompt === "string" &&
      Array.isArray(question.options) && question.options.length === 4 &&
      Number.isInteger(question.answerIndex) && question.answerIndex >= 0 && question.answerIndex < 4));
}

async function saveStudentProfile(form) {
  try {
    const session = readSupabaseSession();
    if (!session?.access_token) throw new Error("Your sign-in needs a refresh. Please sign in again.");
    const response = await requestJson("/api/profile", {
      method: "PUT",
      headers: { Authorization: "Bearer " + session.access_token },
      body: JSON.stringify({ education: educationFromForm(form) })
    });
    state.session = response.user;
    render();
    showToast("Your learning profile is saved and ready to personalize your space.", "success");
  } catch (error) {
    console.error("Student learning profile could not be saved.", error);
    showToast(error.message, "error");
  }
}

const state = {
  session: null,
  view: "teacher",
  topic: "",
  lesson: "",
  quiz: null,
  quizId: null,
  quizzes: [],
  students: [],
  answers: [],
  result: null,
  authRole: "teacher",
  authMode: "",
  theme: "light",
  lang: "en",
  pendingEmail: "",
  teacherTab: "quiz",
  simplification: null,
  isSimplifying: false,
  uploadedDocName: "",
  isAnalyzingDoc: false
};

function persist() {
  try {
    localStorage.setItem(`${STORAGE_KEY}:theme`, state.theme);
    localStorage.setItem(`${STORAGE_KEY}:lang`, state.lang);
  } catch (error) {
    console.error("Could not save settings preference.", error);
  }
}

function setLanguage(lang) {
  if (!["en", "ar", "fr"].includes(lang)) return;
  state.lang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  persist();
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
  const caption = document.getElementById("welcome-nav-caption");
  if (caption) caption.textContent = t("brandCaption");
  const loginLabel = document.querySelector(".welcome-login-label");
  if (loginLabel) loginLabel.textContent = t("signIn");
  const signoutLabel = document.getElementById("signout-label");
  if (signoutLabel) signoutLabel.textContent = t("signOut");
  const siteFooterText = document.getElementById("site-footer-text");
  if (siteFooterText) siteFooterText.innerHTML = t("siteFooterText");
  const sidebarNote = document.getElementById("sidebar-note-text");
  if (sidebarNote) sidebarNote.innerHTML = t("sidebarNote");
  render();
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

const studyStages = [
  { id: "primary", label: "Primary · الابتدائي", years: 5 },
  { id: "middle", label: "Middle · المتوسط", years: 4 },
  { id: "secondary", label: "Secondary · الثانوي", years: 3 },
  { id: "university", label: "University · الجامعي", years: 8 }
];

function educationFields(profile = {}, includeSpecialty = true) {
  const stage = studyStages.some((item) => item.id === profile.stage) ? profile.stage : "primary";
  const maxYear = studyStages.find((item) => item.id === stage).years;
  const year = Math.min(Math.max(Number(profile.year) || 1, 1), maxYear);
  return `<div class="study-fields">
    <label class="field-group"><span class="field-label">${state.lang === "ar" ? "الطور التعليمي" : state.lang === "fr" ? "Cycle d'études" : "Education stage"}</span>
      <select class="select-input" name="education-stage" data-education-stage required>${studyStages.map((item) => `<option value="${item.id}" ${stage === item.id ? "selected" : ""}>${item.label}</option>`).join("")}</select>
    </label>
    <label class="field-group"><span class="field-label">${state.lang === "ar" ? "السنة الدراسية" : state.lang === "fr" ? "Année d'études" : "Year"}</span>
      <select class="select-input" name="education-year" data-education-year required>${Array.from({ length: maxYear }, (_, index) => index + 1).map((value) => `<option value="${value}" ${year === value ? "selected" : ""}>Year ${value} · السنة ${value}</option>`).join("")}</select>
    </label>
    <label class="field-group"><span class="field-label">${state.lang === "ar" ? "المادة / المقياس" : state.lang === "fr" ? "Matière / Module" : "Subjects / modules"} <span class="field-hint">${state.lang === "ar" ? "افصل بفاصلة" : "comma-separated"}</span></span>
      <input class="text-input" type="text" name="education-subject" maxlength="80" placeholder="e.g. Science, Biology" value="${escapeHTML(profile.subject || "")}" required />
    </label>
    ${includeSpecialty ? `<label class="field-group"><span class="field-label">${state.lang === "ar" ? "الشعبة / التخصص" : state.lang === "fr" ? "Filière / Spécialité" : "Branch / specialty"} <span class="field-hint">${state.lang === "ar" ? "اختياري" : "optional"}</span></span>
      <input class="text-input" type="text" name="education-specialty" maxlength="100" placeholder="e.g. Sciences Expérimentales" value="${escapeHTML(profile.specialty || "")}" />
    </label>` : ""}
  </div>`;
}

function educationFromForm(form) {
  const elements = form.elements;
  return {
    stage: elements["education-stage"]?.value || "primary",
    year: Number(elements["education-year"]?.value) || 1,
    subject: elements["education-subject"]?.value.trim() || "",
    specialty: elements["education-specialty"]?.value.trim() || ""
  };
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  toastRegion.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 4000);
}

function words(count) {
  if (state.lang === "ar") return "سؤال";
  if (state.lang === "fr") return count === 1 ? "question" : "questions";
  return count === 1 ? "question" : "questions";
}

const roles = {
  teacher: {
    get name() { return t("teacherName"); },
    get portal() { return t("teacherStudio"); },
    get headline() { return t("teacherHeadline"); },
    description: "Paste a lesson or upload a PDF to create an age-appropriate quiz and simplified study guide in seconds.",
    get benefit() { return t("teacherBenefit"); },
    icon: icon.teacher
  },
  student: {
    get name() { return t("studentName"); },
    get portal() { return state.lang === "ar" ? "مساحتي التعليمية" : state.lang === "fr" ? "Mes révisions" : "My learning"; },
    get headline() { return t("studentHeadline"); },
    description: "Take quizzes with immediate explanations and simplify confusing chapters into easy steps.",
    get benefit() { return t("studentBenefit"); },
    icon: icon.student
  },
  parent: {
    get name() { return t("parentName"); },
    get portal() { return state.lang === "ar" ? "رؤية الأسرة" : state.lang === "fr" ? "Vue famille" : "Family view"; },
    get headline() { return t("parentHeadline"); },
    description: "Get a clear, reassuring summary of topics your child has mastered without the stress of letter grades.",
    get benefit() { return t("parentBenefit"); },
    icon: icon.people
  }
};

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const dark = state.theme === "dark";
  document.querySelectorAll('[data-action="toggle-theme"]').forEach((button) => {
    button.innerHTML = `${dark ? icon.sun : icon.moon}<span>${dark ? (state.lang === "ar" ? "الوضع الفاتح" : "Light") : (state.lang === "ar" ? "الوضع الداكن" : "Dark")}</span>`;
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  });
}

function roleCards() {
  return ["teacher", "student", "parent"].map((role, index) => {
    const detail = roles[role];
    return `
    <article class="role-card role-card-${role}" data-role-entry="${role}" tabindex="0" role="group" aria-label="${detail.name} portal options" style="--card-index:${index}">
      <div class="role-card-top"><span class="role-icon">${detail.icon}</span><span class="role-number">0${index + 1}</span></div>
      <h2>${detail.headline}</h2>
      <p>${detail.description}</p>
      <div class="role-card-bottom"><span>${detail.benefit}</span><div class="role-card-actions"><button type="button" class="role-signin" data-auth-role="${role}" data-auth-mode="login">${t("signIn")}</button><button type="button" class="role-arrow" data-auth-role="${role}" data-auth-mode="register" aria-label="Create a ${detail.name.toLowerCase()} account">↗</button></div></div>
    </article>`;
  }).join("");
}

function renderWelcome() {
  const role = state.authRole;
  const mode = state.authMode;
  const detail = roles[role];
  const isAuth = mode === "register" || mode === "login" || mode === "verify";
  welcomeShell.hidden = false;
  appShell.hidden = true;
  if (!isAuth) {
    welcomeContent.innerHTML = `
      <section class="welcome-hero">
        <div class="welcome-copy">
          <p class="welcome-eyebrow"><span></span> ${t("welcomeEyebrow")}</p>
          <h1>${t("welcomeHeroTitle")}</h1>
          <p class="welcome-description">${t("welcomeHeroDesc")}</p>
          <div class="welcome-actions"><button class="welcome-primary" type="button" data-action="explore-portals">${t("findYourPlace")} ${icon.arrow}</button><span class="welcome-note">${icon.check} ${t("welcomeNote")}</span></div>
          <div class="welcome-proof"><div class="proof-avatars"><span>T</span><span>S</span><span>F</span></div><span>${t("welcomeProof")}</span></div>
        </div>
        <aside class="welcome-art" aria-label="Elmanar learning community">
          <span class="art-orbit art-orbit-one"></span><span class="art-orbit art-orbit-two"></span>
          <div class="logo-stage"><img src="/elmanar-logo.jpg" alt="Elmanar logo" /></div>
          <div class="art-note art-note-top"><span>✳</span><div><strong>${state.lang === "ar" ? "مستقبل أكثر إشراقاً" : state.lang === "fr" ? "Un avenir radieux" : "A brighter future"}</strong><small>${state.lang === "ar" ? "يبدأ من درس واحد" : state.lang === "fr" ? "commence par une leçon" : "starts with one lesson"}</small></div></div>
          <div class="art-note art-note-bottom"><span class="art-live-dot"></span><div><strong>${state.lang === "ar" ? "نكبر معاً" : state.lang === "fr" ? "Grandir ensemble" : "Growing together"}</strong><small>${state.lang === "ar" ? "المعلم · التلميذ · الأسرة" : state.lang === "fr" ? "Prof · Élève · Famille" : "Teacher · Student · Family"}</small></div></div>
          <span class="art-star art-star-one">✳</span><span class="art-star art-star-two">✳</span>
        </aside>
      </section>
      <section class="portal-section" id="portals">
        <header class="portal-section-heading"><div><p class="welcome-eyebrow"><span></span> ${t("portalsEyebrow")}</p><h2>${t("portalsHeading")}</h2></div><p>${t("portalsDesc")}</p></header>
        <div class="role-grid">${roleCards()}</div>
        <div class="welcome-bottom-note"><span>✳</span> ${t("bottomNote")}</div>
      </section>`;
    return;
  }
  welcomeContent.innerHTML = `
    <section class="auth-layout">
      <div class="auth-welcome-panel">
        <button class="auth-back" type="button" data-action="back-home">← ${t("backHome")}</button>
        <div class="auth-welcome-copy"><span class="auth-role-symbol">${detail.icon}</span><p class="welcome-eyebrow"><span></span> ${escapeHTML(detail.name.toUpperCase())}</p>
        <h1>${role === "teacher" ? (state.lang === "ar" ? "التعليم المتقن يفتح آفاق المستقبل." : "Good lessons open up a world of possibility.") : role === "student" ? (state.lang === "ar" ? "النجاح يبدأ بخطوتك الأولى." : "The next big thing starts with you.") : (state.lang === "ar" ? "رافق أبناءك في كل لحظة فهم." : "Be there for every little lightbulb.")}</h1>
        <p>${detail.description}</p></div>
        <div class="auth-brand-note"><img src="/elmanar-logo.jpg" alt="" /><span>${t("brandCaption")}</span></div>
      </div>
      <section class="auth-form-panel">
        <div class="auth-form-heading"><p class="welcome-eyebrow"><span></span> ${escapeHTML(detail.name.toUpperCase())}</p>
          <h2>${mode === "login" ? (state.lang === "ar" ? "مرحباً بعودتك." : "Welcome back.") : (state.lang === "ar" ? "لنبدأ رحلتك التعليمية." : "Let’s make this yours.")}</h2>
          <p>${mode === "login" ? (state.lang === "ar" ? "سجل الدخول للمتابعة من حيث توقفت." : "Sign in to pick up where you left off.") : (state.lang === "ar" ? "أنشئ مساحتك الخاصة في لحظات." : "Create your personal space.")}</p>
        </div>
        <div class="auth-mode-switch"><button type="button" data-auth-role="${role}" data-auth-mode="register" class="${mode === "register" ? "is-active" : ""}">${t("createAccount")}</button><button type="button" data-auth-role="${role}" data-auth-mode="login" class="${mode === "login" ? "is-active" : ""}">${t("signIn")}</button></div>
        <form class="auth-form" id="auth-form" data-role="${role}" data-mode="${mode}">
          ${mode === "register" ? `<label class="field-group"><span class="field-label">${state.lang === "ar" ? "اسمك الكامل" : "Your name"}</span><input class="text-input" type="text" name="name" minlength="2" maxlength="70" autocomplete="name" placeholder="e.g. Samira Hassan" required /></label>` : ""}
          ${role === "student" && mode === "register" ? `<fieldset class="auth-study-fields"><legend>${t("learningProfile")}</legend><p>${t("profileDesc")}</p>${educationFields({}, false)}</fieldset>` : ""}
          <label class="field-group"><span class="field-label">${state.lang === "ar" ? "البريد الإلكتروني" : "Email address"}</span><input class="text-input" type="email" name="email" maxlength="254" autocomplete="email" placeholder="you@example.com" required /></label>
          <label class="field-group"><span class="field-label">${state.lang === "ar" ? "كلمة المرور" : "Password"}</span><input class="text-input" type="password" name="password" minlength="10" maxlength="128" autocomplete="${mode === "login" ? "current-password" : "new-password"}" placeholder="${mode === "login" ? "••••••••••" : "At least 10 characters"}" required /></label>
          <button class="welcome-primary auth-submit" type="submit">${mode === "login" ? t("signIn") : t("createAccount")} ${icon.arrow}</button>
          <button class="google-prototype" type="button" data-action="google-prototype"><span class="google-mark" aria-hidden="true">G</span>Continue with Google <span class="prototype-badge">${t("protoBadge")}</span></button>
        </form>
      </section>
    </section>`;
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
  return payload;
}

function readSupabaseSession() {
  try {
    const raw = localStorage.getItem(SUPABASE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSupabaseSession(session) {
  try {
    if (session) localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(SUPABASE_STORAGE_KEY);
  } catch (err) { console.error("Could not write Supabase session.", err); }
}

function clearSupabaseSession() {
  saveSupabaseSession(null);
}

let refreshTimer = null;
function scheduleSupabaseRefresh(session) {
  if (refreshTimer) clearTimeout(refreshTimer);
  if (!session?.expires_at || !session?.refresh_token) return;
  const refreshInMs = Math.max(session.expires_at * 1000 - Date.now() - 60000, 5000);
  refreshTimer = setTimeout(() => { void refreshSupabaseSession(); }, refreshInMs);
}

async function refreshSupabaseSession() {
  const current = readSupabaseSession();
  if (!current?.refresh_token) return null;
  try {
    const updated = await requestJson("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: current.refresh_token })
    });
    saveSupabaseSession(updated);
    scheduleSupabaseRefresh(updated);
    return updated;
  } catch (err) {
    console.error("Refresh failed:", err);
    clearSupabaseSession();
    return null;
  }
}

async function restoreSupabaseSession() {
  const session = readSupabaseSession();
  if (!session?.access_token) return null;
  try {
    const response = await requestJson("/api/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    scheduleSupabaseRefresh(session);
    return response;
  } catch (err) {
    if (session.refresh_token) {
      const refreshed = await refreshSupabaseSession();
      if (refreshed?.access_token) {
        return requestJson("/api/session", {
          method: "POST",
          headers: { Authorization: `Bearer ${refreshed.access_token}` }
        });
      }
    }
    clearSupabaseSession();
    return null;
  }
}

async function refreshPortalData() {
  if (!state.session) return;
  try {
    const payload = await requestJson("/api/data");
    state.quizzes = payload.quizzes || [];
    state.students = payload.students || [];
  } catch (err) {
    console.error("Could not load portal data.", err);
  }
}

function setTheme(theme) {
  state.theme = theme;
  persist();
  applyTheme();
}

function updateChrome() {
  const role = state.session?.role;
  const detail = roles[role];
  if (!detail) return;
  state.view = role;
  breadcrumb.textContent = detail.portal;
  navContainer.innerHTML = `<button class="nav-link is-active" type="button" data-view="${role}">
    ${detail.icon}<span>${role === "teacher" ? t("teacherStudio") : role === "student" ? (state.lang === "ar" ? "مساحتي الدراسية" : "My learning") : (state.lang === "ar" ? "رؤية الأسرة" : "Family view")}</span>
    ${role === "student" ? `<span class="nav-pill">${state.quizzes.length}</span>` : ""}
  </button>`;
  const initials = state.session.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  document.getElementById("profile-avatar").textContent = initials;
  document.getElementById("topbar-avatar").textContent = initials;
  document.getElementById("profile-name").textContent = state.session.name;
  document.getElementById("profile-role").textContent = detail.name;
  document.getElementById("school-switcher").querySelector(".school-label strong").textContent = state.session.name;
  document.getElementById("school-switcher").querySelector(".school-label small").textContent = `${detail.name} account`;
  document.getElementById("school-switcher").querySelector(".school-avatar").textContent = initials[0];
  document.getElementById("nav-caption").textContent = `${detail.name.toUpperCase()} PORTAL`;
  statusBadge.hidden = role !== "teacher";
}

function setView(view) {
  if (!state.session || view !== state.session.role) return;
  state.view = view;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ================================================================
   DOCUMENT & PDF PARSING LOGIC
   ================================================================ */
async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || "");
      reader.onerror = reject;
      reader.readAsText(file, "UTF-8");
    });
  }

  if (name.endsWith(".pdf")) {
    try {
      const buffer = await file.arrayBuffer();
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        let text = "";
        const maxPages = Math.min(pdf.numPages, 30);
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const tokenized = await page.getTextContent();
          text += tokenized.items.map((it) => it.str).join(" ") + "\n\n";
        }
        if (text.trim().length > 20) return text.trim();
      }
      // Binary scan fallback for PDF streams
      const bytes = new Uint8Array(buffer);
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const raw = decoder.decode(bytes);
      const matches = raw.match(/stream[\r\n]+([\s\S]*?)endstream/g) || [];
      let gathered = "";
      for (const m of matches) {
        const tjs = m.match(/\(([^()]+)\)\s*Tj/g) || [];
        for (const tj of tjs) {
          gathered += tj.replace(/^\(|\)\s*Tj$/g, "") + " ";
        }
      }
      if (gathered.trim().length > 30) return gathered.trim();
    } catch (err) {
      console.warn("PDF extraction notice:", err);
    }
    return `[Document: ${file.name}] Comprehensive educational notes and curriculum lesson content uploaded for analysis.`;
  }

  // Fallback for docx/other text files
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = String(e.target.result || "");
      const clean = res.replace(/[^A-Za-z0-9\u0600-\u06FF\s.,;:!?'"()-]/g, " ").replace(/\s{2,}/g, " ");
      resolve(clean.slice(0, 8000));
    };
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

async function handleDocumentUpload(file) {
  if (!file) return;
  state.isAnalyzingDoc = true;
  state.uploadedDocName = file.name;
  showToast(t("analyzingDoc"), "info");
  render();

  try {
    const text = await extractTextFromFile(file);
    const result = await requestJson("/api/analyze-document", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        text: text.slice(0, 16000),
        language: state.lang,
        education: state.quiz?.education || (state.session?.role === "student" ? state.session?.education : { stage: "middle", year: 4, subject: "Sciences" })
      })
    });

    const doc = result.document;
    if (doc) {
      state.topic = doc.topic || file.name.replace(/\.[^/.]+$/, "");
      state.lesson = doc.cleanLesson || text.slice(0, 4000);
      showToast(`📄 ${file.name} analyzed! ${doc.summary || ""}`, "success");
    }
  } catch (err) {
    console.error("Document analysis error:", err);
    state.topic = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
    showToast(`Loaded ${file.name}. Ready to build quiz or simplify.`, "info");
  } finally {
    state.isAnalyzingDoc = false;
    render();
  }
}

function loadSampleDocument(docId) {
  const sample = sampleDocuments.find((d) => d.id === docId);
  if (!sample) return;
  state.uploadedDocName = sample.name;
  state.topic = sample.topic;
  state.lesson = sample.text;
  if (!state.quiz) state.quiz = {};
  state.quiz.education = { stage: sample.stage, year: sample.year, subject: sample.subject, specialty: "" };
  showToast(`Loaded "${sample.name}"!`, "success");
  render();
}

async function simplifyCurrentLesson() {
  const topic = (app.querySelector('[name="topic"]')?.value || state.topic || "Lesson Summary").trim();
  const lesson = (app.querySelector('[name="lesson"]')?.value || state.lesson || "").trim();

  if (!lesson || lesson.length < 20) {
    showToast("Please provide or paste lesson notes (at least 20 characters) to simplify.", "error");
    return;
  }

  state.topic = topic;
  state.lesson = lesson;
  state.isSimplifying = true;
  render();
  showToast(state.lang === "ar" ? "جاري تلخيص وتبسيط الصعوبات بالذكاء الاصطناعي..." : "Simplifying difficulties with AI...", "info");

  try {
    const education = state.quiz?.education || (state.session?.role === "student" ? state.session?.education : { stage: "middle", year: 4, subject: "Science" });
    const response = await requestJson("/api/simplify", {
      method: "POST",
      body: JSON.stringify({
        topic,
        lesson,
        education,
        language: state.lang
      })
    });

    if (response?.simplification) {
      state.simplification = response.simplification;
      state.teacherTab = "simplifier";
      showToast(t("copiedToast").replace("presse-papiers", "cours").replace("الحافظة", "الدرس"), "success");
    }
  } catch (err) {
    console.error("Simplification error:", err);
    showToast(err.message || "Could not simplify lesson right now.", "error");
  } finally {
    state.isSimplifying = false;
    render();
    document.getElementById("simplifier-results")?.scrollIntoView({ behavior: "smooth" });
  }
}

/* ================================================================
   RENDER TEACHER STUDIO
   ================================================================ */
function renderTeacher() {
  const topic = escapeHTML(state.topic);
  const lesson = escapeHTML(state.lesson);
  const quiz = state.quiz;
  const firstName = escapeHTML(state.session.name.split(/\s+/)[0]);

  return `<section class="page-heading-row">
    <div>
      <p class="eyebrow"><span class="eyebrow-dot"></span> ${t("teacherStudio").toUpperCase()}</p>
      <h1 class="page-heading">${t("welcomeBack")}, ${firstName}.<br/><span class="heading-accent">${t("makeLearningStick")}</span></h1>
      <p class="page-subtitle">${t("teacherSubtitle")}</p>
    </div>
    <div class="hero-count"><strong>${state.quizzes.length}</strong><span>${state.quizzes.length === 1 ? t("quizCreated") : t("quizzesCreated")}</span></div>
  </section>

  <section class="workspace-grid" aria-label="Create a quiz or study guide">
    <form class="panel composer" id="lesson-form">
      <div class="panel-heading">
        <div><h2>${t("buildQuizTitle")}</h2><p>${t("buildQuizDesc")}</p></div>
        <span class="step-mark">${t("step1")}</span>
      </div>

      <!-- Document Upload Dropzone -->
      <div class="doc-dropzone" id="doc-dropzone">
        <input type="file" id="doc-file-input" accept=".pdf,.txt,.docx,.doc,.md" aria-label="Upload document or PDF" />
        <div class="doc-dropzone-inner">
          <span class="doc-dropzone-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>
          <div class="doc-dropzone-text">
            <strong>${state.isAnalyzingDoc ? t("analyzingDoc") : t("dropDocument")}</strong>
            <small>${t("dropDocumentSub")}</small>
          </div>
        </div>
      </div>
      ${state.uploadedDocName ? `
        <div class="doc-active-badge">
          <span class="doc-active-info">📄 ${escapeHTML(state.uploadedDocName)}</span>
          <button type="button" class="doc-clear-btn" data-action="clear-doc" title="Remove">✕</button>
        </div>
      ` : ""}
      <div class="doc-chips-row">
        <span class="doc-chip-label">${t("orTrySampleDocs")}</span>
        ${sampleDocuments.map((doc) => `
          <button type="button" class="doc-sample-chip" data-action="load-sample-doc" data-doc-id="${doc.id}">
            ${escapeHTML(doc.label)}
          </button>
        `).join("")}
      </div>

      <div class="field-row" style="margin-top: 16px;">
        <label class="field-group"><span class="field-label">${t("whatTeaching")}</span>
          <input class="text-input" name="topic" maxlength="120" placeholder="${t("topicPlaceholder")}" value="${topic}" required />
        </label>
        <label class="field-group"><span class="field-label">${t("questionCount")}</span>
          <select class="select-input" name="count">
            ${[3, 5, 7, 10].map((n) => `<option value="${n}" ${quiz && quiz.questions.length === n ? "selected" : n === 5 && !quiz ? "selected" : ""}>${n} ${t("questionsLabel")}</option>`).join("")}
          </select>
        </label>
      </div>

      <fieldset class="composer-study-fields">
        <legend>${t("whoIsFor")}</legend>
        <p>${t("whoIsForDesc")}</p>
        ${educationFields(quiz?.education || { stage: "middle", year: 4, subject: "Science" })}
      </fieldset>

      <label class="field-group">
        <span class="field-label">${t("yourLesson")} <span class="field-hint">${t("lessonHint")}</span></span>
        <textarea class="lesson-input" name="lesson" minlength="20" maxlength="18000" placeholder="${t("lessonPlaceholder")}" required>${lesson}</textarea>
      </label>
      <div class="lesson-toolbar"><span id="lesson-count">0 characters</span><button class="text-button" type="button" data-action="sample-lesson">${t("useSampleLesson")}</button></div>

      <div class="composer-actions">
        <button class="button-primary" type="submit" id="generate-button">${icon.spark}<span>${t("generateQuizBtn")}</span></button>
        <button class="button-secondary" type="button" data-action="simplify-lesson">💡 <span>${state.isSimplifying ? t("loading") : t("simplifyDifficultiesBtn")}</span></button>
        <button class="button-quiet" type="button" data-action="sample-quiz">${t("sampleQuizBtn")}</button>
      </div>
      <p class="ai-note">${icon.spark}<span>${t("aiTeacherNote")}</span></p>
    </form>

    <div class="side-stack">
      <section class="panel process-card">
        <p class="process-kicker">Thoughtfully designed</p>
        <h2 class="process-title">${state.lang === "ar" ? "أسئلة أعمق.<br/><span>وفهم يرسخ ويدوم.</span>" : "Better questions.<br/><span>Brighter lightbulbs.</span>"}</h2>
        <p class="process-text">${state.lang === "ar" ? "طريقة هادئة وذكية لمتابعة استيعاب التلاميذ ومساعدتهم دون عناء." : "A calm, considered way to check understanding and simplify hard topics."}</p>
        <ol class="process-steps">
          <li><span class="step-number">1</span>${state.lang === "ar" ? "شارك الدرس أو ارفع PDF" : "Share what you taught"}</li>
          <li><span class="step-number">2</span>${state.lang === "ar" ? "بسّط الصعوبات بالذكاء الاصطناعي" : "Simplify hard concepts"}</li>
          <li><span class="step-number">3</span>${state.lang === "ar" ? "اعتمد الاختبار وشاركه مع طلابك" : "Review & share quiz"}</li>
        </ol>
      </section>
      <section class="panel mini-metric-card">
        <div class="mini-metric-top"><div><p>${quiz ? "Ready for the classroom" : "Your learning space"}</p><strong>${quiz ? quiz.questions.length : "—"}</strong></div><span class="metric-icon">${icon.book}</span></div>
        <p class="mini-metric-foot">${quiz ? `${quiz.questions.length} questions in current quiz` : "A lesson in. Understanding out."}</p>
      </section>
    </div>
  </section>

  <!-- AI Simplifier Card (if active) -->
  ${state.simplification ? renderSimplifierCard(state.simplification) : ""}

  <!-- Generated Quiz Review Section -->
  ${quiz ? renderReview() : ""}

  <!-- Shared Class Quizzes Library -->
  ${state.quizzes.length ? renderTeacherQuizList() : ""}
  `;
}

function renderSimplifierCard(s) {
  return `<section class="simplifier-card" id="simplifier-results" aria-label="AI Simplifier Results">
    <div class="simplifier-header">
      <div>
        <span class="simplifier-badge">💡 ${t("simplifierTitle")} · ${s.source === "ai" ? "GPT-4.1 AI" : "Smart Prototype"}</span>
        <h2>${escapeHTML(s.topic || state.topic)}</h2>
        <p>${t("simplifierSubtitle")}</p>
      </div>
      <button class="button-secondary" type="button" data-action="copy-simplification">${icon.book} <span>${t("copySummary")}</span></button>
    </div>

    <!-- TL;DR (Make it small and simple) -->
    <div class="tldr-box">
      <div class="tldr-label">🌟 ${t("tldrLabel")}</div>
      <p class="tldr-text">${escapeHTML(s.tldr)}</p>
    </div>

    <!-- Key Points -->
    <div class="simplifier-section-title">📌 ${t("keyPointsTitle")}</div>
    <div class="keypoints-list">
      ${(s.keyPoints || []).map((pt) => `
        <div class="keypoint-item">
          <span class="keypoint-dot"></span>
          <span>${escapeHTML(pt)}</span>
        </div>
      `).join("")}
    </div>

    <!-- Difficulties Decoded with Analogies -->
    ${Array.isArray(s.difficulties) && s.difficulties.length ? `
      <div class="simplifier-section-title">🧩 ${t("difficultiesTitle")}</div>
      <div class="simplifier-grid">
        ${s.difficulties.map((d) => `
          <article class="diff-card">
            <div class="diff-concept"><span class="diff-concept-icon">!</span><strong>${escapeHTML(d.concept)}</strong></div>
            ${d.whyHard ? `<p class="diff-why-hard"><strong>${t("whyHardLabel")}</strong> ${escapeHTML(d.whyHard)}</p>` : ""}
            <p class="diff-simplified"><strong>${t("simplifiedLabel")}</strong> ${escapeHTML(d.simplified)}</p>
            ${d.analogy ? `<div class="diff-analogy"><strong>💡 ${t("analogyLabel")}</strong> ${escapeHTML(d.analogy)}</div>` : ""}
          </article>
        `).join("")}
      </div>
    ` : ""}

    <!-- Academic Vocabulary Decoded -->
    ${Array.isArray(s.vocabulary) && s.vocabulary.length ? `
      <div class="simplifier-section-title">📖 ${t("vocabTitle")}</div>
      <div class="vocab-list">
        ${s.vocabulary.map((v) => `
          <div class="vocab-card">
            <strong>${escapeHTML(v.term)}</strong>
            <p>${escapeHTML(v.meaning || v.simpleMeaning)}</p>
          </div>
        `).join("")}
      </div>
    ` : ""}

    <!-- Quick Concept Check -->
    ${s.quickCheck ? `
      <div class="quick-check-box">
        <h4>❓ ${t("quickCheckTitle")}: ${escapeHTML(s.quickCheck.question)}</h4>
        <p><strong>✓ ${escapeHTML(s.quickCheck.answer)}</strong></p>
        ${s.quickCheck.tip ? `<span class="quick-check-tip">💡 <em>Tip: ${escapeHTML(s.quickCheck.tip)}</em></span>` : ""}
      </div>
    ` : ""}

    <div class="simplifier-actions">
      <button class="button-primary" type="button" data-action="convert-simplifier-to-quiz">${icon.spark} <span>${t("turnIntoQuiz")}</span></button>
      <button class="button-secondary" type="button" data-action="copy-simplification">${t("copySummary")}</button>
    </div>
  </section>`;
}

function renderTeacherQuizList() {
  return `<section class="teacher-library">
    <div class="review-header"><div><p class="section-label">${t("classroomTitle")}</p><h2>${t("sharedWithStudents")}</h2><p>${t("sharedPrivate")}</p></div><span class="classroom-count">${state.quizzes.length} ${words(state.quizzes.length)}</span></div>
    <div class="teacher-quiz-list">${state.quizzes.map((quiz) => `<article class="panel teacher-quiz-item">
      <span class="teacher-quiz-icon">${icon.book}</span>
      <div class="teacher-quiz-title"><strong>${escapeHTML(quiz.topic)}</strong><small>${quiz.count} ${words(quiz.count)} · ${quiz.approved ? "Published to class" : "Draft — not shared"}</small>
        ${quiz.education ? `<small>${escapeHTML(quiz.education.subject)} · ${escapeHTML(quiz.education.stageLabel)} ${quiz.education.year}</small>` : ""}
        ${quiz.approved ? `<small class="class-progress">${quiz.studentCount} joined · ${quiz.completedCount} completed${quiz.averagePercent !== null ? ` · ${quiz.averagePercent}% class average` : ""}${quiz.focusTopic ? ` · Revisit: ${escapeHTML(quiz.focusTopic.topic)}` : ""}</small>` : ""}
      </div>
      ${quiz.approved ? `<div class="class-code-inline"><span>${t("classCode")}</span><strong>${escapeHTML(quiz.code)}</strong></div>` : ""}
      <button class="button-secondary" type="button" data-action="load-draft" data-quiz-id="${quiz.id}">${quiz.approved ? t("editQuiz") : t("finishDraft")}</button>
    </article>`).join("")}</div>
  </section>`;
}

function renderReview() {
  const quiz = state.quiz;
  return `<section class="review-section" id="review-section">
    <div class="review-header">
      <div><p class="section-label">STEP 02 / 03 · REVIEW</p><h2>Review and polish your quiz</h2><p>Check every prompt, answer, and explanation before publishing.</p></div>
      <span class="${state.approved ? "approved-badge" : "draft-badge"}">${state.approved ? "Approved for class" : "Draft — needs your sign-off"}</span>
    </div>
    <div class="field-group" style="margin-bottom: 16px;">
      <label class="field-label">Quiz topic</label>
      <input class="text-input" name="quiz-topic" maxlength="120" value="${escapeHTML(quizTopic())}" />
    </div>
    <div class="review-list">${quiz.questions.map((question, index) => renderQuestionEditor(question, index)).join("")}</div>
    <div class="panel review-footer">
      <span class="review-footer-copy">${state.approved ? `<strong>Class code: ${escapeHTML(state.shareCode || quiz.code)}</strong> · Ready for students` : "Review answers, then approve when ready."}</span>
      <div class="review-actions">
        <button class="button-quiet" type="button" data-action="add-question">+ Add question</button>
        <button class="button-primary" type="button" data-action="approve">${icon.check}<span>${state.approved ? "Publish updates" : "Approve & create code"}</span></button>
      </div>
    </div>
  </section>`;
}

function quizTopic() {
  return state.quiz?.topic || state.topic || "Untitled quiz";
}

function renderQuestionEditor(question, index) {
  return `<article class="panel question-editor" data-question="${index}">
    <div class="question-editor-head">
      <span class="question-number"><span>${index + 1}</span>Question ${index + 1}</span>
      <button class="button-danger" type="button" data-action="delete-question" data-index="${index}">Delete</button>
    </div>
    <div class="question-editor-grid">
      <label class="editor-field wide"><span class="editor-label">Question prompt</span>
        <textarea class="editor-input" data-field="prompt" data-index="${index}" rows="2">${escapeHTML(question.prompt)}</textarea>
      </label>
      ${question.options.map((option, optIdx) => `
        <div class="editor-field"><span class="editor-label">Choice ${String.fromCharCode(65 + optIdx)}</span>
          <div class="option-editor">
            <input type="radio" name="answer-${index}" data-action="set-answer" data-index="${index}" value="${optIdx}" ${question.answerIndex === optIdx ? "checked" : ""} />
            <input class="editor-input" type="text" data-field="option" data-index="${index}" data-option="${optIdx}" value="${escapeHTML(option)}" />
          </div>
        </div>
      `).join("")}
      <label class="editor-field wide"><span class="editor-label">Explanation</span>
        <textarea class="editor-input" data-field="explanation" data-index="${index}" rows="2">${escapeHTML(question.explanation)}</textarea>
      </label>
    </div>
  </article>`;
}

/* ================================================================
   RENDER STUDENT PORTAL
   ================================================================ */
function renderStudent() {
  if (!state.quiz || !state.quizId) {
    return `<section class="student-hero">
      <p class="eyebrow"><span class="eyebrow-dot"></span> ${t("studentPortal")}</p>
      <h1 class="page-heading">${t("welcomeBack")}, ${escapeHTML(state.session.name.split(/\s+/)[0])}. <span class="heading-accent">${t("readyWhenYouAre")}</span></h1>
      <p class="page-subtitle">${t("studentSubtitle")}</p>
    </section>

    <!-- Student Study Assistant & Simplifier -->
    <section class="panel composer" style="margin-bottom: 22px;">
      <div class="panel-heading">
        <div><h2>💡 ${t("studyAssistantTitle")}</h2><p>${t("studyAssistantDesc")}</p></div>
      </div>
      <div class="doc-dropzone" id="doc-dropzone">
        <input type="file" id="doc-file-input" accept=".pdf,.txt,.docx,.doc,.md" aria-label="Upload study document" />
        <div class="doc-dropzone-inner">
          <span class="doc-dropzone-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
          <div class="doc-dropzone-text">
            <strong>${state.isAnalyzingDoc ? t("analyzingDoc") : t("dropDocument")}</strong>
            <small>${t("dropDocumentSub")}</small>
          </div>
        </div>
      </div>
      ${state.uploadedDocName ? `
        <div class="doc-active-badge">
          <span class="doc-active-info">📄 ${escapeHTML(state.uploadedDocName)}</span>
          <button type="button" class="doc-clear-btn" data-action="clear-doc" title="Remove">✕</button>
        </div>
      ` : ""}
      <div class="doc-chips-row">
        <span class="doc-chip-label">${t("orTrySampleDocs")}</span>
        ${sampleDocuments.map((doc) => `
          <button type="button" class="doc-sample-chip" data-action="load-sample-doc" data-doc-id="${doc.id}">
            ${escapeHTML(doc.label)}
          </button>
        `).join("")}
      </div>
      <div class="field-group" style="margin-top: 14px;">
        <label class="field-label">${t("yourLesson")}</label>
        <textarea class="lesson-input" name="lesson" style="height: 110px;" placeholder="${t("lessonPlaceholder")}">${escapeHTML(state.lesson)}</textarea>
      </div>
      <button class="button-secondary" type="button" data-action="simplify-lesson">💡 <span>${state.isSimplifying ? t("loading") : t("simplifyDifficultiesBtn")}</span></button>
    </section>

    ${state.simplification ? renderSimplifierCard(state.simplification) : ""}

    <section class="student-home-grid">
      <article class="panel join-card"><span class="join-card-icon">${icon.book}</span><p class="section-label">${t("classroomTitle")}</p><h2>${t("gotClassCode")}</h2><p>${t("gotClassCodeDesc")}</p>
        <form id="join-form" class="join-form"><label class="visually-hidden" for="class-code">Teacher's class code</label><input id="class-code" class="text-input code-input" name="code" maxlength="8" placeholder="e.g. BLUEBIRD" autocomplete="off" required/><button class="button-primary" type="submit">${t("joinQuizBtn")} ${icon.arrow}</button></form>
      </article>
      <article class="panel student-family-card"><span class="join-card-icon">${icon.people}</span><p class="section-label">A LITTLE CLOSER TO HOME</p><h2>${t("privateFamilyLink")}</h2><p>${t("privateFamilyDesc")}</p><div class="family-code-display"><code>${escapeHTML(state.session.familyCode || "CODE UNAVAILABLE")}</code><button class="text-button" type="button" data-action="copy-family-code">${t("copyCode")}</button></div></article>
    </section>
    <section class="panel study-profile-card">
      <div class="study-profile-heading"><span class="join-card-icon">${icon.book}</span><div><p class="section-label">${t("learningProfile")}</p><h2>${t("makeProfileFit")}</h2><p>${t("profileDesc")}</p></div></div>
      <form id="student-profile-form" class="study-profile-form">${educationFields(state.session.education || {}, true)}<button class="button-secondary" type="submit">${t("saveProfile")} ${icon.check}</button></form>
    </section>
    <section class="review-section student-assignment-section">
      <div class="review-header"><div><p class="section-label">${t("classroomTitle")}</p><h2>${t("yourLearningAllInOne")}</h2><p>${t("quizzesJoined")}</p></div><span class="classroom-count">${state.quizzes.length} ${words(state.quizzes.length)}</span></div>
      ${state.quizzes.length ? `<div class="assignment-list">${state.quizzes.map((quiz) => `<article class="panel assignment-card">
        <span class="teacher-quiz-icon">${icon.book}</span><div class="teacher-quiz-title"><strong>${escapeHTML(quiz.topic)}</strong><small>${quiz.questions.length} ${words(quiz.questions.length)}${quiz.education ? ` · ${escapeHTML(quiz.education.subject)} · ${escapeHTML(quiz.education.stageLabel)} ${quiz.education.year}` : ""} · ${quiz.submitted ? `${quiz.submitted.score}/${quiz.questions.length} correct` : t("readyWhenYouAre")}</small></div>
        <span class="study-match ${quiz.recommended ? "is-recommended" : ""}">${quiz.recommended ? t("matchesProfile") : t("classQuiz")}</span>
        ${quiz.submitted ? `<span class="assignment-score">${Math.round(quiz.submitted.score / quiz.questions.length * 100)}%</span>` : `<span class="assignment-new">${t("readyBadge")}</span>`}
        <button class="button-primary" type="button" data-action="start-quiz" data-quiz-id="${quiz.id}">${quiz.submitted ? t("reviewAnswersBtn") : t("startQuizBtn")} ${icon.arrow}</button>
      </article>`).join("")}</div>` : `<div class="panel student-empty-class"><span class="empty-illustration">${icon.spark}</span><strong>Your next lightbulb moment is on its way.</strong><span>When your teacher shares a class code, your new quiz will show up right here.</span></div>`}
    </section>`;
  }

  const quiz = state.quiz;
  const answers = state.answers;
  const submitted = Boolean(state.result);
  const correctCount = submitted ? state.result.score : 0;
  const pct = submitted ? Math.round((correctCount / quiz.questions.length) * 100) : 0;

  return `<section class="student-hero">
    <button type="button" class="text-button quiz-back-button" data-action="back-to-quizzes">← ${t("myQuizzes")}</button>
    <p class="eyebrow"><span class="eyebrow-dot"></span> ${t("studentPortal")}</p>
    <h1 class="page-heading">${submitted ? (state.lang === "ar" ? "أحسنت المحاولة، " : "You showed up, ") : (state.lang === "ar" ? "جاهز لاختبار " : "Ready to see what ")}<span class="heading-accent">${submitted ? (state.lang === "ar" ? "وهذا هو الأهم." : "and that’s what matters.") : (state.lang === "ar" ? "معلوماتك؟" : "you know?")}</span></h1>
    <p class="page-subtitle">${submitted ? "Every answer helps you learn. Take a look at what clicked and the ideas worth exploring again." : "Take your time. Choose the best answer for each question — you’ll get a thoughtful explanation at the end."}</p>
    <div class="quiz-meta">
      <span class="meta-chip">${icon.book}${escapeHTML(quiz.topic)}</span>
      ${quiz.education ? `<span class="meta-chip">${escapeHTML(quiz.education.subject)} · ${escapeHTML(quiz.education.stageLabel)} ${quiz.education.year}</span>` : ""}
      <span class="meta-chip">${icon.timer}About ${Math.max(2, Math.ceil(quiz.questions.length * 0.7))} minutes</span>
      <span class="meta-chip">${quiz.questions.length} ${words(quiz.questions.length)}</span>
    </div>
  </section>
  ${submitted ? `<section class="panel result-banner" aria-label="Quiz result">
    <div class="score-ring" style="--score-angle:${pct * 3.6}deg"><div class="score-ring-inner"><strong>${pct}%</strong><span>${t("yourScore")}</span></div></div>
    <div class="result-copy"><h2>${pct >= 80 ? "Look at you go!" : pct >= 50 ? "You’re finding your way." : "Every try makes you stronger."}</h2>
    <p>You got ${correctCount} out of ${quiz.questions.length} ${words(quiz.questions.length)} right. Review the explanations below.</p></div>
  </section>` : ""}
  <section class="student-quiz" aria-label="${submitted ? "Answer review" : "Quiz questions"}">
    ${quiz.questions.map((question, index) => renderStudentQuestion(question, index, answers, submitted)).join("")}
  </section>
  <div class="panel quiz-action-bar">
    <span class="quiz-progress-label">${submitted ? "Your answers and explanations" : `${answers.filter((answer) => Number.isInteger(answer)).length} of ${quiz.questions.length} answered`}</span>
    ${submitted ? `<button class="button-secondary" type="button" data-action="retake">${t("tryAgain")} ${icon.arrow}</button>` : `<button class="button-primary" type="button" data-action="submit-quiz" ${Array.from({ length: quiz.questions.length }, (_, index) => Number.isInteger(answers[index])).every(Boolean) ? "" : "disabled"}>${t("finishAndScore")} ${icon.arrow}</button>`}
  </div>`;
}

function renderStudentQuestion(question, index, answers, submitted) {
  const picked = Number.isInteger(answers[index]) ? answers[index] : null;
  return `<article class="panel student-question" data-student-question="${index}">
    <div class="student-question-top"><span>QUESTION ${String(index + 1).padStart(2, "0")} OF ${String(state.quiz.questions.length).padStart(2, "0")}</span><span class="difficulty-tag">${escapeHTML(question.topic || state.quiz.topic)}</span></div>
    <h3>${escapeHTML(question.prompt)}</h3>
    <div class="answer-list">
      ${question.options.map((option, optionIndex) => {
        const correct = submitted && optionIndex === question.answerIndex;
        const wrong = submitted && picked === optionIndex && !correct;
        const selected = !submitted && picked === optionIndex;
        return `<button type="button" class="answer-option ${selected ? "is-selected" : ""} ${correct ? "is-correct" : ""} ${wrong ? "is-wrong" : ""}" data-action="answer" data-question="${index}" data-option="${optionIndex}" ${submitted ? "disabled" : ""}>
          <span class="answer-letter">${correct ? "✓" : String.fromCharCode(65 + optionIndex)}</span><span>${escapeHTML(option)}</span>
        </button>`;
      }).join("")}
    </div>
    ${submitted ? `<div class="answer-feedback"><strong>${picked === question.answerIndex ? "That’s right!" : `The best answer is ${String.fromCharCode(65 + question.answerIndex)}.`}</strong> ${escapeHTML(question.explanation || "Review this idea in your lesson and give it another try.")}</div>` : ""}
  </article>`;
}

/* ================================================================
   RENDER PARENT PORTAL
   ================================================================ */
function renderParent() {
  if (state.students.length === 0) {
    return `<section class="parent-hero">
      <p class="eyebrow"><span class="eyebrow-dot"></span> ${t("parentHeadline").toUpperCase()}</p>
      <h1 class="page-heading">${t("familyOverview")}</h1>
      <p class="page-subtitle">${t("familySubtitle")}</p>
    </section>
    <section class="panel family-connect-card">
      <div class="family-connect-copy">
        <p class="section-label">GET STARTED</p>
        <h2>${t("connectChildTitle")}</h2>
        <p>${t("connectChildDesc")}</p>
        <form id="family-connect-form" class="join-form">
          <label class="visually-hidden" for="family-code">Child's family code</label>
          <input id="family-code" class="text-input code-input" name="code" maxlength="8" placeholder="e.g. BIRD77" autocomplete="off" required />
          <button class="button-primary" type="submit">${t("connectFamilyBtn")} ${icon.arrow}</button>
        </form>
      </div>
      <div class="family-connect-art" aria-hidden="true">${icon.people}<span>✳</span></div>
    </section>`;
  }

  return `<section class="parent-hero">
    <p class="eyebrow"><span class="eyebrow-dot"></span> FAMILY LEARNING SPACE</p>
    <h1 class="page-heading">${t("familyOverview")}</h1>
    <p class="page-subtitle">${t("familySubtitle")}</p>
  </section>
  <div class="linked-students-container">${state.students.map((student) => `
    <article class="panel linked-student-card">
      <header class="linked-student-header">
        <span class="linked-student-avatar">${escapeHTML(student.name.split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2))}</span>
        <div><h2>${escapeHTML(student.name)}</h2>${student.education ? `<small>${escapeHTML(student.education.subject)} · ${escapeHTML(student.education.stageLabel)} ${student.education.year}</small>` : ""}</div>
        <span class="student-connected">Connected</span>
      </header>
      <div class="family-quiz-list">${student.quizzes.map((quiz) => renderFamilyQuiz(quiz, student.name)).join("")}</div>
    </article>
  `).join("")}</div>`;
}

function renderFamilyQuiz(quiz, studentName) {
  if (!quiz.completed) {
    return `<div class="family-quiz-row family-awaiting"><span><strong>${escapeHTML(quiz.topic)}</strong><small>Ready when your child is</small></span></div>`;
  }
  return `<section class="family-result"><header class="family-result-heading"><div><p class="section-label">RECENT LEARNING</p><h3>${escapeHTML(quiz.topic)}</h3><small>${quiz.count} questions</small></div><strong class="family-result-score">${quiz.result.score}/${quiz.count}</strong></header>
    <div class="family-next-step"><span>✳</span><p><strong>A little idea for home</strong> Celebrate this learning moment and ask them to teach you what they discovered!</p></div>
  </section>`;
}

/* ================================================================
   MAIN RENDER & ACTIONS
   ================================================================ */
function render() {
  applyTheme();
  if (!state.session) {
    renderWelcome();
    return;
  }
  welcomeShell.hidden = true;
  appShell.hidden = false;
  updateChrome();
  app.innerHTML = state.session.role === "teacher" ? renderTeacher() : state.session.role === "student" ? renderStudent() : renderParent();
  if (state.session.role === "teacher") {
    const lesson = app.querySelector('[name="lesson"]');
    if (lesson) updateLessonCount(lesson.value);
  }
}

function updateLessonCount(value) {
  const element = document.getElementById("lesson-count");
  if (element) element.textContent = `${value.length.toLocaleString()} characters`;
}

function newQuestion() {
  return { prompt: "", options: ["", "", "", ""], answerIndex: 0, topic: state.quiz?.topic || "Key idea", explanation: "" };
}

function addSampleQuiz() {
  state.quiz = JSON.parse(JSON.stringify(sampleQuiz));
  state.topic = sampleQuiz.topic;
  state.lesson = sampleLesson;
  state.approved = false;
  state.quizId = null;
  state.answers = [];
  state.result = null;
  render();
  showToast("Sample quiz loaded into review.");
  document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth" });
}

function syncFormToState(form) {
  state.topic = form.elements.topic?.value.trim() || "";
  state.lesson = form.elements.lesson?.value.trim() || "";
}

async function generateQuiz(form) {
  syncFormToState(form);
  const button = document.getElementById("generate-button");
  if (button) {
    button.disabled = true;
    button.innerHTML = `${icon.spark}<span>Generating quiz...</span>`;
  }
  showToast("Drafting quiz questions strictly grounded in your lesson...", "info");

  try {
    const response = await requestJson("/api/generate", {
      method: "POST",
      body: JSON.stringify({
        topic: state.topic,
        lesson: state.lesson,
        count: Number(form.elements.count?.value) || 5,
        education: educationFromForm(form),
        language: state.lang
      })
    });
    state.quiz = response.quiz;
    state.approved = false;
    state.quizId = null;
    state.answers = [];
    state.result = null;
    render();
    showToast("Quiz drafted! Review each question, adjust wording, and approve.", "success");
    document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("Quiz generation failed:", err);
    showToast(err.message || "Could not generate quiz right now.", "error");
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = `${icon.spark}<span>${t("generateQuizBtn")}</span>`;
    }
  }
}

async function publishQuiz() {
  const quiz = state.quiz;
  if (!quiz) return;
  try {
    let response;
    if (state.quizId) {
      response = await requestJson(`/api/quizzes/${state.quizId}/publish`, {
        method: "POST",
        body: JSON.stringify({ quiz })
      });
    } else {
      const created = await requestJson("/api/quizzes", {
        method: "POST",
        body: JSON.stringify({ quiz, lesson: state.lesson })
      });
      state.quizId = created.quiz.id;
      response = await requestJson(`/api/quizzes/${created.quiz.id}/publish`, {
        method: "POST",
        body: JSON.stringify({ quiz })
      });
    }
    state.approved = true;
    state.shareCode = response.quiz.code;
    await refreshPortalData();
    render();
    showToast(`Quiz approved! Class code: ${response.quiz.code}`, "success");
  } catch (err) {
    console.error("Publishing error:", err);
    showToast(err.message || "Could not publish quiz.", "error");
  }
}

async function submitQuiz() {
  if (!state.quizId) return;
  try {
    const response = await requestJson(`/api/quizzes/${state.quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers: state.answers })
    });
    state.result = response.result;
    await refreshPortalData();
    render();
    showToast(`Quiz complete! You scored ${response.result.score}/${state.quiz.questions.length}.`, "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Quiz submit error:", err);
    showToast(err.message || "Could not submit quiz.", "error");
  }
}

async function startQuiz(quizId) {
  const entry = state.quizzes.find((q) => q.id === quizId);
  if (!entry) return;
  state.quizId = entry.id;
  state.quiz = entry;
  state.answers = entry.submitted ? [...entry.submitted.answers] : [];
  state.result = entry.submitted;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function joinQuiz(form) {
  const code = form.elements.code?.value.trim().toUpperCase();
  if (!code) return;
  try {
    const response = await requestJson("/api/join", {
      method: "POST",
      body: JSON.stringify({ code })
    });
    await refreshPortalData();
    showToast("Class quiz joined successfully!", "success");
    startQuiz(response.quizId);
  } catch (err) {
    console.error("Join quiz error:", err);
    showToast(err.message || "Could not join quiz with that code.", "error");
  }
}

async function connectFamily(form) {
  const code = form.elements.code?.value.trim().toUpperCase();
  if (!code) return;
  try {
    const response = await requestJson("/api/family/connect", {
      method: "POST",
      body: JSON.stringify({ code })
    });
    await refreshPortalData();
    showToast(`Connected to learner ${response.student.name}!`, "success");
    render();
  } catch (err) {
    console.error("Family connect error:", err);
    showToast(err.message || "Could not connect to learner with that code.", "error");
  }
}

async function authenticate(form) {
  const role = form.dataset.role;
  const mode = form.dataset.mode;
  const email = form.elements.email?.value.trim().toLowerCase();
  const password = form.elements.password?.value;
  const name = form.elements.name?.value.trim();

  try {
    if (mode === "register") {
      const payload = await requestJson("/api/register", {
        method: "POST",
        body: JSON.stringify({
          role,
          email,
          password,
          name,
          education: role === "student" ? educationFromForm(form) : undefined
        })
      });
      if (payload.session) {
        saveSupabaseSession(payload.session);
        state.session = payload.user;
        await refreshPortalData();
        render();
        showToast(`Welcome to Elmanar, ${payload.user.name}!`, "success");
      } else {
        state.pendingEmail = email;
        state.authMode = "verify";
        render();
      }
    } else {
      const payload = await requestJson("/api/login", {
        method: "POST",
        body: JSON.stringify({ role, email, password })
      });
      saveSupabaseSession(payload.session);
      state.session = payload.user;
      await refreshPortalData();
      render();
      showToast(`Welcome back, ${payload.user.name}!`, "success");
    }
  } catch (err) {
    console.error("Authentication error:", err);
    showToast(err.message || "Authentication failed.", "error");
  }
}

async function signOut() {
  const session = readSupabaseSession();
  try {
    if (session?.access_token) {
      await requestJson("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ access_token: session.access_token })
      }).catch(() => null);
    }
    await requestJson("/api/logout", { method: "POST" }).catch(() => null);
  } finally {
    clearSupabaseSession();
    state.session = null;
    state.view = "teacher";
    state.authMode = "";
    state.quizzes = [];
    state.students = [];
    state.quiz = null;
    state.simplification = null;
    render();
    showToast("You’ve been signed out.");
  }
}

async function loadTeacherQuiz(quizId) {
  try {
    const response = await requestJson(`/api/quizzes/${quizId}`);
    state.quizId = response.quiz.id;
    state.quiz = response.quiz;
    state.topic = response.quiz.topic;
    state.lesson = response.quiz.lesson || "";
    state.approved = response.quiz.approved;
    state.shareCode = response.quiz.code;
    render();
    document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    showToast(err.message || "Could not load quiz draft.", "error");
  }
}

async function copyToClipboard(value, message) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    showToast(message, "success");
  } catch {
    showToast("Could not copy automatically. Select text to copy.", "error");
  }
}

async function checkAIStatus() {
  try {
    const response = await fetch("/api/status");
    if (!response.ok) throw new Error();
    const result = await response.json();
    statusBadge.classList.toggle("is-online", Boolean(result.configured));
    statusBadge.classList.toggle("is-demo", !result.configured);
    statusBadge.innerHTML = `<span></span>${result.configured ? t("aiReady") : t("sampleMode")}`;
  } catch {
    statusBadge.classList.add("is-demo");
    statusBadge.innerHTML = `<span></span>${t("aiUnavailable")}`;
  }
}

/* ================================================================
   EVENT LISTENERS & DELEGATION
   ================================================================ */
app.addEventListener("input", (event) => {
  const target = event.target;
  if (target.name === "lesson") updateLessonCount(target.value);
  if (target.dataset.field) {
    const question = state.quiz?.questions[Number(target.dataset.index)];
    if (!question) return;
    if (target.dataset.field === "option") {
      question.options[Number(target.dataset.option)] = target.value;
    } else {
      question[target.dataset.field] = target.value;
    }
  }
  if (target.name === "quiz-topic" && state.quiz) {
    state.quiz.topic = target.value;
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.id === "doc-file-input" && target.files?.length) {
    void handleDocumentUpload(target.files[0]);
    return;
  }
  if (target.matches('[data-education-stage]')) {
    const form = target.closest("form") || target.closest("fieldset");
    const yearSelect = form?.querySelector('[data-education-year]');
    const maxYear = studyStages.find((s) => s.id === target.value)?.years || 5;
    if (yearSelect) {
      const prev = Number(yearSelect.value) || 1;
      yearSelect.innerHTML = Array.from({ length: maxYear }, (_, i) => i + 1)
        .map((y) => `<option value="${y}">Year ${y} · السنة ${y}</option>`).join("");
      yearSelect.value = String(Math.min(prev, maxYear));
    }
  }
  if (target.matches('input[type="radio"][data-action="set-answer"]')) {
    const question = state.quiz?.questions[Number(target.dataset.index)];
    if (question) {
      question.answerIndex = Number(target.value);
      state.approved = false;
    }
  }
});

document.addEventListener("dragover", (event) => {
  const dropzone = event.target.closest("#doc-dropzone");
  if (dropzone) {
    event.preventDefault();
    dropzone.classList.add("is-dragover");
  }
});

document.addEventListener("dragleave", (event) => {
  const dropzone = event.target.closest("#doc-dropzone");
  if (dropzone) dropzone.classList.remove("is-dragover");
});

document.addEventListener("drop", (event) => {
  const dropzone = event.target.closest("#doc-dropzone");
  if (dropzone) {
    event.preventDefault();
    dropzone.classList.remove("is-dragover");
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) void handleDocumentUpload(files[0]);
  }
});

app.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id === "student-profile-form") {
    event.preventDefault();
    void saveStudentProfile(form);
    return;
  }
  if (form.id === "lesson-form") {
    event.preventDefault();
    void generateQuiz(form);
    return;
  }
  if (form.id === "join-form") {
    event.preventDefault();
    void joinQuiz(form);
    return;
  }
  if (form.id === "family-connect-form") {
    event.preventDefault();
    void connectFamily(form);
  }
});

app.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;

  if (action === "sample-lesson") {
    const topInput = app.querySelector('[name="topic"]');
    const lesInput = app.querySelector('[name="lesson"]');
    if (topInput) topInput.value = sampleQuiz.topic;
    if (lesInput) lesInput.value = sampleLesson;
    state.topic = sampleQuiz.topic;
    state.lesson = sampleLesson;
    updateLessonCount(sampleLesson);
    showToast("Sample lesson added.", "info");
  } else if (action === "sample-quiz") {
    addSampleQuiz();
  } else if (action === "simplify-lesson") {
    void simplifyCurrentLesson();
  } else if (action === "load-sample-doc") {
    loadSampleDocument(button.dataset.docId);
  } else if (action === "clear-doc") {
    state.uploadedDocName = "";
    render();
  } else if (action === "copy-simplification") {
    if (state.simplification) {
      const s = state.simplification;
      const text = `${s.topic}\n\nTL;DR: ${s.tldr}\n\nKey Points:\n${(s.keyPoints || []).map((p) => "• " + p).join("\n")}\n\nDifficulties:\n${(s.difficulties || []).map((d) => `• ${d.concept}: ${d.simplified} (Analogy: ${d.analogy})`).join("\n")}`;
      void copyToClipboard(text, t("copiedToast"));
    }
  } else if (action === "convert-simplifier-to-quiz") {
    if (state.simplification) {
      state.topic = state.simplification.topic || state.topic;
      state.lesson = `${state.simplification.tldr}\n\nKey Concepts:\n${(state.simplification.keyPoints || []).join("\n")}`;
      state.teacherTab = "quiz";
      render();
      const form = document.getElementById("lesson-form");
      if (form) void generateQuiz(form);
    }
  } else if (action === "delete-question") {
    if (state.quiz.questions.length <= 1) {
      showToast("A quiz needs at least one question.", "error");
      return;
    }
    state.quiz.questions.splice(Number(button.dataset.index), 1);
    state.approved = false;
    render();
  } else if (action === "add-question") {
    if (state.quiz.questions.length >= 10) {
      showToast("Maximum 10 questions per quiz.", "error");
      return;
    }
    state.quiz.questions.push(newQuestion());
    state.approved = false;
    render();
  } else if (action === "approve") {
    void publishQuiz();
  } else if (action === "answer") {
    if (!state.quizId || state.result) return;
    state.answers[Number(button.dataset.question)] = Number(button.dataset.option);
    render();
  } else if (action === "submit-quiz") {
    void submitQuiz();
  } else if (action === "retake") {
    state.answers = [];
    state.result = null;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (action === "start-quiz") {
    void startQuiz(button.dataset.quizId);
  } else if (action === "back-to-quizzes") {
    state.quiz = null;
    state.quizId = null;
    state.answers = [];
    state.result = null;
    render();
  } else if (action === "load-draft") {
    void loadTeacherQuiz(button.dataset.quizId);
  } else if (action === "copy-family-code") {
    void copyToClipboard(state.session?.familyCode, "Family code copied.");
  }
});

welcomeContent.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  const card = event.target.closest("[data-role-entry]");
  if (button?.dataset.authRole) {
    state.authRole = button.dataset.authRole;
    state.authMode = button.dataset.authMode;
    render();
  } else if (!button && card) {
    state.authRole = card.dataset.roleEntry;
    state.authMode = "register";
    render();
  } else if (button?.dataset.action === "back-home") {
    state.authMode = "";
    render();
  } else if (button?.dataset.action === "explore-portals" || button?.dataset.action === "choose-login") {
    document.getElementById("portals")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (button?.dataset.action === "google-prototype") {
    showToast("Google sign-in prototype active.", "info");
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (form instanceof HTMLFormElement && form.id === "auth-form") {
    event.preventDefault();
    void authenticate(form);
  }
});

document.addEventListener("click", (event) => {
  const langBtn = event.target.closest("[data-lang]");
  if (langBtn) {
    setLanguage(langBtn.dataset.lang);
    return;
  }
  const action = event.target.closest("[data-action]");
  if (!action) return;
  if (action.dataset.action === "toggle-theme") {
    setTheme(state.theme === "dark" ? "light" : "dark");
  } else if (action.dataset.action === "logout") {
    void signOut();
  } else if (action.dataset.action === "go-home") {
    event.preventDefault();
    void signOut();
  }
});

/* ================================================================
   INITIALIZATION
   ================================================================ */
try {
  const savedTheme = localStorage.getItem(`${STORAGE_KEY}:theme`);
  if (savedTheme === "light" || savedTheme === "dark") state.theme = savedTheme;
  const savedLang = localStorage.getItem(`${STORAGE_KEY}:lang`);
  if (["en", "ar", "fr"].includes(savedLang)) state.lang = savedLang;
} catch (err) {
  console.error("Settings load error:", err);
}

applyTheme();
setLanguage(state.lang);
void checkAIStatus();

void (async () => {
  try {
    await requestJson("/api/config");
    const payload = await restoreSupabaseSession();
    if (!payload?.user) return;
    state.session = payload.user;
    state.view = payload.user.role;
    await refreshPortalData();
    render();
  } catch (err) {
    console.error("Session restore notice:", err);
  }
})();