import { create } from "zustand";

type Language = "te" | "en";

type Translations = {
  [key: string]: {
    en: string;
    te: string;
  };
};

const translations: Translations = {
  // Navigation
  "nav.home": {
    en: "Home",
    te: "హోమ్",
  },
  "nav.workers": {
    en: "Workers",
    te: "కార్మికులు",
  },

  // Worker management
  "worker.add": {
    en: "Add Worker",
    te: "కార్మికుడిని జోడించండి",
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
    te: "ఇటుక ఆమా kalchadam",
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
  "tab.totalWork": {
    en: "Total Work",
    te: "మొత్తం పని",
  },
  "tab.addTodayWork": {
    en: "Add Today's Work",
    te: "ఈ రోజు పని జోడించు",
  },

  // Common
  "common.save": {
    en: "Save",
    te: "సేవ్ చేయండి",
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
  "common.driver": {
    en: "Driver",
    te: "డ్రైవర్",
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
