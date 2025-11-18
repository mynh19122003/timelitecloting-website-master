"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../layout/Navbar/Navbar";
import { homepageStyles } from "./homepage.styles";

const heroFeatures = [
  { title: "Ao Dai", image: "/images/image_1.png" },
  { title: "Suiting", image: "/images/image_2.png" },
  { title: "Bridal Gowns", image: "/images/image_3.png" },
];

const curationItems = [
  { title: "Evening Couture", image: "/images/image_4.png" },
  { title: "Conical Hats", image: "/images/image_5.png" },
  { title: "Kidswear", image: "/images/image_6.png" },
  { title: "Gift Procession Sets", image: "/images/image_7.png" },
];

type HomePageProps = {
  showFooter?: boolean;
};

export default function HomePage({ showFooter = true }: HomePageProps = {}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

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
                  <span key={feature.title} className="skeleton skeleton--tile" />
                ))}
              </div>
              <div className="skeleton-grid skeleton-grid--small">
                {curationItems.map((item) => (
                  <span key={item.title} className="skeleton skeleton--card" />
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
                  <figure key={feature.title} className="hero__feature">
                    <div 
                      className="hero__feature-image" 
                      style={{ backgroundImage: `url(${feature.image})` }}
                    />
                    <figcaption className="hero__feature-caption">{feature.title}</figcaption>
                  </figure>
                ))}
              </section>
            </main>

            <section className="curation">
              <div className="curation__grid">
                {curationItems.map((item) => (
                  <article key={item.title} className="curation__card">
                    <div 
                      className="curation__image" 
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <p className="curation__caption">{item.title}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
