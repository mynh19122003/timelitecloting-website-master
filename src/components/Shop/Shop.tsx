"use client";

import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiChevronDown, FiGrid, FiList, FiSliders } from "react-icons/fi";
import { Navbar } from "../layout/Navbar/Navbar";
import { Footer } from "../Footer/Footer";
import { useI18n } from "../../context/I18nContext";
import { defaultCategorySlug, shopCatalog, toCategorySlug } from "./shop.data";
import ProductCard, { productCardMocks } from "../Productcard/Productcard";

type ShopPageProps = {
  category?: string;
};

export default function ShopPage({ category }: ShopPageProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slug = useMemo(() => {
    if (!category) {
      return defaultCategorySlug;
    }

    const directMatch = shopCatalog[category] ? category : toCategorySlug(category);
    return shopCatalog[directMatch] ? directMatch : defaultCategorySlug;
  }, [category]);

  const catalog = shopCatalog[slug] ?? shopCatalog[defaultCategorySlug];
  const readableCategory = catalog.title;
  const facet = searchParams.get("facet")?.trim() ?? "";

  const filteredProducts = useMemo(() => {
    if (!facet) {
      return productCardMocks;
    }
    const query = facet.toLowerCase();
    const matches = productCardMocks.filter(
      (product) => product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query),
    );
    return matches.length ? matches : productCardMocks;
  }, [facet]);

  return (
    <div className="shop-page">
      <Navbar />
      <section className="catalog">
        <nav className="catalog__breadcrumb" aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate("/")}>
            Home
          </button>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={() => navigate(`/shop?category=${slug}`)}>
            {readableCategory}
          </button>
          {facet ? (
            <>
              <span aria-hidden="true">/</span>
              <span className="catalog__breadcrumb-current">{facet}</span>
            </>
          ) : null}
        </nav>
        <header className="catalog__heading">
          <h1>{readableCategory}</h1>
          <p>{catalog.subtitle}</p>
        </header>
        <div className="catalog__chips" role="tablist" aria-label="Sub categories">
          {catalog.chips.map((chip) => (
            <button key={chip} type="button" className="catalog__chip">
              {chip}
            </button>
          ))}
        </div>

        <div className="catalog__toolbar">
          <div className="catalog__filters">
            <button type="button" className="catalog__filter catalog__filter--primary">
              <FiSliders size={16} />
              Filter
            </button>
            {catalog.filters.map((filter) => (
              <button key={filter} type="button" className="catalog__filter">
                {filter}
                <FiChevronDown size={14} />
              </button>
            ))}
          </div>
          <div className="catalog__view">
            <div className="catalog__view-toggle" role="group" aria-label="View options">
              <button type="button" className="catalog__view-button is-active" aria-label={t("profile.grid.view")}>
                <FiGrid size={16} />
              </button>
              <button type="button" className="catalog__view-button" aria-label={t("profile.list.view")}>
                <FiList size={16} />
              </button>
            </div>
            <button type="button" className="catalog__sort">
              Sort by <strong>Featured Items</strong>
              <FiChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="catalog__grid">
          {filteredProducts.map((product) => (
            <Link
              key={`${product.brand}-${product.name}`}
              to="/product"
              className="catalog__product-link"
              aria-label={`View details for ${product.name}`}
            >
              <ProductCard product={product} />
            </Link>
          ))}
        </div>

      </section>
      <Footer />
      <style>{`
        .shop-page {
          min-height: 100vh;
          background: #fdfaf5;
          color: #1f1f1f;
          font-family: var(--font-geist-sans, "Inter", system-ui, -apple-system, BlinkMacSystemFont);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem 0 4rem;
        }

        .catalog {
          padding: 0 clamp(1.5rem, 5vw, 4rem);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .catalog__breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.95rem;
          color: #7c7469;
        }

        .catalog__breadcrumb button {
          border: none;
          background: none;
          padding: 0;
          color: inherit;
          font-weight: 600;
          cursor: pointer;
        }

        .catalog__breadcrumb-current {
          font-weight: 700;
          color: #1f1f1f;
        }

        .catalog__heading h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 600;
        }

        .catalog__heading p {
          margin: 0.25rem 0 0;
          color: #6f665c;
        }

        .catalog__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .catalog__chip {
          border-radius: 999px;
          border: 1px solid #cec5b8;
          background: #f4efe5;
          padding: 0.55rem 1.4rem;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
        }

        .catalog__toolbar {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          border-bottom: 1px solid #e2d8ca;
          padding-bottom: 1rem;
        }

        .catalog__filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .catalog__filter {
          border-radius: 12px;
          border: 1px solid #d8d2c7;
          background: #fff;
          padding: 0.5rem 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          cursor: pointer;
        }

        .catalog__filter--primary {
          background: #131313;
          color: #fff;
          border-color: #131313;
        }

        .catalog__view {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .catalog__view-toggle {
          display: inline-flex;
          border: 1px solid #dcd7ce;
          border-radius: 12px;
          overflow: hidden;
        }

        .catalog__view-button {
          border: none;
          background: transparent;
          padding: 0.5rem 0.85rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #5d5d5d;
          cursor: pointer;
        }

        .catalog__view-button.is-active {
          background: #131313;
          color: #fff;
        }

        .catalog__sort {
          border-radius: 12px;
          border: 1px solid #d8d2c7;
          background: #fff;
          padding: 0.5rem 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 500;
          cursor: pointer;
        }

        .catalog__grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .catalog__product-link {
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }

        @media (max-width: 1280px) {
          .catalog__grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 960px) {
          .catalog__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .catalog__grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .catalog__view {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
