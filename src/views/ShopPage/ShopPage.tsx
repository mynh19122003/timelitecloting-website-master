/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiFilter } from "react-icons/fi";
import { categoryLabels, normalizeCategory, type Category, type Product as UiProduct } from "../../data/products";
import { ProductCard } from "../../components/ui/ProductCard";
import styles from "./ShopPage.module.css";
import ApiService from "../../services/api";
import { getAdminMediaUrl, normalizePossibleMediaUrl, toProductsPid } from "../../config/api";

const colorPalette = ["Crimson", "Gold", "Ivory", "Emerald", "Burgundy", "Champagne"];

const priceRanges = [
  { label: "All prices", value: "all" },
  { label: "Under $1,500", value: "under-1500" },
  { label: "$1,500 - $2,500", value: "1500-2500" },
  { label: "Above $2,500", value: "above-2500" },
];

type ExtendedCategory = Category | "all" | "other";

export const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const defaultCategory = (params.get("category") as ExtendedCategory | null) ?? "all";

  const [selectedCategory, setSelectedCategory] = useState<ExtendedCategory>(defaultCategory);
  const [selectedColor, setSelectedColor] = useState<string>("All");
  const [priceRange, setPriceRange] = useState(priceRanges[0].value);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [allProducts, setAllProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setSelectedCategory(defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    let isMounted = true;
    const mapProduct = (p: any): UiProduct => {
      const slug: string | undefined = p.slug ?? undefined;
      const productsId: string | undefined = p.products_id ?? undefined;
      
      // Helper to fallback to slug-based category detection if needed
      const fromSlug = (s?: string): Category | "other" => {
        if (!s) return "other" as any;
        if (s.startsWith("ao-dai-")) return "ao-dai" as any;
        if (s.startsWith("vest-")) return "vest" as any;
        if (s.startsWith("wedding-") || s.startsWith("bridal-")) return "wedding" as any;
        if (s.startsWith("evening-")) return "evening" as any;
        return "other" as any;
      };
      
      const pickImage = (): string => {
        if (productsId) return getAdminMediaUrl(String(productsId));
        const raw = typeof p.image_url === 'string' ? p.image_url.trim() : '';
        if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) return raw;
        return "/images/image_1.png";
      };

      const imageRaw = pickImage();
      const image = normalizePossibleMediaUrl(imageRaw) || "/images/image_1.png";
      const galleryRaw = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : [image];
      const gallery = galleryRaw.map((g: string) => normalizePossibleMediaUrl(g) || g);

      // Normalize category from API (could be label like "Bridal Gowns" or slug like "wedding")
      const apiCategory = p.category ? normalizeCategory(p.category) : fromSlug(slug);
      const finalCategory = apiCategory !== "other" ? (apiCategory as Category) : (fromSlug(slug) as any);
      
      // Debug logging for category normalization
      if (process.env.NODE_ENV === 'development') {
        console.log('[ShopPage] Category normalization:', {
          rawCategory: p.category,
          slug: slug,
          normalized: apiCategory,
          finalCategory: finalCategory,
          productName: p.name
        });
      }

      // Helper to safely parse JSON strings
      const parseJsonField = <T,>(value: any, fallback: T): T => {
        if (Array.isArray(value)) return value as T;
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed as T : fallback;
          } catch {
            return fallback;
          }
        }
        return fallback;
      };

      // Normalize products_id to PID format (e.g., PID00001)
      // Fallback to id if products_id is not available
      const pid = productsId ? toProductsPid(productsId) : (p.id ? toProductsPid(p.id) : undefined);

      return {
        id: slug ?? String(p.id),
        pid: pid,
        name: p.name,
        category: finalCategory,
        shortDescription: p.short_description ?? "",
        description: p.description ?? "",
        price: Number(p.price ?? 0),
        originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
        colors: parseJsonField(p.colors, []),
        sizes: parseJsonField(p.sizes, ["S", "M", "L"]),
        image: image,
        gallery: gallery,
        rating: Number(p.rating ?? 0),
        reviews: Number(p.reviews ?? 0),
        tags: parseJsonField(p.tags, []),
        isFeatured: Boolean(p.is_featured ?? false),
        isNew: Boolean(p.is_new ?? false),
      };
    };
    setLoading(true);
    // Load a large page to effectively fetch all products for the grid
    ApiService.getProducts({ limit: 1000 })
      .then((res) => {
        const list = res?.products ?? [];
        if (isMounted) setAllProducts(list.map(mapProduct));
      })
      .catch(() => {
        if (isMounted) setAllProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const knownCategories: Category[] = ["ao-dai", "wedding", "vest", "evening"];
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[ShopPage] Filter state:', {
        selectedCategory,
        totalProducts: allProducts.length,
        productsByCategory: allProducts.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    }
    
    return allProducts
      .filter((product) => {
        if (selectedCategory && selectedCategory !== "all") {
          if (selectedCategory === "other") {
            if (knownCategories.includes(product.category as Category)) return false;
          } else {
            // Compare category (should be normalized slug)
            const matches = product.category === (selectedCategory as Category);
            if (!matches) {
              if (process.env.NODE_ENV === 'development') {
                console.log('[ShopPage] Category mismatch:', {
                  productName: product.name,
                  productCategory: product.category,
                  selectedCategory,
                  match: matches
                });
              }
              return false;
            }
          }
        }
        if (selectedColor !== "All" && !product.colors.includes(selectedColor)) {
          return false;
        }
        switch (priceRange) {
          case "under-1500":
            return product.price < 1500;
          case "1500-2500":
            return product.price >= 1500 && product.price <= 2500;
          case "above-2500":
            return product.price > 2500;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return b.rating - a.rating;
      });
  }, [allProducts, priceRange, selectedCategory, selectedColor, sortBy]);

  const handleCategoryChange = (category: ExtendedCategory) => {
    setSelectedCategory(category);
    if (!category || category === "all") params.delete("category");
    else params.set("category", category);
    navigate({ pathname: "/shop", search: params.toString() });
  };

  return (
    <div className={styles.page}>
      <section className={styles.introSection}>
        <div className={styles.introWrapper}>
          <div className={styles.introCopy}>
            <span className={styles.eyebrow}>Timelite Shop</span>
            <h1 className={styles.heading}>Wardrobe heroes for elevated celebrations</h1>
            <p className={styles.description}>
              Begin with the ao dai, the heart of our house, then explore tailored vests, bridal gowns,
              and evening dresses designed for American venues and lifestyles.
            </p>
            <Link to="#collections" className={styles.linkUnderline}>
              Browse couture collections
            </Link>
          </div>
          <div className={styles.conciergeCard}>
            <p className={styles.conciergeTitle}>Concierge Styling</p>
            <p className={styles.conciergeText}>
              Our New York stylists coordinate Zoom consultations, lookbooks, and alteration schedules
              tailored to your event timeline.
            </p>
            <Link to="/contact" className={styles.conciergeCta}>
              Book now
            </Link>
          </div>
        </div>
      </section>

      <section id="collections" className={styles.collectionsSection}>
        <div className={styles.filterBar}>
          <div className={styles.categoryTabs}>
            {(["all", "ao-dai", "wedding", "vest", "evening", "other"] as ExtendedCategory[]).map((category) => {
              const isActive = selectedCategory === category;
              const buttonClass = `${styles.categoryButton} ${
                isActive ? styles.categoryButtonActive : ""
              }`.trim();
              const label = category === "all" ? "All" : category === "other" ? "Other" : categoryLabels[category as Category];
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={buttonClass}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className={styles.filterControls}>
            <div className={styles.filterGroup}>
              <FiFilter />
              Filters
            </div>
            <select
              value={selectedColor}
              onChange={(event) => setSelectedColor(event.target.value)}
              className={styles.select}
            >
              <option value="All">All colors</option>
              {colorPalette.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
            <select
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
              className={styles.select}
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <label className={styles.sortSelect}>
              <span>Sort</span>
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as typeof sortBy)
                }
                className={styles.select}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
              </select>
            </label>
            <button
              onClick={() => {
                setSelectedColor("All");
                setPriceRange("all");
                setSortBy("featured");
              }}
              className={styles.resetButton}
            >
              Reset
            </button>
          </div>
        </div>

        <div className={styles.productsGrid}>
          {loading ? (
            <div className={styles.emptyState}><p>Loading products...</p></div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No products match your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ShopPage;
