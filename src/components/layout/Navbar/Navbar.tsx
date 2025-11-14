"use client";

import { FormEvent, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import { useCart } from "../../../context/CartContext";
import {
  clearAuthStatus,
  getAuthStatus,
  subscribeToAuthChanges,
} from "../../../utils/auth";
import styles from "./Navbar.module.css";

const categoryLinks = [
  { label: "Women", to: "/shop" },
  { label: "Men", to: "/shop" },
  { label: "Kids & Baby", to: "/shop" },
  { label: "Home", to: "/shop" },
  { label: "Shoes", to: "/shop" },
  { label: "Handbags & Accessories", to: "/shop" },
  { label: "Jewelry", to: "/shop" },
  { label: "Sale", to: "/shop" },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => getAuthStatus());
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextAuthState) => {
      setIsAuthenticated(nextAuthState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    clearAuthStatus();
    navigate("/login");
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchTerm.trim();
    if (term.length > 0) {
      navigate(`/shop?search=${encodeURIComponent(term)}`);
    }
    setSearchTerm("");
    setMobileOpen(false);
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
      return;
    }
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.utilityStrip}>
        <p>Enjoy international shipping & easy returns on every order.</p>
      </div>

      <div className={styles.mainRow}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>

        <button
          type="button"
          className={styles.brand}
          onClick={() => {
            navigate("/");
            setMobileOpen(false);
          }}
        >
          Timelite
        </button>

        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="search"
            placeholder="What are you looking for today?"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.searchInput}
          />
        </form>

        <div className={styles.mainActions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => navigate("/profile?tab=orders")}
          >
            Order tracking
          </button>
          <button type="button" className={styles.actionButton} onClick={handleAccountClick}>
            <FiUser />
            <span>{isAuthenticated ? "My account" : "Sign in"}</span>
          </button>
          {isAuthenticated && (
            <button type="button" className={styles.actionButton} onClick={handleLogout}>
              Logout
            </button>
          )}
          <button type="button" className={styles.cartButton} onClick={openCart}>
            <FiShoppingBag />
            <span>Cart</span>
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
        </div>
      </div>

      <nav className={styles.categoryNav}>
        {categoryLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            className={({ isActive }) =>
              `${styles.categoryLink} ${isActive ? styles.categoryLinkActive : ""}`.trim()
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {mobileOpen && (
        <div className={styles.mobilePanel}>
          <form className={styles.mobileSearch} onSubmit={handleSearchSubmit}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Search products"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </form>
          <div className={styles.mobileLinks}>
            {categoryLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={styles.mobileLink}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                navigate("/profile?tab=orders");
                setMobileOpen(false);
              }}
              className={styles.mobileLink}
            >
              Order tracking
            </button>
            <button
              type="button"
              onClick={() => {
                handleAccountClick();
                setMobileOpen(false);
              }}
              className={styles.mobileLink}
            >
              {isAuthenticated ? "My account" : "Sign in"}
            </button>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className={styles.mobileLink}
              >
                Logout
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                openCart();
                setMobileOpen(false);
              }}
              className={styles.mobileLink}
            >
              View cart ({itemCount})
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
