import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "../../assets/locales/ru";
import ro from "../../assets/locales/ro";
import gz from "../../assets/locales/gz";

const resources = {
  ru: {
    translation: ru,
  },
  ro: {
    translation: ro,
  },
  gz: {
    translation: gz,
  },
};

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  debug: true,
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
  resources,
});
