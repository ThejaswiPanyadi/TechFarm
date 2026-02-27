import { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "kn" | "hi" | "ml";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const translations: Record<Language, Record<string, string>> = {
  en: {
    home: "Home",
    rentMachines: "Rent Machines",
    cropsSeeds: "Crops & Seeds",
    login: "Login",
    register: "Register",
    heroTitle: "Farm Smarter with",
    heroSubtitle:
      "Rent agricultural machinery from Saya Enterprises and buy or sell crops and seeds directly from other farmers.",
    getStarted: "Get Started",
    browseCrops: "Browse Crops",
  },
  kn: {
    home: "ಮುಖಪುಟ",
    rentMachines: "ಯಂತ್ರ ಬಾಡಿಗೆ",
    cropsSeeds: "ಬೆಳೆ & ಬೀಜಗಳು",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    heroTitle: "ಟೆಕ್‌ಫಾರ್ಮ್ ಜೊತೆ",
    heroSubtitle:
      "ಸಾಯ ಎಂಟರ್ಪ್ರೈಸಸ್‌ನಿಂದ ಕೃಷಿ ಯಂತ್ರಗಳನ್ನು ಬಾಡಿಗೆಗೆ ಪಡೆದು ರೈತರಿಂದ ರೈತರಿಗೆ ಬೆಳೆಗಳನ್ನು ವಹಿವಾಟು ಮಾಡಿ.",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",
    browseCrops: "ಬೆಳೆಗಳನ್ನು ನೋಡಿ",
  },
  hi: {
    home: "होम",
    rentMachines: "मशीन किराया",
    cropsSeeds: "फसल और बीज",
    login: "लॉगिन",
    register: "रजिस्टर",
    heroTitle: "TechFarm के साथ",
    heroSubtitle:
      "साया एंटरप्राइजेज से कृषि मशीनें किराए पर लें और किसानों से सीधे फसलें खरीदें या बेचें।",
    getStarted: "शुरू करें",
    browseCrops: "फसल देखें",
  },
  ml: {
    home: "ഹോം",
    rentMachines: "യന്ത്ര വാടക",
    cropsSeeds: "വിള & വിത്ത്",
    login: "ലോഗിൻ",
    register: "രജിസ്റ്റർ",
    heroTitle: "TechFarm ഉപയോഗിച്ച്",
    heroSubtitle:
      "സായ എന്റർപ്രൈസസിൽ നിന്ന് കൃഷി യന്ത്രങ്ങൾ വാടകയ്ക്ക് എടുക്കുകയും കർഷകരുമായി നേരിട്ട് വ്യാപാരം നടത്തുകയും ചെയ്യുക.",
    getStarted: "ആരംഭിക്കുക",
    browseCrops: "വിളകൾ കാണുക",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved) setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
