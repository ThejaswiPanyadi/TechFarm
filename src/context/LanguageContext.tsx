import { createContext, useContext, useState } from "react";

type Lang = "en" | "kn" | "hi" | "ml";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    home: "Home",
    machines: "Machines",
    marketplace: "Marketplace",
    login: "Login",
    register: "Register",

    badge: "Digitizing Rural Agriculture",
    heroLine1: "Farm Smarter with",
    heroLine2: "TechFarm",
    heroDesc:
      "Rent agricultural machinery from Saya Enterprises and buy or sell crops and seeds directly from other farmers.",
    rentBtn: "Rent Machines",
    browseBtn: "Browse Crops",
  },

  kn: {
    home: "ಮುಖಪುಟ",
    machines: "ಯಂತ್ರಗಳು",
    marketplace: "ಮಾರುಕಟ್ಟೆ",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",

    badge: "ಗ್ರಾಮೀಣ ಕೃಷಿಯ ಡಿಜಿಟಲೀಕರಣ",
    heroLine1: "ಚತುರವಾಗಿ ಕೃಷಿ ಮಾಡಿ",
    heroLine2: "ಟೆಕ್ ಫಾರ್ಮ್",
    heroDesc:
      "ಸಾಯ ಎಂಟರ್‌ಪ್ರೈಸಸ್‌ನಿಂದ ಕೃಷಿ ಯಂತ್ರಗಳನ್ನು ಬಾಡಿಗೆಗೆ ಪಡೆಯಿರಿ ಮತ್ತು ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ಬೆಳೆ ಹಾಗೂ ಬೀಜಗಳನ್ನು ವಹಿವಾಟು ಮಾಡಿ.",
    rentBtn: "ಯಂತ್ರ ಬಾಡಿಗೆ",
    browseBtn: "ಬೆಳೆ ವೀಕ್ಷಿಸಿ",
  },

  hi: {
    home: "होम",
    machines: "मशीनें",
    marketplace: "मार्केटप्लेस",
    login: "लॉगिन",
    register: "रजिस्टर",

    badge: "ग्रामीण कृषि का डिजिटलीकरण",
    heroLine1: "स्मार्ट खेती करें",
    heroLine2: "टेकफार्म",
    heroDesc:
      "साया एंटरप्राइजेज से कृषि मशीनें किराए पर लें और किसानों से सीधे फसल व बीज खरीदें या बेचें।",
    rentBtn: "मशीन किराए पर लें",
    browseBtn: "फसल देखें",
  },

  ml: {
    home: "ഹോം",
    machines: "യന്ത്രങ്ങൾ",
    marketplace: "മാർക്കറ്റ്",
    login: "ലോഗിൻ",
    register: "രജിസ്റ്റർ",

    badge: "ഗ്രാമീണ കൃഷിയുടെ ഡിജിറ്റലൈസേഷൻ",
    heroLine1: "സ്മാർട്ട് കൃഷി",
    heroLine2: "ടെക് ഫാം",
    heroDesc:
      "സായ എന്റർപ്രൈസസിൽ നിന്ന് കൃഷി യന്ത്രങ്ങൾ വാടകയ്ക്ക് എടുക്കുകയും കർഷകരുമായി നേരിട്ട് വിളകളും വിത്തുകളും കൈമാറ്റം ചെയ്യുകയും ചെയ്യുക.",
    rentBtn: "യന്ത്ര വാടക",
    browseBtn: "വിളകൾ കാണുക",
  },
};

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
