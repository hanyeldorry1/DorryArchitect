import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
  translation: {
    // Auth
    "login": "Login",
    "register": "Register",
    "username": "Username",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "email": "Email",
    "fullName": "Full Name",
    "rememberMe": "Remember me",
    "forgotPassword": "Forgot password?",
    "dontHaveAccount": "Don't have an account?",
    "alreadyHaveAccount": "Already have an account?",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "welcomeTo": "Welcome to",
    "dorryArchitect": "Dorry Architect",
    "signInToAccess": "Sign in to access your projects and design tools",
    "or": "OR",
    
    // Navigation
    "dashboard": "Dashboard",
    "projects": "Projects",
    "templates": "Templates",
    "boqLibrary": "BOQ Library",
    "environmentalAnalysis": "Environmental Analysis",
    "neufertStandards": "Neufert Standards",
    "culturalElements": "Cultural Elements",
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Logout",
    "newProject": "New Project",
    
    // Project related
    "recentProjects": "Recent Projects",
    "viewAll": "View All",
    "landArea": "Land Area",
    "updated": "Updated",
    "status": "Status",
    "inProgress": "In Progress",
    "concept": "Concept",
    "review": "Review",
    "completed": "Completed",
    "projectDetails": "Project Details",
    "projectName": "Project Name",
    "projectType": "Project Type",
    "projectLocation": "Location",
    "projectBudget": "Budget",
    "projectDescription": "Description",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "culturalStyle": "Cultural Style",
    "createProject": "Create Project",
    "updateProject": "Update Project",
    "deleteProject": "Delete Project",
    "exportIFC": "Export IFC",
    "saveDesign": "Save Design",
    
    // Environmental Analysis
    "windDirection": "Wind Direction",
    "solarIrradiance": "Solar Irradiance",
    "updatedToday": "Updated Today",
    
    // BOQ
    "boqSummary": "BOQ Summary",
    "viewFullBOQ": "View Full BOQ",
    "estimatedCost": "Estimated Cost",
    "vsBudget": "vs. Budget",
    "concreteFoundation": "Concrete & Foundation",
    "structuralElements": "Structural Elements",
    "finishesMaterials": "Finishes & Materials",
    
    // Chat
    "designAssistant": "Design Assistant",
    "typeYourDesignRequest": "Type your design request...",
    "enableVoiceOutput": "Enable voice output",
    "clearChat": "Clear chat",
    "viewUpdatedDesign": "View updated design",
    "undoChanges": "Undo changes",
    
    // Footer
    "copyright": "© 2023 Dorry Architect - AI-Powered Architectural Design for Egypt"
  }
};

// Arabic translations
const ar = {
  translation: {
    // Auth
    "login": "تسجيل الدخول",
    "register": "إنشاء حساب",
    "username": "اسم المستخدم",
    "password": "كلمة المرور",
    "confirmPassword": "تأكيد كلمة المرور",
    "email": "البريد الإلكتروني",
    "fullName": "الاسم الكامل",
    "rememberMe": "تذكرني",
    "forgotPassword": "نسيت كلمة المرور؟",
    "dontHaveAccount": "ليس لديك حساب؟",
    "alreadyHaveAccount": "لديك حساب بالفعل؟",
    "signIn": "دخول",
    "signUp": "تسجيل",
    "welcomeTo": "مرحبا بك في",
    "dorryArchitect": "دوري للهندسة المعمارية",
    "signInToAccess": "سجل الدخول للوصول إلى مشاريعك وأدوات التصميم",
    "or": "أو",
    
    // Navigation
    "dashboard": "لوحة التحكم",
    "projects": "المشاريع",
    "templates": "القوالب",
    "boqLibrary": "مكتبة جداول الكميات",
    "environmentalAnalysis": "التحليل البيئي",
    "neufertStandards": "معايير نويفرت",
    "culturalElements": "العناصر الثقافية",
    "profile": "الملف الشخصي",
    "settings": "الإعدادات",
    "logout": "تسجيل الخروج",
    "newProject": "مشروع جديد",
    
    // Project related
    "recentProjects": "المشاريع الحديثة",
    "viewAll": "عرض الكل",
    "landArea": "مساحة الأرض",
    "updated": "تم التحديث",
    "status": "الحالة",
    "inProgress": "قيد التنفيذ",
    "concept": "تصور مبدئي",
    "review": "قيد المراجعة",
    "completed": "مكتمل",
    "projectDetails": "تفاصيل المشروع",
    "projectName": "اسم المشروع",
    "projectType": "نوع المشروع",
    "projectLocation": "الموقع",
    "projectBudget": "الميزانية",
    "projectDescription": "الوصف",
    "latitude": "خط العرض",
    "longitude": "خط الطول",
    "culturalStyle": "الطراز الثقافي",
    "createProject": "إنشاء مشروع",
    "updateProject": "تحديث المشروع",
    "deleteProject": "حذف المشروع",
    "exportIFC": "تصدير IFC",
    "saveDesign": "حفظ التصميم",
    
    // Environmental Analysis
    "windDirection": "اتجاه الرياح",
    "solarIrradiance": "الإشعاع الشمسي",
    "updatedToday": "تم التحديث اليوم",
    
    // BOQ
    "boqSummary": "ملخص جدول الكميات",
    "viewFullBOQ": "عرض جدول الكميات كاملاً",
    "estimatedCost": "التكلفة التقديرية",
    "vsBudget": "مقابل الميزانية",
    "concreteFoundation": "الخرسانة والأساسات",
    "structuralElements": "العناصر الهيكلية",
    "finishesMaterials": "التشطيبات والمواد",
    
    // Chat
    "designAssistant": "مساعد التصميم",
    "typeYourDesignRequest": "اكتب طلب التصميم الخاص بك...",
    "enableVoiceOutput": "تمكين الصوت",
    "clearChat": "مسح المحادثة",
    "viewUpdatedDesign": "عرض التصميم المحدث",
    "undoChanges": "التراجع عن التغييرات",
    
    // Footer
    "copyright": "© 2023 دوري للهندسة المعمارية - تصميم معماري مدعوم بالذكاء الاصطناعي لمصر"
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      ar
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
