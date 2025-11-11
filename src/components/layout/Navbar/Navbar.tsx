"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
  FiPackage,
  FiLogOut,
  FiUserPlus,
} from "react-icons/fi";
import { useCart } from "../../../context/CartContext";
import {
  clearAuthStatus,
  getAuthStatus,
  subscribeToAuthChanges,
} from "../../../utils/auth";
import { type Product, normalizeCategory } from "../../../data/products";
import ApiService from "../../../services/api";
import styles from "./Navbar.module.css";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Contact", to: "/contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAuthStatus());
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const accountRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextAuthState) => {
      setIsAuthenticated(nextAuthState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!accountOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (open) {
      setAccountOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!searchOpen) {
      document.body.style.removeProperty("overflow");
      setSearchTerm("");
      setSearchResults([]);
      return;
    }

    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.removeProperty("overflow");
    };
  }, [searchOpen]);

  // Live search against backend (debounced)
  useEffect(() => {
    const term = searchTerm.trim();
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    let isActive = true;
    const timer = window.setTimeout(async () => {
      try {
        const res = await ApiService.getProducts({ limit: 6, search: term });
        const list = Array.isArray(res?.products) ? res.products : [];
        if (!isActive) return;
        const mapped: Product[] = list.map((p: any) => {
          const id: string = (p.slug ?? p.product_id ?? p.products_id ?? p.id ?? "").toString();
          const category = normalizeCategory((p.category ?? p.category_label ?? "").toString());
          const price = Number(p.price ?? 0);
          return {
            id,
            name: String(p.name ?? ""),
            category: category as any,
            shortDescription: String(p.short_description ?? ""),
            description: String(p.description ?? ""),
            price,
            originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
            colors: [],
            sizes: ["S", "M", "L"],
            image: "",
            gallery: [],
            rating: 0,
            reviews: 0,
            tags: Array.isArray(p.tags) ? p.tags : [],
            isFeatured: Boolean(p.is_featured ?? false),
            isNew: Boolean(p.is_new ?? false),
            pid: typeof p.products_id === "number" ? `pid${p.products_id}` : undefined,
          };
        });
        setSearchResults(mapped);
      } catch {
        if (isActive) setSearchResults([]);
      }
    }, 250);
    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleLogout = () => {
    clearAuthStatus();
    setAccountOpen(false);
    navigate("/login");
  };

  const handleSearchSelect = (productId: string) => {
    setSearchOpen(false);
    setOpen(false);
    setAccountOpen(false);
    setSearchTerm("");
    navigate(`/product/${productId}`);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchResults.length > 0) {
      handleSearchSelect(searchResults[0].pid || searchResults[0].id);
    }
  };

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div
            className={styles.brand}
            onClick={() => navigate("/")}
            aria-label="Timelite Couture home"
          >
            Timelite
          </div>

        <nav className={styles.navDesktop}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`.trim()
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actionsDesktop}>
          <button
            type="button"
            aria-label="Search"
            className={styles.iconButton}
            onClick={() => {
              setSearchOpen(true);
              setOpen(false);
              setAccountOpen(false);
            }}
          >
            <FiSearch className={styles.icon} />
          </button>
          <div className={styles.accountWrapper} ref={accountRef}>
            <button
              type="button"
              aria-label="Account menu"
              aria-haspopup="true"
              aria-expanded={accountOpen}
              className={`${styles.accountButton} ${
                accountOpen ? styles.accountButtonActive : ""
              }`.trim()}
              onClick={() => setAccountOpen((prev) => !prev)}
            >
              <FiUser className={styles.icon} />
            </button>
            {accountOpen && (
              <div className={styles.accountDropdown} role="menu">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setAccountOpen(false)}
                      className={styles.accountItem}
                    >
                      <FiUser className={styles.accountItemIcon} />
                      <span>Manage My Account</span>
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setAccountOpen(false)}
                      className={styles.accountItem}
                    >
                      <FiPackage className={styles.accountItemIcon} />
                      <span>My Order</span>
                    </Link>
                    <button
                      type="button"
                      className={`${styles.accountItem} ${styles.accountLogout}`}
                      onClick={handleLogout}
                    >
                      <FiLogOut className={styles.accountItemIcon} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setAccountOpen(false)}
                      className={styles.accountItem}
                    >
                      <FiUser className={styles.accountItemIcon} />
                      <span>Log in</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setAccountOpen(false)}
                      className={styles.accountItem}
                    >
                      <FiUserPlus className={styles.accountItemIcon} />
                      <span>Create account</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          <button
            onClick={openCart}
            aria-label="Cart"
            className={styles.cartButton}
          >
            <FiShoppingBag className={styles.icon} />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
        </div>

        <button
          aria-label="Toggle navigation"
          className={styles.toggleButton}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <FiX className={styles.icon} /> : <FiMenu className={styles.icon} />}
        </button>
      </div>

      {open && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${styles.mobileLink} ${
                    isActive ? styles.mobileLinkActive : ""
                  }`.trim()
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                openCart();
                setOpen(false);
              }}
              className={styles.mobileCart}
            >
              <FiShoppingBag className={styles.icon} />
              Cart ({itemCount})
            </button>
          </nav>
        </div>
      )}
      </header>

      {searchOpen && (
        <div
          className={styles.searchOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className={styles.searchPanel}
            onClick={(event) => event.stopPropagation()}
          >
            <form className={styles.searchHeader} onSubmit={handleSearchSubmit}>
              <FiSearch className={styles.searchHeaderIcon} />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search couture pieces, categories, or themes"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className={styles.searchInput}
                aria-label="Search Timelite catalog"
              />
              <button
                type="button"
                className={styles.searchCloseButton}
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <FiX className={styles.searchCloseIcon} />
              </button>
            </form>

            <div className={styles.searchResults}>
              {searchTerm.trim().length === 0 ? (
                <p className={styles.searchHint}>
                  Start typing to explore Timelite couture collections.
                </p>
              ) : searchResults.length > 0 ? (
                <ul className={styles.searchResultList}>
                  {searchResults.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        className={styles.searchResultItem}
                        onClick={() => handleSearchSelect(product.pid || product.id)}
                      >
                        <div className={styles.searchResultText}>
                          <span className={styles.searchResultName}>{product.name}</span>
                          <span className={styles.searchResultMeta}>
                            {product.category.toUpperCase()} / {formatCurrency(product.price)}
                          </span>
                        </div>
                        <span className={styles.searchResultCta}>View</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.searchEmpty}>
                  No results for{" "}
                  <span className={styles.searchTerm}>{searchTerm}</span>. Try a different phrase.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
