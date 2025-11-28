export const headerStyles = /* css */ `
  .header {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    z-index: 50;
    transition: gap 0.2s ease;
  }

  .header__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 auto;
    padding: 0 1.5rem;
    transition: gap 0.2s ease, padding 0.2s ease;
  }

  /* When dropdown mở, giữ nguyên layout, không thu nhỏ header */

  .header__brand {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    min-width: 0;
    flex-shrink: 0;
  }

  .header__brand-mark {
    width: 68px;
    height: 68px;
    min-width: 68px;
    min-height: 68px;
    border-radius: 50%;
    border: 2px solid var(--color-hero-frame-border, #d4c5a9);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 30% 30%, #fff, #f5f0e8);
    box-shadow: 0 8px 24px rgba(31, 26, 23, 0.08);
    overflow: hidden;
    position: relative;
    transition: width 0.2s ease, height 0.2s ease;
    flex-shrink: 0;
    z-index: 1;
  }

  /* Bỏ hiệu ứng thu nhỏ logo khi hover nav */

  .header__brand-logo {
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
    border-radius: 50%;
    object-fit: cover;
    object-position: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    display: block;
    pointer-events: none;
  }

  .header__brand-name {
    display: inline-flex;
    align-items: center;
    font-size: 1.65rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    line-height: 1;
    transition: font-size 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: fit-content;
  }

  /* Bỏ hiệu ứng thu nhỏ chữ brand khi hover nav */

  .header__search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid #ededed;
    border-radius: 999px;
    padding: 0.5rem 0.9rem;
    background: #fff;
    transition: padding 0.2s ease, max-width 0.2s ease;
    width: 100%;
    min-width: 0;
    flex: 1 1 0;
    max-width: 780px;
    margin: 0 1.25rem;
  }

  /* Giữ nguyên kích thước ô search khi hover nav */

  .header__search input {
    border: none;
    width: 100%;
    outline: none;
    background: transparent;
    font-size: 0.9rem;
  }

  .header__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .header__mobile-toggle {
    display: none;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid #e1e1e1;
    background: #fff;
    border-radius: 999px;
    padding: 0.4rem 0.9rem;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #4a3e2b;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
    font-weight: 600;
    line-height: 1;
  }

  .header__mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 150;
  }

  .header__mobile-overlay--visible {
    opacity: 1;
    pointer-events: all;
  }

  .header__action,
  .header__icon,
  .header__profile {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e1e1e1;
    background: #fff;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
    position: relative;
  }

  .header__profile svg {
    width: 24px;
    height: 24px;
  }

  .header__nav-row {
    border-top: 1px solid #ece7df;
    border-bottom: 1px solid #f1e9db;
    padding: 1rem 0 1.25rem;
    position: relative;
    background: linear-gradient(180deg, #fcf8f1 0%, #f6f0e6 100%);
    z-index: 100;
    transition: padding 0.2s ease, background 0.2s ease;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  /* Không thay đổi padding nav-row khi dropdown mở */

  .header__nav {
    display: flex;
    justify-content: center;
    flex-wrap: nowrap;
    gap: 2.25rem;
    font-size: 0.95rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #4a3e2b;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    white-space: nowrap;
  }

  .header__nav-item {
    padding-bottom: 0.75rem;
    position: relative;
  }

  .header__nav-trigger {
    position: relative;
    border: none;
    background: transparent;
    text-transform: inherit;
    font: inherit;
    letter-spacing: inherit;
    padding: 0.2rem 0;
    cursor: pointer;
    color: inherit;
    transition: color 0.2s ease;
    white-space: nowrap;
    display: block;
  }

  .header__nav-trigger::after {
    content: "";
    position: absolute;
    left: 15%;
    right: 15%;
    bottom: -1.15rem;
    height: 2px;
    border-radius: 999px;
    background: var(--color-accent-gold-deep, #b48a58);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.2s ease;
  }

  .header__nav-item.is-active .header__nav-trigger::after {
    transform: scaleX(1);
  }

  .header__nav-trigger:hover,
  .header__nav-trigger:focus-visible {
    color: var(--color-accent-gold-deep, #b48a58);
  }

  .header__nav-item.is-active .header__nav-trigger {
    color: var(--color-accent-gold-deep, #b48a58);
  }

  .header__mega {
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    width: clamp(720px, 80vw, 1100px);
    max-width: calc(100vw - 2rem);
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 0.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    padding: 2rem 2.5rem;
    animation: dropdownFade 0.2s ease;
    display: flex;
    justify-content: center;
    z-index: 1000;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  @keyframes dropdownFade {
    from {
      opacity: 0;
      transform: translate(-50%, 5%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  .header__mega-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 2rem;
    overflow: hidden;
  }

  .header__mega-section {
    min-width: 0;
    overflow: hidden;
  }

  .header__mega-section--quick {
    border-left: 1px solid #f0f0f0;
    padding-left: 1.5rem;
  }

  .header__mega-section ul {
    list-style: none;
    padding: 0;
    margin: 0.3rem 0 0;
    display: grid;
    gap: 0.4rem;
    overflow: hidden;
  }

  .header__mega-section li {
    min-width: 0;
    overflow: hidden;
  }

  .header__mega-heading {
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: #000;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  .header__mega-link {
    border: none;
    background: transparent;
    font: inherit;
    font-size: 0.9rem;
    text-align: left;
    color: #666;
    padding: 0.25rem 0;
    cursor: pointer;
    transition: color 0.2s ease;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    white-space: normal;
    width: 100%;
    display: block;
  }

  .header__mega-link--quick {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.8rem;
  }

  .header__mega-link:hover,
  .header__mega-link:focus-visible {
    color: #000;
  }

  .header__mega-highlight {
    border-left: 1px solid #f0f0f0;
    padding-left: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
    overflow: hidden;
  }

  .header__mega-eyebrow {
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: #000;
    font-weight: 600;
    margin: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  .header__mega-highlight-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
    color: #000;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  .header__mega-description {
    margin: 0;
    color: #999;
    line-height: 1.6;
    font-size: 0.95rem;
    letter-spacing: 0.05em;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  .header__mega-cta {
    align-self: flex-start;
    border-radius: 0.375rem;
    padding: 0.75rem 2rem;
    border: 2px solid #000;
    background: transparent;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease;
    font-weight: 600;
  }

  .header__mega-cta:hover,
  .header__mega-cta:focus-visible {
    background: #000;
    color: #fff;
  }

  .header__mega-note {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header__mega-note-cta {
    border: none;
    background: transparent;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.75rem;
    cursor: pointer;
    color: #000;
  }

  @media (max-width: 1200px) {
    .header__top {
      padding: 0 1rem;
      gap: 1.5rem;
    }

    .header__nav {
      gap: 1.5rem;
      max-width: 100%;
      padding: 0 1rem;
    }
  }

  @media (max-width: 992px) {
    .header__brand-name {
      font-size: 1.35rem;
    }

    .header__brand-mark {
      width: 60px;
      height: 60px;
    }

    .header__search {
      max-width: 100%;
      margin: 0 0.75rem;
    }

    .header__actions {
      gap: 0.35rem;
    }

    .header__nav {
      gap: 1.25rem;
      font-size: 0.9rem;
      letter-spacing: 0.14em;
    }
  }

  @media (max-width: 768px) {
    .header__top {
      flex-direction: column;
      align-items: stretch;
      gap: 0.85rem;
      padding: 0 1rem;
    }

    .header__brand {
      justify-content: center;
      order: 1;
    }

    .header__search {
      margin: 0;
      width: 100%;
      order: 2;
    }

    .header__actions {
      width: 100%;
      justify-content: space-evenly;
      order: 3;
    }

    .header__mobile-toggle {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: auto;
      align-self: center;
      padding: 0.5rem 1.5rem;
      border-radius: 999px;
      background: #fdf7ef;
      border-color: #d4c5a9;
      color: #4a3e2b;
      margin-top: 0.25rem;
      order: 4;
    }

    .header__nav-row {
      display: none;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(80vw, 320px);
      padding: 1.5rem 1.25rem 2rem;
      background: #fff;
      box-shadow: -6px 0 24px rgba(0, 0, 0, 0.15);
      overflow-y: auto;
      z-index: 200;
      border: none;
      border-radius: 0;
    }

    .header__nav-row::before {
      content: "Menu";
      display: block;
      font-size: 0.9rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #b48a58;
      margin-bottom: 1rem;
    }

    .header--mobile-open .header__nav-row,
    .header__nav-row--mobile-open {
      display: block;
    }

    .header__nav {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.92rem;
      letter-spacing: 0.08em;
      white-space: normal;
      padding: 0;
    }

    .header__mega {
      display: none !important;
    }
  }

  @media (max-width: 480px) {
    .header__brand-mark {
      width: 52px;
      height: 52px;
    }

    .header__brand-name {
      font-size: 1.2rem;
    }

    .header__actions {
      gap: 0.65rem;
      justify-content: center;
    }

    .header__nav {
      gap: 0.75rem;
      font-size: 0.78rem;
      letter-spacing: 0.1em;
    }

    .header__search {
      padding: 0.45rem 0.85rem;
    }
  }
`;
