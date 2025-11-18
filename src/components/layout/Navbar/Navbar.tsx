"use client";

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { PiPackageLight, PiShoppingBagLight, PiUserCircleLight } from "react-icons/pi";
import { useCart } from "../../../context/CartContext";
import {
  clearAuthStatus,
  getAuthStatus,
  subscribeToAuthChanges,
} from "../../../utils/auth";
import { headerStyles } from "../../Header/header.styles";
import type { ShopNavItem } from "../../Shop/shop.data";
import { getNavItemPath, shopNavMenu } from "../../Shop/shop.data";

export const Navbar = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAuthStatus());
  const [searchQuery, setSearchQuery] = useState("");
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextAuthState) => {
      setIsAuthenticated(nextAuthState);
    });
    return () => {
      unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    clearAuthStatus();
    navigate("/login");
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
      return;
    }
    navigate("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleNavItemEnter = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveIndex(index);
  };

  const handleNavItemLeave = () => {
    // Delay closing to allow moving to mega menu
    timeoutRef.current = setTimeout(() => {
      setActiveIndex(null);
    }, 150);
  };

  const handleMegaMenuEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMegaMenuLeave = () => {
    setActiveIndex(null);
  };

  const navigateToItem = (item: ShopNavItem) => {
    navigate(getNavItemPath(item));
    setActiveIndex(null);
  };

  return (
    <>
      <style>{headerStyles}</style>
      <header className="header">
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
          <form className="header__search" onSubmit={handleSearchSubmit}>
            <FiSearch size={16} />
            <input
              type="search"
              aria-label="Search products"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="header__actions">
            <button className="header__action" aria-label="Order tracking" onClick={() => navigate("/profile?tab=orders")}>
              <PiPackageLight size={18} />
            </button>
            <button className="header__profile" aria-label="Account" onClick={handleAccountClick}>
              <PiUserCircleLight size={18} />
            </button>
            <button className="header__icon" aria-label="Shopping bag" onClick={openCart}>
              <PiShoppingBagLight size={18} />
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
            {isAuthenticated && (
              <button
                className="header__action"
                aria-label="Logout"
                onClick={handleLogout}
                style={{ 
                  fontSize: "0.7rem", 
                  padding: "0.4rem 0.8rem",
                  width: "auto",
                  height: "auto",
                  minHeight: "36px"
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
        <div className="header__nav-row" ref={navRowRef}>
          <nav className="header__nav" aria-label="Primary">
            {shopNavMenu.map((item: ShopNavItem, index) => {
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
                  onMouseLeave={handleNavItemLeave}
                >
                  <button
                    type="button"
                    className="header__nav-trigger"
                    aria-expanded={isActive && hasDropdown}
                    aria-controls={hasDropdown ? `mega-${index}` : undefined}
                  onClick={() => navigateToItem(item)}
                  >
                    {item.label}
                  </button>
                </div>
              );
            })}
          </nav>
          {activeIndex !== null && (() => {
            const activeItem = shopNavMenu[activeIndex];
            const hasContent =
              activeItem &&
              !activeItem.disableDropdown &&
              ((activeItem.columns && activeItem.columns.length > 0) ||
                (activeItem.quickLinks && activeItem.quickLinks.length > 0) ||
                activeItem.highlight);

            if (!hasContent) {
              return null;
            }

            return (
              <div
                className="header__mega"
                id={`mega-${activeIndex}`}
                role="region"
                aria-label={`${activeItem.label} menu`}
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
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
                              onClick={() => navigateToItem(activeItem)}
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
                              onClick={() => navigateToItem(activeItem)}
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
                          onClick={() => navigateToItem(activeItem)}
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
                              onClick={() => navigateToItem(activeItem)}
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
};
