import { createContext, useContext, useState, useEffect } from "react";

type Lang = "en" | "kn" | "hi" | "ml";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    home: "Home",
    rentMachines: "Rent Machines",
    cropsSeeds: "Crops & Seeds",
    login: "Login",
    register: "Register",
    marketplace: "Crop Marketplace",

    // Home hero
    badge: "Digitizing Rural Agriculture",
    heroLine1: "Farm Smarter with",
    heroLine2: "TechFarm",
    heroDesc: "Rent agricultural machinery from Saya Enterprises and buy or sell crops and seeds directly from other farmers.",
    rentBtn: "Rent Machines",
    browseBtn: "Browse Crops",

    // Home services
    servicesTitle: "Our Services",
    servicesSubtitle: "Everything you need to run a modern farm, in one place.",
    servicesRent: "Rent Machines",
    servicesRentDesc: "Access a wide range of agricultural machines available for daily rental. Save costs and increase efficiency.",
    servicesMarket: "Crop Marketplace",
    servicesMarketDesc: "Buy and sell crops and seeds directly with other farmers. Fresh produce, fair prices.",
    learnMore: "Learn More",

    // Machines page
    machinesTitle: "Rent Agricultural Machines",
    machinesSubtitle: "Browse and book available agricultural machines.",
    noMachines: "No machines available yet.",
    loadingMachines: "Loading machines...",
    bookMachine: "Book Machine",
    notAvailable: "Not Available",
    available: "✓ Available",
    unavailable: "✗ Not Available",
    perDay: "/ day",
    bookingRequested: "✓ Booking Requested!",

    // Marketplace
    marketplaceTitle: "Crops & Seeds Marketplace",
    marketplaceSubtitle: "Buy and sell crops and seeds directly with farmers.",
    searchPlaceholder: "Search crops...",
    locationPlaceholder: "Filter by location...",
    noListings: "No listings found.",
    loadingListings: "Loading listings...",
    contactSeller: "Contact Seller",
    postedBy: "Posted by",

    // Footer
    footerDesc: "Empowering rural farmers with digital agricultural services. by Saya Enterprises",
    quickLinks: "Quick Links",
    contactTitle: "Saya Enterprises",
    rightsReserved: "© 2026 TechFarm by Saya Enterprises. All rights reserved.",
  },

  kn: {
    // Nav
    home: "ಮುಖಪುಟ",
    rentMachines: "ಯಂತ್ರ ಬಾಡಿಗೆ",
    cropsSeeds: "ಬೆಳೆಗಳು ಮತ್ತು ಬೀಜಗಳು",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    marketplace: "ಬೆಳೆ ಮಾರುಕಟ್ಟೆ",

    // Home hero
    badge: "ಗ್ರಾಮೀಣ ಕೃಷಿಯ ಡಿಜಿಟಲೀಕರಣ",
    heroLine1: "ಚತುರವಾಗಿ ಕೃಷಿ ಮಾಡಿ",
    heroLine2: "ಟೆಕ್‌ಫಾರ್ಮ್",
    heroDesc: "ಸಾಯ ಎಂಟರ್‌ಪ್ರೈಸಸ್‌ನಿಂದ ಕೃಷಿ ಯಂತ್ರಗಳನ್ನು ಬಾಡಿಗೆಗೆ ಪಡೆಯಿರಿ ಮತ್ತು ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ಬೆಳೆ ಹಾಗೂ ಬೀಜಗಳನ್ನು ವಹಿವಾಟು ಮಾಡಿ.",
    rentBtn: "ಯಂತ್ರ ಬಾಡಿಗೆ",
    browseBtn: "ಬೆಳೆ ವೀಕ್ಷಿಸಿ",

    // Home services
    servicesTitle: "ನಮ್ಮ ಸೇವೆಗಳು",
    servicesSubtitle: "ಆಧುನಿಕ ಕೃಷಿಗೆ ಬೇಕಾದ ಎಲ್ಲವೂ ಒಂದೇ ಜಾಗದಲ್ಲಿ.",
    servicesRent: "ಯಂತ್ರ ಬಾಡಿಗೆ",
    servicesRentDesc: "ದೈನಂದಿನ ಬಾಡಿಗೆಗೆ ಲಭ್ಯವಿರುವ ವ್ಯಾಪಕ ಯಂತ್ರಗಳನ್ನು ಪ್ರವೇಶಿಸಿ.",
    servicesMarket: "ಬೆಳೆ ಮಾರುಕಟ್ಟೆ",
    servicesMarketDesc: "ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ಬೆಳೆ ಮತ್ತು ಬೀಜಗಳನ್ನು ಖರೀದಿಸಿ ಮತ್ತು ಮಾರಿ.",
    learnMore: "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",

    // Machines page
    machinesTitle: "ಕೃಷಿ ಯಂತ್ರಗಳನ್ನು ಬಾಡಿಗೆಗೆ ಪಡೆಯಿರಿ",
    machinesSubtitle: "ಲಭ್ಯವಿರುವ ಕೃಷಿ ಯಂತ್ರಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಬುಕ್ ಮಾಡಿ.",
    noMachines: "ಇನ್ನೂ ಯಾವುದೇ ಯಂತ್ರಗಳು ಲಭ್ಯವಿಲ್ಲ.",
    loadingMachines: "ಯಂತ್ರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    bookMachine: "ಯಂತ್ರ ಬುಕ್ ಮಾಡಿ",
    notAvailable: "ಲಭ್ಯವಿಲ್ಲ",
    available: "✓ ಲಭ್ಯವಿದೆ",
    unavailable: "✗ ಲಭ್ಯವಿಲ್ಲ",
    perDay: "/ ದಿನ",
    bookingRequested: "✓ ಬುಕಿಂಗ್ ವಿನಂತಿ ಮಾಡಲಾಗಿದೆ!",

    // Marketplace
    marketplaceTitle: "ಬೆಳೆ ಮತ್ತು ಬೀಜ ಮಾರುಕಟ್ಟೆ",
    marketplaceSubtitle: "ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ಬೆಳೆ ಮತ್ತು ಬೀಜಗಳನ್ನು ಖರೀದಿಸಿ ಅಥವಾ ಮಾರಿ.",
    searchPlaceholder: "ಬೆಳೆ ಹುಡುಕಿ...",
    locationPlaceholder: "ಸ್ಥಳದ ಮೂಲಕ ಫಿಲ್ಟರ್...",
    noListings: "ಯಾವುದೇ ಪಟ್ಟಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    loadingListings: "ಪಟ್ಟಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    contactSeller: "ಮಾರಾಟಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ",
    postedBy: "ಪೋಸ್ಟ್ ಮಾಡಿದವರು",

    // Footer
    footerDesc: "ಗ್ರಾಮೀಣ ರೈತರಿಗೆ ಡಿಜಿಟಲ್ ಕೃಷಿ ಸೇವೆಗಳೊಂದಿಗೆ ಸಶಕ್ತೀಕರಣ. ಸಾಯ ಎಂಟರ್‌ಪ್ರೈಸಸ್ ಮೂಲಕ",
    quickLinks: "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು",
    contactTitle: "ಸಾಯ ಎಂಟರ್‌ಪ್ರೈಸಸ್",
    rightsReserved: "© 2026 ಟೆಕ್‌ಫಾರ್ಮ್ ಸಾಯ ಎಂಟರ್‌ಪ್ರೈಸಸ್ ಮೂಲಕ. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
  },

  hi: {
    // Nav
    home: "होम",
    rentMachines: "मशीन किराया",
    cropsSeeds: "फसल और बीज",
    login: "लॉगिन",
    register: "रजिस्टर",
    marketplace: "फसल बाज़ार",

    // Home hero
    badge: "ग्रामीण कृषि का डिजिटलीकरण",
    heroLine1: "स्मार्ट खेती करें",
    heroLine2: "टेकफार्म",
    heroDesc: "साया एंटरप्राइजेज से कृषि मशीनें किराए पर लें और किसानों से सीधे फसल व बीज खरीदें या बेचें।",
    rentBtn: "मशीन किराए पर लें",
    browseBtn: "फसल देखें",

    // Home services
    servicesTitle: "हमारी सेवाएं",
    servicesSubtitle: "आधुनिक खेती के लिए जो भी चाहिए, सब एक जगह।",
    servicesRent: "मशीन किराया",
    servicesRentDesc: "दैनिक किराए पर उपलब्ध कृषि मशीनों की विस्तृत श्रृंखला तक पहुंचें।",
    servicesMarket: "फसल बाज़ार",
    servicesMarketDesc: "किसानों के साथ सीधे फसल और बीज खरीदें और बेचें।",
    learnMore: "और जानें",

    // Machines page
    machinesTitle: "कृषि मशीनें किराए पर लें",
    machinesSubtitle: "उपलब्ध कृषि मशीनें ब्राउज़ करें और बुक करें।",
    noMachines: "अभी कोई मशीन उपलब्ध नहीं है।",
    loadingMachines: "मशीनें लोड हो रही हैं...",
    bookMachine: "मशीन बुक करें",
    notAvailable: "उपलब्ध नहीं",
    available: "✓ उपलब्ध",
    unavailable: "✗ उपलब्ध नहीं",
    perDay: "/ दिन",
    bookingRequested: "✓ बुकिंग अनुरोध किया गया!",

    // Marketplace
    marketplaceTitle: "फसल और बीज बाज़ार",
    marketplaceSubtitle: "किसानों के साथ सीधे फसल और बीज खरीदें या बेचें।",
    searchPlaceholder: "फसल खोजें...",
    locationPlaceholder: "स्थान से फ़िल्टर करें...",
    noListings: "कोई लिस्टिंग नहीं मिली।",
    loadingListings: "लिस्टिंग लोड हो रही है...",
    contactSeller: "विक्रेता से संपर्क करें",
    postedBy: "द्वारा पोस्ट",

    // Footer
    footerDesc: "साया एंटरप्राइजेज द्वारा ग्रामीण किसानों को डिजिटल कृषि सेवाओं के साथ सशक्त बनाना।",
    quickLinks: "त्वरित लिंक",
    contactTitle: "साया एंटरप्राइजेज",
    rightsReserved: "© 2026 टेकफार्म साया एंटरप्राइजेज द्वारा। सर्वाधिकार सुरक्षित।",
  },

  ml: {
    // Nav
    home: "ഹോം",
    rentMachines: "യന്ത്ര വാടക",
    cropsSeeds: "വിളകളും വിത്തുകളും",
    login: "ലോഗിൻ",
    register: "രജിസ്റ്റർ",
    marketplace: "വിള മാർക്കറ്റ്",

    // Home hero
    badge: "ഗ്രാമീണ കൃഷിയുടെ ഡിജിറ്റലൈസേഷൻ",
    heroLine1: "സ്മാർട്ട് കൃഷി ചെയ്യൂ",
    heroLine2: "ടെക്‌ഫാം",
    heroDesc: "സായ എന്റർപ്രൈസസിൽ നിന്ന് കൃഷി യന്ത്രങ്ങൾ വാടകയ്ക്ക് എടുക്കുകയും കർഷകരുമായി നേരിട്ട് വിളകളും വിത്തുകളും കൈമാറ്റം ചെയ്യുകയും ചെയ്യുക.",
    rentBtn: "യന്ത്ര വാടക",
    browseBtn: "വിളകൾ കാണുക",

    // Home services
    servicesTitle: "ഞങ്ങളുടെ സേവനങ്ങൾ",
    servicesSubtitle: "ആധുനിക കൃഷിക്ക് ആവശ്യമായ എല്ലാം ഒരിടത്ത്.",
    servicesRent: "യന്ത്ര വാടക",
    servicesRentDesc: "ദൈനംദിന വാടകയ്ക്ക് ലഭ്യമായ വിശാലമായ കൃഷി യന്ത്രങ്ങൾ ആക്സസ് ചെയ്യുക.",
    servicesMarket: "വിള മാർക്കറ്റ്",
    servicesMarketDesc: "കർഷകരുമായി നേരിട്ട് വിളകളും വിത്തുകളും വാങ്ങുകയും വിൽക്കുകയും ചെയ്യുക.",
    learnMore: "കൂടുതൽ അറിയുക",

    // Machines page
    machinesTitle: "കൃഷി യന്ത്രങ്ങൾ വാടകയ്ക്ക് എടുക്കുക",
    machinesSubtitle: "ലഭ്യമായ കൃഷി യന്ത്രങ്ങൾ ബ്രൗസ് ചെയ്ത് ബുക്ക് ചെയ്യുക.",
    noMachines: "ഇതുവരെ യന്ത്രങ്ങൾ ഒന്നും ലഭ്യമല്ല.",
    loadingMachines: "യന്ത്രങ്ങൾ ലോഡ് ചെയ്യുന്നു...",
    bookMachine: "യന്ത്രം ബുക്ക് ചെയ്യുക",
    notAvailable: "ലഭ്യമല്ല",
    available: "✓ ലഭ്യമാണ്",
    unavailable: "✗ ലഭ്യമല്ല",
    perDay: "/ ദിവസം",
    bookingRequested: "✓ ബുക്കിംഗ് അഭ്യർഥിച്ചു!",

    // Marketplace
    marketplaceTitle: "വിളകളും വിത്തുകളും മാർക്കറ്റ്",
    marketplaceSubtitle: "കർഷകരുമായി നേരിട്ട് വിളകളും വിത്തുകളും വാങ്ങുക അല്ലെങ്കിൽ വിൽക്കുക.",
    searchPlaceholder: "വിളകൾ തിരയുക...",
    locationPlaceholder: "സ്ഥലം ഫിൽട്ടർ ചെയ്യുക...",
    noListings: "ലിസ്റ്റിംഗുകൾ കണ്ടെത്തിയില്ല.",
    loadingListings: "ലിസ്റ്റിംഗുകൾ ലോഡ് ചെയ്യുന്നു...",
    contactSeller: "വിൽപ്പനക്കാരനെ ബന്ധപ്പെടുക",
    postedBy: "പോസ്റ്റ് ചെയ്തത്",

    // Footer
    footerDesc: "സായാ എന്റർപ്രൈസസ് വഴി ഗ്രാമീണ കർഷകർക്ക് ഡിജിറ്റൽ കാർഷിക സേവനങ്ങൾ നൽകുന്നു.",
    quickLinks: "ക്വിക്ക് ലിങ്കുകൾ",
    contactTitle: "സായാ എന്റർപ്രൈസസ്",
    rightsReserved: "© 2026 ടെക്‌ഫാം സായാ എന്റർപ്രൈസസ്. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.",
  },
};

const LanguageContext = createContext<any>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Load persisted lang on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tf_lang") as Lang | null;
      if (saved && ["en", "kn", "hi", "ml"].includes(saved)) {
        setLangState(saved);
      }
    } catch { }
  }, []);

  // Persist to localStorage whenever lang changes
  const setLang = (l: string) => {
    setLangState(l as Lang);
    try { localStorage.setItem("tf_lang", l); } catch { }
  };

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
