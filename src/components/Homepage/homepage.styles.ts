export const homepageStyles = /* css */ ` 
  .homepage {
    --homepage-gutter: clamp(1.5rem, 4vw, 3rem);
    min-height: 100vh;
    background: #fdfaf5;
    color: #1f1f1f;
    font-family: var(--font-geist-sans, "Inter", system-ui, -apple-system, BlinkMacSystemFont);
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    padding: 2.5rem var(--homepage-gutter) 4rem;
  }

  .homepage__full-bleed {
    width: calc(100% + (var(--homepage-gutter) * 2));
    margin-left: calc(-1 * var(--homepage-gutter));
    margin-right: calc(-1 * var(--homepage-gutter));
    display: block;
  }

  /* Override Navbar styles để làm nhỏ và vừa hơn */
  .homepage__full-bleed :global(.header) {
    border-bottom: 1px solid #f0e6db !important;
  }

  .homepage__full-bleed :global(.utilityStrip) {
    padding: 0.4rem 1rem !important;
    font-size: 0.7rem !important;
  }

  .homepage__full-bleed :global(.mainRow) {
    padding: 0.6rem 1rem !important;
    gap: 0.75rem !important;
  }

  .homepage__full-bleed :global(.brand) {
    font-size: 0.9rem !important;
    letter-spacing: 0.2em !important;
  }

  .homepage__full-bleed :global(.searchForm) {
    padding: 0.5rem 0.9rem !important;
    font-size: 0.8rem !important;
  }

  .homepage__full-bleed :global(.searchIcon) {
    width: 0.9rem !important;
    height: 0.9rem !important;
  }

  .homepage__full-bleed :global(.searchInput) {
    font-size: 0.8rem !important;
  }

  .homepage__full-bleed :global(.actionButton) {
    padding: 0.4rem 0.75rem !important;
    font-size: 0.65rem !important;
    letter-spacing: 0.1em !important;
  }

  .homepage__full-bleed :global(.cartButton) {
    padding: 0.4rem 0.9rem !important;
    font-size: 0.65rem !important;
    letter-spacing: 0.1em !important;
  }

  .homepage__full-bleed :global(.badge) {
    font-size: 0.6rem !important;
    padding: 0.15rem 0.4rem !important;
  }

  .homepage__full-bleed :global(.categoryNav) {
    padding: 0.5rem 1rem !important;
    font-size: 0.75rem !important;
    gap: 1.5rem !important;
  }

  .homepage__full-bleed :global(.categoryLink) {
    font-size: 0.75rem !important;
  }

  .homepage__full-bleed :global(.menuButton) {
    width: 2rem !important;
    height: 2rem !important;
  }

  .homepage__footer {
    margin-top: 2.5rem;
  }

  .homepage__footer :global(.footer) {
    background: #fdf8f1;
    padding: 3rem clamp(1.5rem, 6vw, 5rem) 2rem;
    border-top: 1px solid #f0e6d9;
  }

  .homepage__footer :global(.footer__content) {
    display: grid;
    grid-template-columns: 2fr 1fr 1.2fr;
    gap: 2rem;
    align-items: flex-start;
  }

  .homepage__footer :global(.footer__links nav) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .homepage.is-loading {
    justify-content: center;
  }

  .hero {
    width: 100%;
    border-radius: 40px;
    background: #fff;
    padding: 2rem;
    border: 1px solid #f0ebe3;
  }

  .hero__gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .hero__feature {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .hero__feature-image {
    width: 100%;
    padding-bottom: 130%;
    border-radius: 30px;
    background: linear-gradient(180deg, #f8f4ed, #f1ece3);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border: 1px solid #f3eee6;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  }

  .hero__feature-caption {
    font-size: 1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .homepage__skeleton {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }

  .skeleton-row {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .skeleton {
    position: relative;
    overflow: hidden;
    background: #ede7dd;
  }

  .skeleton::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 0%, rgba(255, 255, 255, 0.35) 45%, transparent 80%);
    transform: translateX(-100%);
    animation: shimmer 1.4s infinite;
  }

  .skeleton--brand {
    width: 140px;
    height: 46px;
    border-radius: 999px;
  }

  .skeleton--search {
    flex: 1;
    height: 46px;
    border-radius: 999px;
  }

  .skeleton--icons {
    display: flex;
    gap: 0.5rem;
  }

  .skeleton--icon {
    width: 44px;
    height: 44px;
    border-radius: 999px;
  }

  .skeleton--nav {
    width: 100%;
    height: 30px;
    border-radius: 20px;
  }

  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }

  .skeleton--tile {
    width: 100%;
    padding-bottom: 130%;
    border-radius: 32px;
  }

  .skeleton-grid--small .skeleton--card {
    width: 100%;
    padding-bottom: 120%;
    border-radius: 24px;
  }

  .curation {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .curation__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.25rem;
  }

  .curation__card {
    padding: 1rem;
    border-radius: 28px;
    border: 1px solid #e8e3da;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .curation__image {
    width: 100%;
    padding-bottom: 120%;
    border-radius: 22px;
    background: #f4efe6;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .curation__caption {
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  @media (max-width: 900px) {
    .homepage {
      --homepage-gutter: 1rem;
      padding: 1.5rem var(--homepage-gutter);
    }

    .header__top {
      grid-template-columns: 1fr;
    }

    .header__actions {
      justify-content: flex-end;
    }

    .hero__gallery {
      grid-template-columns: 1fr;
    }
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;
