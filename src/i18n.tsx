import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import translationEn from "./locales/en.json";
import translationAr from "./locales/ar.json";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: {
        translation: translationEn,
      },
      ar: {
        translation: translationAr,
      },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    react: {
      useSuspense: false,
    },
  });

export default i18n;
