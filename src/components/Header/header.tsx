"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { FiMenu, FiX } from "react-icons/fi";
import { PiPackageLight, PiShoppingCartSimpleLight, PiUserCircleLight } from "react-icons/pi";
import { useCart } from "../../context/CartContext";
import { getAuthStatus } from "../../utils/auth";
import { useI18n } from "../../context/I18nContext";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import type { ShopNavItem } from "../Shop/shop.data";
import { getNavItemPath } from "../Shop/shop.data";
import { headerStyles } from "./header.styles";

type HeaderProps = {
  navMenu: ShopNavItem[];
};

export function Header({ navMenu }: HeaderProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const isAuthenticated = getAuthStatus();
  const { t } = useI18n();

  const translateNavLabel = (label: string): string => {
    const labelMap: Record<string, string> = {
      "Shop All": t("nav.shop.all"),
      "Ao Dai": t("nav.ao.dai"),
      "Suiting": t("nav.suiting"),
      "Bridal": t("nav.bridal"),
      "Evening": t("nav.evening"),
      "Conical Hats": t("nav.conical.hats"),
      "Kidswear": t("nav.kidswear"),
      "Gift Procession Sets": t("nav.gift.procession"),
    };
    return labelMap[label] || label;
  };

  const translateColumnHeading = (heading: string): string => {
    const headingMap: Record<string, string> = {
      "Silhouettes": t("nav.column.silhouettes"),
      "Occasions": t("nav.column.occasions"),
      "Categories": t("nav.column.categories"),
      "By moment": t("nav.column.by.moment"),
      "Details": t("nav.column.details"),
      "Editions": t("nav.column.editions"),
      "Straps": t("nav.column.straps"),
      "Pair With": t("nav.column.pair.with"),
      "By Age": t("nav.column.by.age"),
      "Storylines": t("nav.column.storylines"),
      "Gifting": t("nav.column.gifting"),
      "Sets": t("nav.column.sets"),
      "Textures": t("nav.column.textures"),
      "Services": t("nav.column.services"),
    };
    return headingMap[heading] || heading;
  };

  const translateLink = (link: string, categoryLabel: string): string => {
    const category = categoryLabel.toLowerCase();
    
    // Ao Dai links
    if (category.includes("ao dai")) {
      const map: Record<string, string> = {
        "Classic": t("nav.ao.dai.classic"),
        "Modern cut": t("nav.ao.dai.modern.cut"),
        "Minimal": t("nav.ao.dai.minimal"),
        "Layered": t("nav.ao.dai.layered"),
        "Daily wear": t("nav.ao.dai.daily.wear"),
        "Engagement": t("nav.ao.dai.engagement"),
        "Ceremony": t("nav.ao.dai.ceremony"),
        "New Ao Dai": t("nav.ao.dai.new"),
        "Best sellers": t("nav.ao.dai.best.sellers"),
        "View all Ao Dai": t("nav.ao.dai.view.all"),
      };
      return map[link] || link;
    }
    
    // Suiting links
    if (category.includes("suiting")) {
      const map: Record<string, string> = {
        "Full suits": t("nav.suiting.full.suits"),
        "Vests": t("nav.suiting.vests"),
        "Separates": t("nav.suiting.separates"),
        "Office": t("nav.suiting.office"),
        "Ceremony": t("nav.suiting.ceremony"),
        "Black tie": t("nav.suiting.black.tie"),
        "Statement blazers": t("nav.suiting.statement.blazers"),
        "Essential suiting": t("nav.suiting.essential"),
        "View all suiting": t("nav.suiting.view.all"),
      };
      return map[link] || link;
    }
    
    // Bridal links
    if (category.includes("bridal")) {
      const map: Record<string, string> = {
        "Ceremony gowns": t("nav.bridal.ceremony.gowns"),
        "Reception dresses": t("nav.bridal.reception.dresses"),
        "Engagement looks": t("nav.bridal.engagement.looks"),
        "Lace": t("nav.bridal.lace"),
        "Beading": t("nav.bridal.beading"),
        "Minimal satin": t("nav.bridal.minimal.satin"),
        "New bridal": t("nav.bridal.new"),
        "Timelite brides": t("nav.bridal.timelite.brides"),
        "View all bridal": t("nav.bridal.view.all"),
      };
      return map[link] || link;
    }
    
    // Evening links
    if (category.includes("evening")) {
      const map: Record<string, string> = {
        "Column": t("nav.evening.column"),
        "Mermaid": t("nav.evening.mermaid"),
        "A‑line": t("nav.evening.a.line"),
        "Mini": t("nav.evening.mini"),
        "Gala": t("nav.evening.gala"),
        "Cocktail": t("nav.evening.cocktail"),
        "Black tie": t("nav.evening.black.tie"),
        "New evening": t("nav.evening.new"),
        "Embellished gowns": t("nav.evening.embellished"),
        "View all evening": t("nav.evening.view.all"),
      };
      return map[link] || link;
    }
    
    // Conical Hats links
    if (category.includes("conical") || category.includes("hats")) {
      const map: Record<string, string> = {
        "Mother of Pearl": t("nav.hats.mother.of.pearl"),
        "Hand-Painted": t("nav.hats.hand.painted"),
        "Lacquered": t("nav.hats.lacquered"),
        "Velvet Ribbon": t("nav.hats.velvet.ribbon"),
        "Pearl Garland": t("nav.hats.pearl.garland"),
        "Silk Twist": t("nav.hats.silk.twist"),
        "Heritage Ao Dai": t("nav.hats.heritage.ao.dai"),
        "Modern Suit": t("nav.hats.modern.suit"),
        "Editorial Looks": t("nav.hats.editorial.looks"),
        "Custom Engraving": t("nav.hats.custom.engraving"),
        "Collector Sets": t("nav.hats.collector.sets"),
      };
      return map[link] || link;
    }
    
    // Kidswear links
    if (category.includes("kidswear")) {
      const map: Record<string, string> = {
        "Infant": t("nav.kidswear.infant"),
        "Toddler": t("nav.kidswear.toddler"),
        "Little Muse (6-10)": t("nav.kidswear.little.muse"),
        "Young Muse (11-14)": t("nav.kidswear.young.muse"),
        "Festive Bloom": t("nav.kidswear.festive.bloom"),
        "Mini Maestro": t("nav.kidswear.mini.maestro"),
        "Garden Party": t("nav.kidswear.garden.party"),
        "Keepsake Boxes": t("nav.kidswear.keepsake.boxes"),
        "Accessories": t("nav.kidswear.accessories"),
        "Sibling Sets": t("nav.kidswear.sibling.sets"),
      };
      return map[link] || link;
    }
    
    // Gift Procession Sets links
    if (category.includes("gift") || category.includes("procession")) {
      const map: Record<string, string> = {
        "Eight Tray": t("nav.gift.eight.tray"),
        "Ten Tray": t("nav.gift.ten.tray"),
        "Twelve Tray": t("nav.gift.twelve.tray"),
        "Velvet": t("nav.gift.velvet"),
        "Mother of Pearl": t("nav.gift.mother.of.pearl"),
        "Bamboo Inlay": t("nav.gift.bamboo.inlay"),
        "Styling Crew": t("nav.gift.styling.crew"),
        "Custom Engraving": t("nav.gift.custom.engraving"),
        "Venue Logistics": t("nav.gift.venue.logistics"),
      };
      return map[link] || link;
    }
    
    return link;
  };

  const translateHighlight = (text: string, categoryLabel: string, type: "eyebrow" | "title" | "description" | "cta"): string => {
    const category = categoryLabel.toLowerCase();
    
    // Ao Dai highlight
    if (category.includes("ao dai")) {
      if (type === "eyebrow" && text === "Signature drop") return t("nav.ao.dai.signature.drop");
      if (type === "title" && text === "Timelite Ao Dai Capsule") return t("nav.ao.dai.capsule.title");
      if (type === "description" && text.includes("Curated looks")) return t("nav.ao.dai.capsule.description");
      if (type === "cta" && text === "Shop Ao Dai capsule") return t("nav.ao.dai.capsule.cta");
    }
    
    // Suiting highlight
    if (category.includes("suiting")) {
      if (type === "title" && text === "Tailored for movement") return t("nav.suiting.tailored.title");
      if (type === "description" && text.includes("Lightweight structures")) return t("nav.suiting.tailored.description");
    }
    
    // Bridal highlight
    if (category.includes("bridal")) {
      if (type === "eyebrow" && text === "Bridal studio") return t("nav.bridal.studio");
      if (type === "title" && text === "Book a fitting") return t("nav.bridal.book.fitting");
      if (type === "description" && text.includes("Explore silhouettes")) return t("nav.bridal.fitting.description");
      if (type === "cta" && text === "Explore bridal") return t("nav.bridal.explore");
    }
    
    // Evening highlight
    if (category.includes("evening")) {
      if (type === "title" && text === "Evening edit") return t("nav.evening.edit.title");
      if (type === "description" && text.includes("Statement pieces")) return t("nav.evening.edit.description");
    }
    
    // Kidswear highlight
    if (category.includes("kidswear")) {
      if (type === "eyebrow" && text === "Mini Atelier") return t("nav.kidswear.mini.atelier");
      if (type === "title" && text === "Custom Sibling Sets") return t("nav.kidswear.custom.sibling.title");
      if (type === "description" && text.includes("Coordinated looks")) return t("nav.kidswear.custom.sibling.description");
      if (type === "cta" && text === "Plan styling") return t("nav.kidswear.plan.styling");
    }
    
    // Gift Procession Sets highlight
    if (category.includes("gift") || category.includes("procession")) {
      if (type === "eyebrow" && text === "Concierge Team") return t("nav.gift.concierge.team");
      if (type === "title" && text === "Complete Planning") return t("nav.gift.complete.planning.title");
      if (type === "description" && text.includes("Full procession")) return t("nav.gift.complete.planning.description");
      if (type === "cta" && text === "Meet the team") return t("nav.gift.meet.team");
    }
    
    return text;
  };

  const handleNavItemEnter = (index: number) => {
    setActiveIndex(index);
  };

  const closeMenu = () => {
    setActiveIndex(null);
    setIsMobileNavOpen(false);
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  const headerClassNames = ["header"];
  if (activeIndex !== null) headerClassNames.push("header--dropdown-open");
  if (isMobileNavOpen) headerClassNames.push("header--mobile-open");

  const handleNavigateToItem = (item: ShopNavItem) => {
    navigate(getNavItemPath(item));
    closeMenu();
  };

  return (
    <>
      <style>{headerStyles}</style>
      <header className={headerClassNames.join(" ")}>
        <div className="header__top">
          <div className="header__brand">
            <span className="header__brand-mark">
              <img
                className="header__brand-logo"
                src="/Image/Logo.png"
                alt={t("header.logo.alt")}
              />
            </span>
            <span className="header__brand-name" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              Timelitecloting
            </span>
          </div>
          <div className="header__search">
            <FiSearch size={16} />
            <input type="search" aria-label={t("profile.search.products")} placeholder={t("header.search.placeholder")} />
          </div>
          <div className="header__actions">
            {/* LanguageSwitcher disabled - Vietnamese only */}
            <button className="header__action" aria-label={t("header.order.tracking")} onClick={() => navigate("/profile?tab=orders")}>
              <PiPackageLight size={22} />
            </button>
            <button className="header__profile" aria-label={t("header.account")} onClick={handleAccountClick}>
              <PiUserCircleLight size={22} />
            </button>
            <button className="header__icon" aria-label={t("header.shopping.bag")} onClick={openCart}>
              <PiShoppingCartSimpleLight size={22} />
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
          <button
            type="button"
            className="header__mobile-toggle"
            aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileNavOpen}
            onClick={toggleMobileNav}
          >
            {isMobileNavOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            <span>{isMobileNavOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
        <div className={`header__nav-row${isMobileNavOpen ? " header__nav-row--mobile-open" : ""}`} onMouseLeave={closeMenu}>
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
                      handleNavigateToItem(item);
                      if (!hasDropdown) {
                        closeMenu();
                      }
                    }}
                  >
                    {translateNavLabel(item.label)}
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
                      <p className="header__mega-heading">{translateColumnHeading(column.heading)}</p>
                      <ul>
                        {column.links.map((entry) => (
                          <li key={entry}>
                            <button
                              type="button"
                              className="header__mega-link"
                              onClick={() => {
                                handleNavigateToItem(activeItem);
                              }}
                            >
                              {translateLink(entry, activeItem.label)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {activeItem.quickLinks?.length ? (
                    <div className="header__mega-section header__mega-section--quick">
                      <p className="header__mega-heading">{t("nav.quick.links")}</p>
                      <ul>
                        {activeItem.quickLinks.map((link) => (
                          <li key={link}>
                            <button
                              type="button"
                              className="header__mega-link header__mega-link--quick"
                              onClick={() => {
                                handleNavigateToItem(activeItem);
                              }}
                            >
                              {translateLink(link, activeItem.label)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {activeItem.highlight && (
                    <aside className="header__mega-highlight">
                      {activeItem.highlight.eyebrow && (
                        <p className="header__mega-eyebrow">{translateHighlight(activeItem.highlight.eyebrow, activeItem.label, "eyebrow")}</p>
                      )}
                      <p className="header__mega-highlight-title">{translateHighlight(activeItem.highlight.title, activeItem.label, "title")}</p>
                      {activeItem.highlight.description && (
                        <p className="header__mega-description">{translateHighlight(activeItem.highlight.description, activeItem.label, "description")}</p>
                      )}
                      {activeItem.highlight.cta && (
                        <button
                          type="button"
                          className="header__mega-cta"
                          onClick={() => {
                            handleNavigateToItem(activeItem);
                          }}
                        >
                          {translateHighlight(activeItem.highlight.cta, activeItem.label, "cta")}
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
                                handleNavigateToItem(activeItem);
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