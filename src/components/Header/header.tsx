"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { PiPackageLight, PiShoppingBagLight, PiUserCircleLight } from "react-icons/pi";
import { useCart } from "../../context/CartContext";
import { getAuthStatus } from "../../utils/auth";
import type { ShopNavItem } from "../Shop/shop.data";
import { getNavItemPath } from "../Shop/shop.data";
import { headerStyles } from "./header.styles";

type HeaderProps = {
  navMenu: ShopNavItem[];
};

export function Header({ navMenu }: HeaderProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const isAuthenticated = getAuthStatus();

  const handleNavItemEnter = (index: number) => {
    setActiveIndex(index);
  };

  const closeMenu = () => {
    setActiveIndex(null);
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <style>{headerStyles}</style>
      <header className={`header${activeIndex !== null ? " header--dropdown-open" : ""}`}>
        <div className="header__top">
          <div className="header__brand">
            <span className="header__brand-mark">
              <img
                className="header__brand-logo"
                src="/Image/Logo.png"
                alt="Timelite logo"
              />
            </span>
            <span className="header__brand-name" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              Timelite
            </span>
          </div>
          <div className="header__search">
            <FiSearch size={18} />
            <input type="search" aria-label="Search products" placeholder="What are you looking for?" />
          </div>
          <div className="header__actions">
            <button className="header__action" aria-label="Order tracking" onClick={() => navigate("/profile?tab=orders")}>
              <PiPackageLight size={22} />
            </button>
            <button className="header__profile" aria-label="Account" onClick={handleAccountClick}>
              <PiUserCircleLight size={22} />
            </button>
            <button className="header__icon" aria-label="Shopping bag" onClick={openCart}>
              <PiShoppingBagLight size={22} />
              {itemCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "#ba1415",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600"
                }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="header__nav-row" onMouseLeave={closeMenu}>
          <nav className="header__nav" aria-label="Primary">
            {navMenu.map((item, index) => {
              const hasDropdown =
                !item.disableDropdown &&
                ((item.columns && item.columns.length > 0) ||
                  (item.quickLinks && item.quickLinks.length > 0) ||
                  item.highlight);
              const isActive = activeIndex === index;

              return (
                <div
                  key={item.label}
                  className={`header__nav-item${item.accent ? " header__nav-item--accent" : ""}${
                    isActive ? " is-active" : ""
                  }`}
                  onMouseEnter={() => hasDropdown && handleNavItemEnter(index)}
                >
                  <button
                    type="button"
                    className="header__nav-trigger"
                    aria-expanded={isActive && hasDropdown}
                    aria-controls={hasDropdown ? `mega-${index}` : undefined}
                    onClick={() => {
                      navigate(getNavItemPath(item));
                      if (!hasDropdown) {
                        closeMenu();
                      }
                    }}
                  >
                    {item.label}
                  </button>
                </div>
              );
            })}
          </nav>
          {activeIndex !== null && (() => {
            const activeItem = navMenu[activeIndex];
            const hasContent =
              activeItem &&
              !activeItem.disableDropdown &&
              ((activeItem.columns && activeItem.columns.length > 0) ||
                (activeItem.quickLinks && activeItem.quickLinks.length > 0) ||
                activeItem.highlight);

            if (!hasContent) return null;

            return (
              <div
                className="header__mega"
                id={`mega-${activeIndex}`}
                role="region"
                aria-label={`${activeItem.label} menu`}
                onMouseEnter={() => setActiveIndex(activeIndex)}
              >
                <div className="header__mega-grid">
                  {activeItem.columns?.map((column) => (
                    <div className="header__mega-section" key={column.heading}>
                      <p className="header__mega-heading">{column.heading}</p>
                      <ul>
                        {column.links.map((entry) => (
                          <li key={entry}>
                            <button
                              type="button"
                              className="header__mega-link"
                              onClick={() => {
                                navigate(getNavItemPath(activeItem));
                                closeMenu();
                              }}
                            >
                              {entry}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {activeItem.quickLinks?.length ? (
                    <div className="header__mega-section header__mega-section--quick">
                      <p className="header__mega-heading">Quick links</p>
                      <ul>
                        {activeItem.quickLinks.map((link) => (
                          <li key={link}>
                            <button
                              type="button"
                              className="header__mega-link header__mega-link--quick"
                              onClick={() => {
                                navigate(getNavItemPath(activeItem));
                                closeMenu();
                              }}
                            >
                              {link}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {activeItem.highlight && (
                    <aside className="header__mega-highlight">
                      {activeItem.highlight.eyebrow && (
                        <p className="header__mega-eyebrow">{activeItem.highlight.eyebrow}</p>
                      )}
                      <p className="header__mega-highlight-title">{activeItem.highlight.title}</p>
                      {activeItem.highlight.description && (
                        <p className="header__mega-description">{activeItem.highlight.description}</p>
                      )}
                      {activeItem.highlight.cta && (
                        <button
                          type="button"
                          className="header__mega-cta"
                          onClick={() => {
                            navigate(getNavItemPath(activeItem));
                            closeMenu();
                          }}
                        >
                          {activeItem.highlight.cta}
                        </button>
                      )}
                      {activeItem.highlight.note && (
                        <p className="header__mega-note">
                          {activeItem.highlight.note}
                          {activeItem.highlight.noteCta && (
                            <button
                              type="button"
                              className="header__mega-note-cta"
                              onClick={() => {
                                navigate(getNavItemPath(activeItem));
                                closeMenu();
                              }}
                            >
                              {activeItem.highlight.noteCta}
                            </button>
                          )}
                        </p>
                      )}
                    </aside>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </header>
    </>
  );
}