"use client";

import { useI18n } from "../../../context/I18nContext";
import { FiGlobe } from "react-icons/fi";
import styles from "./LanguageSwitcher.module.css";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  return (
    <button
      className={styles.switcher}
      onClick={toggleLanguage}
      aria-label={`Switch to ${language === "vi" ? "English" : "Tiếng Việt"}`}
      title={`Switch to ${language === "vi" ? "English" : "Tiếng Việt"}`}
    >
      <FiGlobe size={20} />
      <span className={styles.languageCode}>{language.toUpperCase()}</span>
    </button>
  );
};

