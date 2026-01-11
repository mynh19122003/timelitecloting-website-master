"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { FiMenu, FiX } from "react-icons/fi";
import {
  PiPackageLight,
  PiShoppingCartSimpleLight,
  PiUserCircleLight,
} from "react-icons/pi";
import { useCart } from "../../../context/CartContext";
import {
  clearAuthStatus,
  getAuthStatus,
  subscribeToAuthChanges,
} from "../../../utils/auth";
import { useI18n } from "../../../context/I18nContext";
import { headerStyles } from "../../Header/header.styles";
import type { ShopNavItem, ShopNavColumn } from "../../Shop/shop.data";
import {
  getNavItemPath,
  shopNavMenu,
  toCategorySlug,
} from "../../Shop/shop.data";
import {
  getVariantsByCategory,
  getVariantsByCategorySync,
  type VariantsByCategory,
} from "../../../services/variantsService";

type NavLinkParamMap = Record<
  string,
  Record<string, Record<string, string> | null>
>;

const normalizeNavKey = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const navLinkParamMap: NavLinkParamMap = {
  "ao-dai": {
    "view-all-ao-dai": null,
    "shop-ao-dai-capsule": { facet: "Ao Dai Capsule" },
  },
  suits: {
    "view-all-suits": null,
  },
  "bridal-formal-dresses": {
    "view-all-bridal-formal": null,
    "explore-bridal": { facet: "Wedding Dresses" },
  },
  accessories: {
    "view-all-accessories": null,
  },
  "lunar-new-year-decor": {
    "view-all-lunar-decor": null,
  },
  "ceremonial-attire": {
    "view-all-ceremonial-attire": null,
  },
  "uniforms-teamwear": {
    "view-all-uniforms": null,
  },
  "wedding-gift-trays": {
    "view-all-sets": null,
  },
};

export const Navbar = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAuthStatus());
  const [searchQuery, setSearchQuery] = useState("");
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const { t } = useI18n();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRowRef = useRef<HTMLDivElement>(null);

  // Dynamic variants loaded from API
  const [variantsByCategory, setVariantsByCategory] =
    useState<VariantsByCategory>(getVariantsByCategorySync());

  // Helper function to determine which column a variant belongs to
  const getColumnIndexForVariant = (
    variant: string,
    columns: ShopNavColumn[]
  ): number => {
    const lowerVariant = variant.toLowerCase();

    // Check each column's heading and existing links for best match
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      const heading = col.heading.toLowerCase();

      // === AO DAI CATEGORIES ===
      // Men's column detection
      if (heading.includes("men") && !heading.includes("women")) {
        if (
          lowerVariant.includes("(men)") ||
          lowerVariant.includes("men's") ||
          lowerVariant.includes("father") ||
          (lowerVariant.includes("boy") && !lowerVariant.includes("girls"))
        ) {
          return i;
        }
      }

      // Women's column detection
      if (heading.includes("women") || heading.includes("women's")) {
        if (
          lowerVariant.includes("(women)") ||
          lowerVariant.includes("women's") ||
          lowerVariant.includes("bridal") ||
          lowerVariant.includes("girl")
        ) {
          return i;
        }
      }

      // Heritage & Family / Family column detection
      if (heading.includes("family") || heading.includes("heritage")) {
        if (
          lowerVariant.includes("mother") ||
          lowerVariant.includes("daughter") ||
          lowerVariant.includes("father") ||
          lowerVariant.includes("son") ||
          lowerVariant.includes("family") ||
          lowerVariant.includes("matching") ||
          lowerVariant.includes("set")
        ) {
          return i;
        }
      }

      // === SUITS CATEGORIES ===
      // Tailoring column
      if (heading.includes("tailoring") || heading.includes("suit")) {
        if (
          lowerVariant.includes("suit") ||
          lowerVariant.includes("blazer") ||
          lowerVariant.includes("jacket")
        ) {
          return i;
        }
      }

      // Vest column
      if (heading.includes("vest")) {
        if (lowerVariant.includes("vest")) {
          return i;
        }
      }

      // === BRIDAL CATEGORIES ===
      // By moment column
      if (heading.includes("moment") || heading.includes("occasion")) {
        if (
          lowerVariant.includes("wedding") ||
          lowerVariant.includes("party") ||
          lowerVariant.includes("gala") ||
          lowerVariant.includes("reception")
        ) {
          return i;
        }
      }

      // Specialty column
      if (heading.includes("specialty") || heading.includes("special")) {
        if (
          lowerVariant.includes("pageant") ||
          lowerVariant.includes("bridesmaid") ||
          lowerVariant.includes("prom")
        ) {
          return i;
        }
      }

      // === ACCESSORIES CATEGORIES ===
      // Iconic pieces
      if (heading.includes("iconic") || heading.includes("main")) {
        if (
          lowerVariant.includes("hat") ||
          lowerVariant.includes("bag") ||
          lowerVariant.includes("clutch") ||
          lowerVariant.includes("sandal")
        ) {
          return i;
        }
      }

      // Finishing touches
      if (heading.includes("finishing") || heading.includes("touch")) {
        if (
          lowerVariant.includes("collar") ||
          lowerVariant.includes("turban") ||
          lowerVariant.includes("heel") ||
          lowerVariant.includes("shoe")
        ) {
          return i;
        }
      }

      // === LUNAR NEW YEAR DÉCOR ===
      // Décor highlights
      if (heading.includes("décor") || heading.includes("highlight")) {
        if (
          lowerVariant.includes("backdrop") ||
          lowerVariant.includes("blossom") ||
          lowerVariant.includes("mai") ||
          lowerVariant.includes("peach")
        ) {
          return i;
        }
      }

      // Accents
      if (heading.includes("accent")) {
        if (
          lowerVariant.includes("calligraphy") ||
          lowerVariant.includes("envelope") ||
          lowerVariant.includes("lantern")
        ) {
          return i;
        }
      }

      // === CEREMONIAL ATTIRE ===
      // Women ceremonial
      if (heading === "women") {
        if (
          lowerVariant.includes("(women)") ||
          lowerVariant.includes("women's") ||
          lowerVariant.includes("pilgrimage")
        ) {
          return i;
        }
      }

      // Men ceremonial
      if (heading === "men") {
        if (lowerVariant.includes("(men)") || lowerVariant.includes("men's")) {
          return i;
        }
      }

      // === UNIFORMS ===
      // Schools & Choirs
      if (heading.includes("school") || heading.includes("choir")) {
        if (
          lowerVariant.includes("school") ||
          lowerVariant.includes("choir") ||
          lowerVariant.includes("church")
        ) {
          return i;
        }
      }

      // Hospitality & Retail
      if (heading.includes("hospitality") || heading.includes("retail")) {
        if (
          lowerVariant.includes("restaurant") ||
          lowerVariant.includes("retail") ||
          lowerVariant.includes("hotel")
        ) {
          return i;
        }
      }

      // Teams & Workshops
      if (heading.includes("team") || heading.includes("workshop")) {
        if (
          lowerVariant.includes("factory") ||
          lowerVariant.includes("workshop") ||
          lowerVariant.includes("team")
        ) {
          return i;
        }
      }

      // === WEDDING GIFT TRAYS ===
      // Trays & Sets
      if (heading.includes("tray") || heading.includes("set")) {
        if (
          lowerVariant.includes("tray") ||
          lowerVariant.includes("eight") ||
          lowerVariant.includes("ten") ||
          lowerVariant.includes("twelve")
        ) {
          return i;
        }
      }

      // Styles
      if (heading.includes("style")) {
        if (
          lowerVariant.includes("velvet") ||
          lowerVariant.includes("pearl") ||
          lowerVariant.includes("bamboo") ||
          lowerVariant.includes("lacquer")
        ) {
          return i;
        }
      }

      // Services
      if (heading.includes("service")) {
        if (
          lowerVariant.includes("styling") ||
          lowerVariant.includes("engraving") ||
          lowerVariant.includes("logistics") ||
          lowerVariant.includes("delivery")
        ) {
          return i;
        }
      }

      // === KIDSWEAR / CHILDREN ===
      if (
        heading.includes("kid") ||
        heading.includes("children") ||
        heading.includes("youth") ||
        heading.includes("age")
      ) {
        if (
          lowerVariant.includes("girl") ||
          lowerVariant.includes("boy") ||
          lowerVariant.includes("kid") ||
          lowerVariant.includes("infant") ||
          lowerVariant.includes("toddler") ||
          lowerVariant.includes("young") ||
          lowerVariant.includes("little")
        ) {
          return i;
        }
      }
    }

    // Default: first column
    return 0;
  };

  // Build nav menu with dynamic variants merged into correct columns
  const navItems = useMemo(() => {
    return shopNavMenu.map((item) => {
      // Only merge for items that have columns and a categorySlug
      if (!item.columns || !item.categorySlug) return item;

      const apiVariants = variantsByCategory[item.categorySlug] || [];
      if (apiVariants.length === 0) return item;

      // Create a map to collect variants for each column
      const columnVariantsMap: Map<number, string[]> = new Map();

      // Distribute API variants to correct columns
      apiVariants
        .filter((v) => !v.includes("(All)"))
        .forEach((variant) => {
          const colIndex = getColumnIndexForVariant(variant, item.columns!);
          if (!columnVariantsMap.has(colIndex)) {
            columnVariantsMap.set(colIndex, []);
          }
          columnVariantsMap.get(colIndex)!.push(variant);
        });

      // Merge variants into their respective columns
      const updatedColumns = item.columns.map((col, idx) => {
        const newVariants = columnVariantsMap.get(idx) || [];
        if (newVariants.length === 0) return col;

        // Avoid duplicates
        const existingLinks = new Set(col.links.map((l) => l.toLowerCase()));
        const uniqueNewLinks = newVariants.filter(
          (v) => !existingLinks.has(v.toLowerCase())
        );

        return {
          ...col,
          links: [...col.links, ...uniqueNewLinks],
        };
      });

      return { ...item, columns: updatedColumns };
    });
  }, [variantsByCategory]);

  // Fetch variants from API on mount
  useEffect(() => {
    let isMounted = true;
    getVariantsByCategory().then((data) => {
      if (isMounted) {
        setVariantsByCategory(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

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

  const buildShopDestination = (
    item: ShopNavItem,
    extraParams?: Record<string, string>
  ): string => {
    const basePath = getNavItemPath(item);
    const [pathname, search] = basePath.split("?");
    const params = new URLSearchParams(search ?? "");

    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
    }

    const queryString = params.toString();
    return `${pathname}${queryString ? `?${queryString}` : ""}`;
  };

  const closeAllMenus = () => {
    setActiveIndex(null);
    setIsMobileNavOpen(false);
  };

  const navigateToItem = (
    item: ShopNavItem,
    extraParams?: Record<string, string>
  ) => {
    const target = buildShopDestination(item, extraParams);
    navigate(target);
    closeAllMenus();
  };

  const getNavLinkParams = (
    itemLabel: string,
    linkLabel: string
  ): Record<string, string> | undefined => {
    const itemKey = normalizeNavKey(itemLabel);
    const linkKey = normalizeNavKey(linkLabel);
    const config = navLinkParamMap[itemKey]?.[linkKey];

    // Check explicit config first
    if (config === null) {
      return undefined;
    }
    if (config) {
      return config;
    }

    // Special handling for Wedding Gift Trays (use chip/tag instead of variant)
    if (itemKey === "wedding-gift-trays") {
      return { facet: linkLabel, chip: linkLabel };
    }

    // Default: treat link as a variant filter
    return { facet: linkLabel, variant: linkLabel };
  };

  const handleNavLinkClick = (item: ShopNavItem, entry: string) => {
    const params = getNavLinkParams(item.label, entry);
    navigateToItem(item, params);
  };

  const translateNavLabel = (label: string): string => {
    const labelMap: Record<string, string> = {
      "Shop All": t("nav.shop.all"),
      "Ao Dai": t("nav.ao.dai"),
      Suiting: t("nav.suiting"),
      Bridal: t("nav.bridal"),
      Evening: t("nav.evening"),
      "Conical Hats": t("nav.conical.hats"),
      Kidswear: t("nav.kidswear"),
      "Gift Procession Sets": t("nav.gift.procession"),
    };
    return labelMap[label] || label;
  };

  const translateColumnHeading = (heading: string): string => {
    const headingMap: Record<string, string> = {
      Silhouettes: t("nav.column.silhouettes"),
      Occasions: t("nav.column.occasions"),
      Categories: t("nav.column.categories"),
      "By moment": t("nav.column.by.moment"),
      Details: t("nav.column.details"),
      Editions: t("nav.column.editions"),
      Straps: t("nav.column.straps"),
      "Pair With": t("nav.column.pair.with"),
      "By Age": t("nav.column.by.age"),
      Storylines: t("nav.column.storylines"),
      Gifting: t("nav.column.gifting"),
      Sets: t("nav.column.sets"),
      Textures: t("nav.column.textures"),
      Services: t("nav.column.services"),
    };
    return headingMap[heading] || heading;
  };

  const translateLink = (link: string, categoryLabel: string): string => {
    const category = categoryLabel.toLowerCase();

    // Ao Dai links
    if (category.includes("ao dai")) {
      const map: Record<string, string> = {
        Classic: t("nav.ao.dai.classic"),
        "Modern cut": t("nav.ao.dai.modern.cut"),
        Minimal: t("nav.ao.dai.minimal"),
        Layered: t("nav.ao.dai.layered"),
        "Daily wear": t("nav.ao.dai.daily.wear"),
        Engagement: t("nav.ao.dai.engagement"),
        Ceremony: t("nav.ao.dai.ceremony"),
        "New Ao Dai": t("nav.ao.dai.new"),
        "Best sellers": t("nav.ao.dai.best.sellers"),
        "View all Ao Dai": t("nav.ao.dai.view.all"),
      };
      return map[link] || link;
    }

    // Suiting links
    if (category.includes("suit")) {
      const map: Record<string, string> = {
        "Full suits": t("nav.suiting.full.suits"),
        Vests: t("nav.suiting.vests"),
        Separates: t("nav.suiting.separates"),
        Office: t("nav.suiting.office"),
        Ceremony: t("nav.suiting.ceremony"),
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
        Lace: t("nav.bridal.lace"),
        Beading: t("nav.bridal.beading"),
        "Minimal satin": t("nav.bridal.minimal.satin"),
        "New bridal": t("nav.bridal.new"),
        "Timelite brides": t("nav.bridal.timelite.brides"),
        "View all bridal": t("nav.bridal.view.all"),
      };
      return map[link] || link;
    }

    // Evening links
    if (category.includes("formal") || category.includes("evening")) {
      const map: Record<string, string> = {
        Column: t("nav.evening.column"),
        Mermaid: t("nav.evening.mermaid"),
        "A‑line": t("nav.evening.a.line"),
        Mini: t("nav.evening.mini"),
        Gala: t("nav.evening.gala"),
        Cocktail: t("nav.evening.cocktail"),
        "Black tie": t("nav.evening.black.tie"),
        "New evening": t("nav.evening.new"),
        "Embellished gowns": t("nav.evening.embellished"),
        "View all evening": t("nav.evening.view.all"),
      };
      return map[link] || link;
    }

    // Conical Hats links
    if (
      category.includes("conical") ||
      category.includes("hats") ||
      category.includes("accessor")
    ) {
      const map: Record<string, string> = {
        "Mother of Pearl": t("nav.hats.mother.of.pearl"),
        "Hand-Painted": t("nav.hats.hand.painted"),
        Lacquered: t("nav.hats.lacquered"),
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
        Infant: t("nav.kidswear.infant"),
        Toddler: t("nav.kidswear.toddler"),
        "Little Muse (6-10)": t("nav.kidswear.little.muse"),
        "Young Muse (11-14)": t("nav.kidswear.young.muse"),
        "Festive Bloom": t("nav.kidswear.festive.bloom"),
        "Mini Maestro": t("nav.kidswear.mini.maestro"),
        "Garden Party": t("nav.kidswear.garden.party"),
        "Keepsake Boxes": t("nav.kidswear.keepsake.boxes"),
        Accessories: t("nav.kidswear.accessories"),
        "Sibling Sets": t("nav.kidswear.sibling.sets"),
      };
      return map[link] || link;
    }

    // Gift Procession Sets links
    if (
      category.includes("gift") ||
      category.includes("procession") ||
      category.includes("lunar")
    ) {
      const map: Record<string, string> = {
        "Eight Tray": t("nav.gift.eight.tray"),
        "Ten Tray": t("nav.gift.ten.tray"),
        "Twelve Tray": t("nav.gift.twelve.tray"),
        Velvet: t("nav.gift.velvet"),
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

  const translateHighlight = (
    text: string,
    categoryLabel: string,
    type: "eyebrow" | "title" | "description" | "cta"
  ): string => {
    const category = categoryLabel.toLowerCase();

    // Ao Dai highlight
    if (category.includes("ao dai")) {
      if (type === "eyebrow" && text === "Signature drop")
        return t("nav.ao.dai.signature.drop");
      if (type === "title" && text === "Timelite Ao Dai Capsule")
        return t("nav.ao.dai.capsule.title");
      if (type === "description" && text.includes("Curated looks"))
        return t("nav.ao.dai.capsule.description");
      if (type === "cta" && text === "Shop Ao Dai capsule")
        return t("nav.ao.dai.capsule.cta");
    }

    // Suiting highlight
    if (category.includes("suiting") || category.includes("suit")) {
      if (type === "title" && text === "Tailored for movement")
        return t("nav.suiting.tailored.title");
      if (type === "description" && text.includes("Lightweight structures"))
        return t("nav.suiting.tailored.description");
    }

    // Bridal highlight
    if (category.includes("bridal")) {
      if (type === "eyebrow" && text === "Bridal studio")
        return t("nav.bridal.studio");
      if (type === "title" && text === "Book a fitting")
        return t("nav.bridal.book.fitting");
      if (type === "description" && text.includes("Explore silhouettes"))
        return t("nav.bridal.fitting.description");
      if (type === "cta" && text === "Explore bridal")
        return t("nav.bridal.explore");
    }

    // Evening highlight
    if (category.includes("evening")) {
      if (type === "title" && text === "Evening edit")
        return t("nav.evening.edit.title");
      if (type === "description" && text.includes("Statement pieces"))
        return t("nav.evening.edit.description");
    }

    // Kidswear highlight
    if (category.includes("kidswear")) {
      if (type === "eyebrow" && text === "Mini Atelier")
        return t("nav.kidswear.mini.atelier");
      if (type === "title" && text === "Custom Sibling Sets")
        return t("nav.kidswear.custom.sibling.title");
      if (type === "description" && text.includes("Coordinated looks"))
        return t("nav.kidswear.custom.sibling.description");
      if (type === "cta" && text === "Plan styling")
        return t("nav.kidswear.plan.styling");
    }

    // Gift Procession Sets highlight
    if (
      category.includes("gift") ||
      category.includes("procession") ||
      category.includes("lunar")
    ) {
      if (type === "eyebrow" && text === "Concierge Team")
        return t("nav.gift.concierge.team");
      if (type === "title" && text === "Complete Planning")
        return t("nav.gift.complete.planning.title");
      if (type === "description" && text.includes("Full procession"))
        return t("nav.gift.complete.planning.description");
      if (type === "cta" && text === "Meet the team")
        return t("nav.gift.meet.team");
    }

    return text;
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  const headerClassNames = ["header"];
  if (activeIndex !== null) {
    headerClassNames.push("header--dropdown-open");
  }
  if (isMobileNavOpen) {
    headerClassNames.push("header--mobile-open");
  }

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
            <span
              className="header__brand-name"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            >
              Timelitecloting
            </span>
          </div>
          <form className="header__search" onSubmit={handleSearchSubmit}>
            <FiSearch size={14} />
            <input
              type="search"
              aria-label={t("profile.search.products")}
              placeholder={t("header.search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <div className="header__actions">
            <button
              className="header__action"
              aria-label={t("header.order.tracking")}
              onClick={() => navigate(isAuthenticated ? "/profile?tab=orders" : "/order-lookup")}
            >
              <PiPackageLight size={18} />
            </button>
            <button
              className="header__profile"
              aria-label={t("header.account")}
              onClick={handleAccountClick}
            >
              <PiUserCircleLight size={18} />
            </button>
            <button
              className="header__icon"
              aria-label={t("header.shopping.bag")}
              onClick={openCart}
            >
              <PiShoppingCartSimpleLight size={18} />
              {itemCount > 0 && (
                <span
                  style={{
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
                    fontWeight: "600",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </button>
            {isAuthenticated && (
              <button
                className="header__action"
                aria-label={t("auth.logout") || "Logout"}
                onClick={handleLogout}
                style={{
                  fontSize: "0.7rem",
                  padding: "0.4rem 0.8rem",
                  width: "auto",
                  height: "auto",
                  minHeight: "36px",
                }}
              >
                Logout
              </button>
            )}
          </div>
          <button
            type="button"
            className="header__mobile-toggle"
            aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileNavOpen}
            onClick={toggleMobileNav}
          >
            {isMobileNavOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            <span>{isMobileNavOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
        <div
          className={`header__nav-row${
            isMobileNavOpen ? " header__nav-row--mobile-open" : ""
          }`}
          ref={navRowRef}
        >
          <nav className="header__nav" aria-label="Primary">
            {navItems.map((item: ShopNavItem, index) => {
              const hasDropdown =
                !item.disableDropdown &&
                ((item.columns && item.columns.length > 0) ||
                  (item.quickLinks && item.quickLinks.length > 0) ||
                  item.highlight);
              const isActive = activeIndex === index;

              return (
                <div
                  key={item.label}
                  className={`header__nav-item${
                    item.accent ? " header__nav-item--accent" : ""
                  }${isActive ? " is-active" : ""}`}
                  onMouseEnter={() => hasDropdown && handleNavItemEnter(index)}
                  onMouseLeave={handleNavItemLeave}
                >
                  <button
                    type="button"
                    className="header__nav-trigger"
                    aria-expanded={!!(isActive && hasDropdown)}
                    aria-controls={hasDropdown ? `mega-${index}` : undefined}
                    onClick={() => navigateToItem(item)}
                  >
                    {translateNavLabel(item.label)}
                  </button>
                </div>
              );
            })}
          </nav>
          {activeIndex !== null &&
            (() => {
              const activeItem = navItems[activeIndex];
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
                      <div
                        className="header__mega-section"
                        key={column.heading}
                      >
                        <p className="header__mega-heading">
                          {translateColumnHeading(column.heading)}
                        </p>
                        <ul>
                          {column.links.map((entry) => (
                            <li key={entry}>
                              <button
                                type="button"
                                className="header__mega-link"
                                onClick={() =>
                                  handleNavLinkClick(activeItem, entry)
                                }
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
                        <p className="header__mega-heading">
                          {t("nav.quick.links")}
                        </p>
                        <ul>
                          {activeItem.quickLinks.map((link) => (
                            <li key={link}>
                              <button
                                type="button"
                                className="header__mega-link header__mega-link--quick"
                                onClick={() =>
                                  handleNavLinkClick(activeItem, link)
                                }
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
                          <p className="header__mega-eyebrow">
                            {translateHighlight(
                              activeItem.highlight.eyebrow,
                              activeItem.label,
                              "eyebrow"
                            )}
                          </p>
                        )}
                        <p className="header__mega-highlight-title">
                          {translateHighlight(
                            activeItem.highlight.title,
                            activeItem.label,
                            "title"
                          )}
                        </p>
                        {activeItem.highlight.description && (
                          <p className="header__mega-description">
                            {translateHighlight(
                              activeItem.highlight.description,
                              activeItem.label,
                              "description"
                            )}
                          </p>
                        )}
                        {activeItem.highlight.cta && (
                          <button
                            type="button"
                            className="header__mega-cta"
                            onClick={() =>
                              activeItem.highlight?.cta &&
                              handleNavLinkClick(
                                activeItem,
                                activeItem.highlight.cta
                              )
                            }
                          >
                            {translateHighlight(
                              activeItem.highlight.cta,
                              activeItem.label,
                              "cta"
                            )}
                          </button>
                        )}
                        {activeItem.highlight.note && (
                          <p className="header__mega-note">
                            {activeItem.highlight.note}
                            {activeItem.highlight.noteCta && (
                              <button
                                type="button"
                                className="header__mega-note-cta"
                                onClick={() =>
                                  activeItem.highlight?.noteCta &&
                                  handleNavLinkClick(
                                    activeItem,
                                    activeItem.highlight.noteCta
                                  )
                                }
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
        <div
          className={`header__mobile-overlay${
            isMobileNavOpen ? " header__mobile-overlay--visible" : ""
          }`}
          onClick={closeAllMenus}
          aria-hidden={!isMobileNavOpen}
        />
      </header>
    </>
  );
};
