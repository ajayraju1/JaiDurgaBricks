import { create } from "zustand";

type Language = "te" | "en";

type Translations = {
  [key: string]: {
    en: string;
    te: string;
  };
};

const translations: Translations = {
  // Branding
  "brand.name": {
    en: "Jai Durga Bricks",
    te: "జై దుర్గా బ్రిక్స్",
  },
  "brand.shortName": {
    en: "JD Bricks",
    te: "జే.డి బ్రిక్స్",
  },

  // Navigation
  "nav.home": {
    en: "Home",
    te: "హోమ్",
  },
  "nav.workers": {
    en: "Mens",
    te: "మనుషులు",
  },
  "nav.calculator": {
    en: "Calculator",
    te: "క్యాల్క్యులేటర్",
  },

  // Authentication
  "auth.signIn": {
    en: "Sign In",
    te: "సైన్ ఇన్",
  },
  "auth.email": {
    en: "Email address",
    te: "ఇమెయిల్ చిరునామా",
  },
  "auth.password": {
    en: "Password",
    te: "పాస్‌వర్డ్",
  },
  "auth.signingIn": {
    en: "Signing in...",
    te: "సైన్ ఇన్ అవుతోంది...",
  },
  "auth.useMagicLink": {
    en: "Sign in with Magic Link instead",
    te: "మ్యాజిక్ లింక్‌తో సైన్ ఇన్ చేయండి",
  },
  "auth.usePassword": {
    en: "Sign in with Password instead",
    te: "పాస్‌వర్డ్‌తో సైన్ ఇన్ చేయండి",
  },
  "auth.sendMagicLink": {
    en: "Send Magic Link",
    te: "మ్యాజిక్ లింక్ పంపండి",
  },
  "auth.checkEmail": {
    en: "Check your email",
    te: "మీ ఇమెయిల్‌ని తనిఖీ చేయండి",
  },
  "auth.magicLinkSent": {
    en: "We've sent a magic link to your email. Click on it to sign in.",
    te: "మేము మీ ఇమెయిల్‌కి మ్యాజిక్ లింక్‌ని పంపాము. సైన్ ఇన్ చేయడానికి దానిపై క్లిక్ చేయండి.",
  },
  "auth.backToLogin": {
    en: "Back to Login",
    te: "లాగిన్‌కి తిరిగి వెళ్ళండి",
  },
  "auth.signOut": {
    en: "Sign Out",
    te: "సైన్ అవుట్",
  },

  // Worker management
  "worker.add": {
    en: "Add Mens",
    te: "మనుషులు ని జోడించండి",
  },
  "worker.name": {
    en: "Name",
    te: "పేరు",
  },
  "worker.phone": {
    en: "Phone Number",
    te: "ఫోన్ నంబర్",
  },
  "worker.debt": {
    en: "Initial Debt",
    te: "ప్రారంభ అప్పు",
  },

  // Work types
  "work.kundi": {
    en: "Kundi Work",
    te: "కుండీ చేత",
  },
  "work.kundiOptions": {
    en: "Kundi Type",
    te: "కుండీ రకం",
  },
  "work.kundiDriver": {
    en: "Kundi Driver",
    te: "కుండీ చేత డ్రైవర్",
  },
  "work.brickCarry": {
    en: "Brick Carrying",
    te: "ఇటుక లాగుడు",
  },
  "work.brickBaking": {
    en: "Brick Baking",
    te: "ఆమా కాల్చడం",
  },
  "work.brickLoadTractor": {
    en: "Brick Load - Tractor",
    te: "ఇటుక లోడ్ – ట్రాక్టర్",
  },
  "work.brickLoadVan": {
    en: "Brick Load - Van",
    te: "ఇటుక లోడ్ – వ్యాన్",
  },
  "work.topWork": {
    en: "Top Work",
    te: "పై పని",
  },

  // Tabs
  "tab.thisWeek": {
    en: "This Week Work",
    te: "ఈ వారం పని",
  },
  "tab.usage": {
    en: "Usage",
    te: "వాడకం",
  },
  "tab.addUsage": {
    en: "Add Usage",
    te: "వాడకం జోడించు",
  },
  "tab.totalWork": {
    en: "Total Work",
    te: "మొత్తం పని",
  },
  "tab.addTodayWork": {
    en: "Add Today's Work",
    te: " పని జోడించు",
  },

  // Common
  "common.save": {
    en: "Save",
    te: "సేవ్ చేయండి",
  },
  "common.add": {
    en: "Add",
    te: "జోడించు",
  },
  "common.back": {
    en: "Back",
    te: "వెనుకకు",
  },
  "common.cancel": {
    en: "Cancel",
    te: "రద్దు చేయండి",
  },
  "common.date": {
    en: "Date",
    te: "తేదీ",
  },
  "common.amount": {
    en: "Amount",
    te: "మొత్తం",
  },
  "common.workType": {
    en: "Work Type",
    te: "పని రకం",
  },
  "common.all": {
    en: "All",
    te: "అన్నీ",
  },
  "common.driver": {
    en: "Driver",
    te: "డ్రైవర్",
  },
  "common.work": {
    en: "Work",
    te: "పని",
  },
  "common.brickCount": {
    en: "Brick Count",
    te: "ఇటుక కౌంట్",
  },
  "common.fullDay": {
    en: "Full Day",
    te: "పూర్తి రోజు",
  },
  "common.halfDay": {
    en: "Half Day",
    te: "సగం రోజు",
  },
  "common.total": {
    en: "Total",
    te: "మొత్తం",
  },
  "common.delete": {
    en: "Delete",
    te: "తొలగించు",
  },
  "common.removeUser": {
    en: "Remove User",
    te: "మనిషిని తొలగించు",
  },
  "common.selectUserToRemove": {
    en: "Select a person to remove",
    te: "తొలగించడానికి ఒక వ్యక్తిని ఎంచుకోండి",
  },
  "common.search": {
    en: "Search...",
    te: "వెతకండి...",
  },
  "common.noResults": {
    en: "No results found",
    te: "ఫలితాలు కనుగొనబడలేదు",
  },
  "common.confirmDelete": {
    en: "Confirm Delete",
    te: "తొలగించడాన్ని నిర్ధారించండి",
  },
  "common.deleteConfirmation": {
    en: "Confirm Delete",
    te: "తొలగించడాన్ని నిర్ధారించండి",
  },
  "common.deleteWarning": {
    en: "Are you sure you want to delete this person? This action cannot be undone.",
    te: "మీరు ఖచ్చితంగా ఈ మనిషిని తొలగించాలనుకుంటున్నారా? ఈ చర్య రద్దు చేయబడదు.",
  },
  "common.confirmDeleteWorker": {
    en: "Are you sure you want to delete this person? This action cannot be undone.",
    te: "మీరు ఖచ్చితంగా ఈ మనిషిని తొలగించాలనుకుంటున్నారా? ఈ చర్య రద్దు చేయబడదు.",
  },
  "common.confirmDeleteWork": {
    en: "Are you sure you want to delete this work record? This action cannot be undone.",
    te: "మీరు ఖచ్చితంగా ఈ పని రికార్డును తొలగించాలనుకుంటున్నారా? ఈ చర్య రద్దు చేయబడదు.",
  },
  "common.confirmDeleteUsage": {
    en: "Are you sure you want to delete this usage record? This action cannot be undone.",
    te: "మీరు ఖచ్చితంగా ఈ వాడకం రికార్డును తొలగించాలనుకుంటున్నారా? ఈ చర్య రద్దు చేయబడదు.",
  },
  "common.showFilters": {
    en: "Show Filters",
    te: "ఫిల్టర్‌లను చూపించు",
  },
  "common.hideFilters": {
    en: "Hide Filters",
    te: "ఫిల్టర్‌లను దాచు",
  },
  "common.resetFilters": {
    en: "Reset Filters",
    te: "ఫిల్టర్‌లను రీసెట్ చేయండి",
  },
  "common.actions": {
    en: "Actions",
    te: "చర్యలు",
  },
  "common.backToHome": {
    en: "Back to Home",
    te: "హోమ్‌కి తిరిగి",
  },

  // Error messages
  "error.workerNotFound": {
    en: "Worker not found",
    te: "కార్మికుడు కనుగొనబడలేదు",
  },

  // Calculator
  "calculator.title": {
    en: "Calculator",
    te: "క్యాల్క్యులేటర్",
  },
  "calculator.clear": {
    en: "AC",
    te: "AC",
  },
};

type LanguageStore = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

export const useLanguage = create<LanguageStore>((set, get) => ({
  language: "te",
  setLanguage: (language) => set({ language }),
  t: (key: string) => {
    const lang = get().language;
    return translations[key]?.[lang] || key;
  },
}));
