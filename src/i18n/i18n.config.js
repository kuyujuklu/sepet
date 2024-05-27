import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "../../assets/locales/ru";
import ro from "../../assets/locales/ro";

const resources = {
  ru: {
    translation: ru,
  },
  ro: {
    translation: ro,
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
