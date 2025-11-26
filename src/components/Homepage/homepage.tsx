"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../layout/Navbar/Navbar";
import { defaultCategorySlug, toCategorySlug } from "../Shop/shop.data";
import { homepageStyles } from "./homepage.styles";

const heroFeatures = [
  {
    id: "ao-dai",
    label: "Ao Dai",
    image: "/images/image_1.png",
    category: "Ao Dai",
  },
  {
    id: "suits",
    label: "Suits",
    image: "/images/image_2.png",
    category: "Suits",
  },
  {
    id: "bridal-formal",
    label: "Bridal & Formal Dresses",
    image: "/images/image_3.png",
    category: "Bridal & Formal Dresses",
  },
];

const curationItems = [
  {
    id: "accessories",
    label: "Accessories",
    image: "/images/image_4.png",
    category: "Accessories",
  },
  {
    id: "lunar-decor",
    label: "Lunar New Year Décor",
    image: "/images/image_5.png",
    category: "Lunar New Year Décor",
  },
  {
    id: "ceremonial-attire",
    label: "Ceremonial Attire",
    image: "/images/image_6.png",
    category: "Ceremonial Attire",
  },
  {
    id: "uniforms",
    label: "Uniforms & Teamwear",
    image: "/images/image_7.png",
    category: "Uniforms & Teamwear",
  },
];

const getCategoryPath = (categoryLabel?: string) => {
  if (!categoryLabel) {
    return "/shop";
  }
  const slug = toCategorySlug(categoryLabel);
  return slug === defaultCategorySlug ? "/shop" : `/shop?category=${encodeURIComponent(slug)}`;
};

type HomePageProps = {
  showFooter?: boolean;
};

export default function HomePage({ showFooter = true }: HomePageProps = {}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const copy = {
    viewHero: "View",
    viewCategory: "Open category",
  };

  return (
    <>
      <style>{homepageStyles}</style>
      <div className={`homepage${isLoading ? " is-loading" : ""}`}>
        {isLoading ? (
          <div className="homepage__full-bleed">
            <div className="homepage__skeleton" role="status" aria-live="polite">
              <div className="skeleton-row">
                <span className="skeleton skeleton--brand" />
                <span className="skeleton skeleton--search" />
                <span className="skeleton skeleton--icons">
                  <span className="skeleton skeleton--icon" />
                  <span className="skeleton skeleton--icon" />
                  <span className="skeleton skeleton--icon" />
                </span>
              </div>
              <span className="skeleton skeleton--nav" />
              <div className="skeleton-grid">
                {heroFeatures.map((feature) => (
                  <span key={feature.id} className="skeleton skeleton--tile" />
                ))}
              </div>
              <div className="skeleton-grid skeleton-grid--small">
                {curationItems.map((item) => (
                  <span key={item.id} className="skeleton skeleton--card" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="homepage__full-bleed">
              <Navbar />
            </div>

            <main className="hero">
              <section className="hero__gallery">
                {heroFeatures.map((feature) => (
                  <Link
                    key={feature.id}
                    className="hero__feature-link"
                    to={getCategoryPath(feature.category)}
                    aria-label={`${copy.viewHero} ${feature.label}`}
                  >
                    <figure className="hero__feature">
                    <div 
                      className="hero__feature-image" 
                      style={{ backgroundImage: `url(${feature.image})` }}
                    />
                      <figcaption className="hero__feature-caption">{feature.label}</figcaption>
                  </figure>
                  </Link>
                ))}
              </section>
            </main>

            <section className="curation">
              <div className="curation__grid">
                {curationItems.map((item) => (
                  <Link
                    key={item.id}
                    className="curation__link"
                    to={getCategoryPath(item.category)}
                    aria-label={`${copy.viewCategory} ${item.label}`}
                  >
                    <article className="curation__card">
                    <div 
                      className="curation__image" 
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                      <p className="curation__caption">{item.label}</p>
                  </article>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
