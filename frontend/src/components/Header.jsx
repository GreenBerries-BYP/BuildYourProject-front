import { useState, useEffect, useRef } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { TbBellRingingFilled } from "react-icons/tb";
import { MdOutlineWbSunny, MdDarkMode } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import "../styles/Header.css";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useSearch } from "../context/SearchContext";
import Notifications from "./Notifications";

const I18N_STORAGE_KEY = "i18nextLng";

const Header = () => {
  const { t, i18n } = useTranslation();
  const { searchTerm, setSearchTerm } = useSearch();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [language, setLanguage] = useState(
    localStorage.getItem(I18N_STORAGE_KEY)
  );
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, setSearchTerm]);

  useEffect(() => {
    if (searchTerm === "") {
      setLocalSearch("");
    }
  }, [searchTerm]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "pt-BR" ? "en-US" : "pt-BR"));
    localStorage.setItem(
      language === "pt-BR" ? "en-US" : "pt-BR",
      I18N_STORAGE_KEY
    );
    i18n.changeLanguage(language === "pt-BR" ? "en-US" : "pt-BR");
  };

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  const flagSrc =
    i18n.language === "pt-BR" ? "/imgs/brazil-.png" : "/imgs/united-states.png";
  const flagAlt =
    i18n.language === "pt-BR"
      ? t("altText.brazilFlag", "Brazilian Flag")
      : t("altText.usFlag", "US Flag");

  const handleSearchFocus = () => setIsSearchFocused(true);
  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const unreadCount = 2; // tem q substituir por logica de vdd ex: notifications.filter(n => !n.isRead).length;

  return (
    <header className="header d-flex align-items-center justify-content-between">
      <div className="header-left d-flex align-items-center">
        <img
          src="/imgs/byp_logo.svg"
          alt={t("altText.logoBYP", "BYP Logo")}
          className="logo-img"
        />
        <span className="title mt-2">
          {t("header.title", "Build Your Project")}
        </span>
      </div>
      <div className="header-right d-flex align-items-center">
        <div
          className={`search ${
            isSearchFocused ? "focused" : ""
          } d-flex align-items-center`}
        >
          <input
            type="text"
            placeholder={t("messages.searchPlaceholder", "Search...")}
            className="search-input"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            ref={searchInputRef}
          />
          <FiSearch className="header-icon search-icon" />
        </div>
        <div className="notifications-container">
          <button onClick={toggleNotifications} className="notification-btn">
            <TbBellRingingFilled
              className="header-icon"
              aria-label={t("header.notifications", "Notifications")}
            />{" "}
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          <Notifications isOpen={notificationsOpen} />
        </div>
        <button
          className="header-icon"
          onClick={toggleDarkMode}
          aria-label={
            isDark
              ? t("header.switchToLightMode", "Switch to Light Mode")
              : t("header.switchToDarkMode", "Switch to Dark Mode")
          }
        >
          {isDark ? <MdOutlineWbSunny /> : <MdDarkMode />}
        </button>

        <button
          onClick={toggleLanguage}
          className="header-icon"
          aria-label={t("header.changeLanguage")}
        >
          <img src={flagSrc} alt={flagAlt} className="bandeira" />
        </button>

        <Link to="/home/dados_usuario">
          <FaRegUserCircle
            className="header-icon"
            aria-label={t("header.userProfile", "User Profile")}
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
