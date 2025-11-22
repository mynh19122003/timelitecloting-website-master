"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiGrid, FiList, FiSliders } from "react-icons/fi";
import { defaultCategorySlug, shopCatalog, toCategorySlug } from "../../components/Shop/shop.data";
import { ProductCard } from "../../components/ui/ProductCard/ProductCard";
import { FilterDropdown } from "../../components/ui/FilterDropdown/FilterDropdown";
import { useI18n } from "../../context/I18nContext";
import styles from "./ShopPage.module.css";
import ApiService from "../../services/api";
import { getAdminMediaUrl, normalizePossibleMediaUrl, toProductsPid } from "../../config/api";
import {
  normalizeCategory,
  type Category,
  type Product as UiProduct,
} from "../../data/products";

const slugToCategoryMap: Record<string, Category> = {
  [toCategorySlug("Ao Dai")]: "ao-dai",
  [toCategorySlug("Suiting")]: "vest",
  [toCategorySlug("Bridal Gowns")]: "wedding",
  [toCategorySlug("Evening Couture")]: "evening",
  [toCategorySlug("Conical Hats")]: "conical-hats",
  [toCategorySlug("Kidswear")]: "kidswear",
  [toCategorySlug("Gift Procession Sets")]: "gift-procession-sets",
};

type ShopPageProps = {
  category?: string;
};

type ApiProduct = {
  id?: number | string;
  slug?: string;
  products_id?: string | number;
  image_url?: string;
  gallery?: string[];
  category?: string;
  name?: string;
  short_description?: string;
  description?: string;
  price?: number | string;
  original_price?: number | string | null;
  colors?: string[] | string;
  sizes?: string[] | string;
  tags?: string[] | string;
  is_featured?: boolean;
  is_new?: boolean;
  silhouette?: string;
  fabric?: string;
  occasion?: string;
  sleeve?: string;
  length?: string;
  embellishment?: string;
  rating?: number | string;
  reviews?: number | string;
  variant?: string;
};

export const ShopPage = ({ category }: ShopPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const facet = searchParams.get("facet")?.trim() ?? "";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [allProducts, setAllProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    silhouette: string | null;
    fabric: string | null;
    occasion: string | null;
    sleeve: string | null;
    length: string | null;
    embellishment: string | null;
  }>({
    silhouette: null,
    fabric: null,
    occasion: null,
    sleeve: null,
    length: null,
    embellishment: null,
  });

  const categoryFromSlug = (slugValue?: string | null): Category | null => {
    if (!slugValue || slugValue === defaultCategorySlug) return null;
    return slugToCategoryMap[slugValue] ?? null;
  };

  const slug = useMemo(() => {
    if (!category) {
      const urlCategory = searchParams.get("category");
      if (urlCategory) {
        const directMatch = shopCatalog[urlCategory] ? urlCategory : toCategorySlug(urlCategory);
        return shopCatalog[directMatch] ? directMatch : defaultCategorySlug;
      }
      return defaultCategorySlug;
    }
    const directMatch = shopCatalog[category] ? category : toCategorySlug(category);
    return shopCatalog[directMatch] ? directMatch : defaultCategorySlug;
  }, [category, searchParams]);

  const catalog = shopCatalog[slug] ?? shopCatalog[defaultCategorySlug];
  
  // Translate category title and subtitle
  const getCategoryTranslation = (slugValue: string) => {
    const translationMap: Record<string, { title: string; subtitle: string }> = {
      [defaultCategorySlug]: {
        title: t("shop.all.collections"),
        subtitle: t("shop.all.collections.subtitle"),
      },
      [toCategorySlug("Ao Dai")]: {
        title: t("shop.ao.dai.title"),
        subtitle: t("shop.ao.dai.subtitle"),
      },
      [toCategorySlug("Suiting")]: {
        title: t("shop.suiting.title"),
        subtitle: t("shop.suiting.subtitle"),
      },
      [toCategorySlug("Bridal Gowns")]: {
        title: t("shop.bridal.title"),
        subtitle: t("shop.bridal.subtitle"),
      },
      [toCategorySlug("Evening Couture")]: {
        title: t("shop.evening.title"),
        subtitle: t("shop.evening.subtitle"),
      },
      [toCategorySlug("Conical Hats")]: {
        title: t("shop.conical.hats.title"),
        subtitle: t("shop.conical.hats.subtitle"),
      },
      [toCategorySlug("Kidswear")]: {
        title: t("shop.kidswear.title"),
        subtitle: t("shop.kidswear.subtitle"),
      },
      [toCategorySlug("Gift Procession Sets")]: {
        title: t("shop.gift.procession.title"),
        subtitle: t("shop.gift.procession.subtitle"),
      },
    };
    return translationMap[slugValue] || { title: catalog.title, subtitle: catalog.subtitle };
  };
  
  const categoryTranslation = getCategoryTranslation(slug);
  const readableCategory = categoryTranslation.title;
  const categorySubtitle = categoryTranslation.subtitle;
  
  // Translate chips
  const translateChip = (chip: string): string => {
    const chipMap: Record<string, string> = {
      "Highlights": t("shop.highlights"),
      "Best sellers": t("shop.best.sellers"),
      "New arrivals": t("shop.new.arrivals"),
      "Limited edition": t("shop.limited.edition"),
    };
    return chipMap[chip] || chip;
  };

  useEffect(() => {
    let isMounted = true;
    const mapProduct = (p: ApiProduct): UiProduct => {
      const slug: string | undefined = typeof p.slug === "string" ? p.slug : undefined;
      const productsId: string | undefined =
        typeof p.products_id === "string" || typeof p.products_id === "number"
          ? String(p.products_id)
          : undefined;
      
      // Helper to fallback to slug-based category detection if needed
      const fromSlug = (s?: string): Category | "other" => {
        if (!s) return "other";
        if (s.startsWith("ao-dai-")) return "ao-dai";
        if (s.startsWith("vest-")) return "vest";
        if (s.startsWith("wedding-") || s.startsWith("bridal-")) return "wedding";
        if (s.startsWith("evening-")) return "evening";
        if (s.startsWith("non-la")) return "conical-hats";
        if (s.startsWith("kidswear")) return "kidswear";
        if (s.startsWith("gift-procession") || s.startsWith("giftset") || s.includes("procession")) {
          return "gift-procession-sets";
        }
        return "other";
      };
      
      const pickImage = (): string => {
        if (productsId) return getAdminMediaUrl(String(productsId));
        const raw = typeof p.image_url === "string" ? p.image_url.trim() : "";
        if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) return raw;
        return "/images/image_1.png";
      };

      const imageRaw = pickImage();
      const image = normalizePossibleMediaUrl(imageRaw) || "/images/image_1.png";
      const galleryRaw = Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : [image];
      const gallery = galleryRaw.map((g) => normalizePossibleMediaUrl(g) || g);

      // Normalize category from API (could be label like "Bridal Gowns" or slug like "wedding")
      const apiCategory = p.category ? normalizeCategory(p.category) : fromSlug(slug);
      const finalCategory = apiCategory !== "other" ? apiCategory : fromSlug(slug);

      // Helper to safely parse JSON strings
      const parseJsonField = <T,>(value: unknown, fallback: T): T => {
        if (Array.isArray(value)) return value as T;
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? (parsed as T) : fallback;
          } catch {
            return fallback;
          }
        }
        return fallback;
      };

      // Normalize products_id to PID format (e.g., PID00001)
      const pid = productsId
        ? toProductsPid(productsId)
        : p.id != null
        ? toProductsPid(p.id)
        : undefined;

      return {
        id: slug ?? String(p.id),
        pid,
        name: p.name ?? "",
        category: (finalCategory === "other" ? "other" : finalCategory) as Category,
        variant: p.variant ?? undefined,
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
        silhouette: p.silhouette ?? undefined,
        fabric: p.fabric ?? undefined,
        occasion: p.occasion ?? undefined,
        sleeve: p.sleeve ?? undefined,
        length: p.length ?? undefined,
        embellishment: p.embellishment ?? undefined,
      };
    };

    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        const pageSize = 100;
        let page = 1;
        const aggregated: ApiProduct[] = [];
        const categoryParam = slug !== defaultCategorySlug ? slug : undefined;

        while (true) {
          const response = await ApiService.getProducts({ page, limit: pageSize, category: categoryParam }, false);
          const pageProducts = (response?.products ?? []) as ApiProduct[];
          aggregated.push(...pageProducts);

          const total = response?.total ?? aggregated.length;
          const fetchedCount = aggregated.length;

          const reachedEnd = pageProducts.length < pageSize || fetchedCount >= total;
          if (reachedEnd) {
            break;
          }
          page += 1;
        }

        if (isMounted) {
          const mapped = aggregated.map(mapProduct);
          const dedupedMap = new Map<string, UiProduct>();
          mapped.forEach((product) => {
            const key = product.pid ?? product.id;
            dedupedMap.set(key, product);
          });
          setAllProducts(Array.from(dedupedMap.values()));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);
        const status =
          typeof error === "object" && error !== null && "status" in error
            ? (error as { status?: unknown }).status
            : undefined;
        console.error("[ShopPage] Error loading products:", {
          error: errorMessage,
          status,
        });
        if (isMounted) setAllProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllProducts();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Get available variants for current category
  const availableVariants = useMemo(() => {
    const targetCategory = categoryFromSlug(slug);
    
    if (!targetCategory) return [];
    
    const categoryProducts = allProducts.filter((p) => p.category === targetCategory);
    const variants = new Set<string>();
    categoryProducts.forEach((p) => {
      if (p.variant) {
        variants.add(p.variant);
      }
    });
    return Array.from(variants).sort();
  }, [allProducts, slug]);

  // Get available filter options for current category
  const availableFilterOptions = useMemo(() => {
    const targetCategory = categoryFromSlug(slug);
    
    if (!targetCategory) {
      return {
        silhouette: [],
        fabric: [],
        occasion: [],
        sleeve: [],
        length: [],
        embellishment: [],
      };
    }
    
    const categoryProducts = allProducts.filter((p) => p.category === targetCategory);
    const options = {
      silhouette: new Set<string>(),
      fabric: new Set<string>(),
      occasion: new Set<string>(),
      sleeve: new Set<string>(),
      length: new Set<string>(),
      embellishment: new Set<string>(),
    };
    
    categoryProducts.forEach((p) => {
      if (p.silhouette) options.silhouette.add(p.silhouette);
      if (p.fabric) options.fabric.add(p.fabric);
      if (p.occasion) options.occasion.add(p.occasion);
      if (p.sleeve) options.sleeve.add(p.sleeve);
      if (p.length) options.length.add(p.length);
      if (p.embellishment) options.embellishment.add(p.embellishment);
    });
    
    return {
      silhouette: Array.from(options.silhouette).sort(),
      fabric: Array.from(options.fabric).sort(),
      occasion: Array.from(options.occasion).sort(),
      sleeve: Array.from(options.sleeve).sort(),
      length: Array.from(options.length).sort(),
      embellishment: Array.from(options.embellishment).sort(),
    };
  }, [allProducts, slug]);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by category slug
    if (slug && slug !== defaultCategorySlug) {
      const targetCategory = categoryFromSlug(slug);
      if (targetCategory) {
        filtered = filtered.filter((p) => p.category === targetCategory);
      }
    }

    // Filter by variant
    if (selectedVariant) {
      filtered = filtered.filter((p) => p.variant === selectedVariant);
    }

    // Filter by chip (tags or variant)
    if (selectedChip) {
      filtered = filtered.filter((p) => 
        p.tags.some((tag) => tag.toLowerCase().includes(selectedChip.toLowerCase())) ||
        p.variant?.toLowerCase().includes(selectedChip.toLowerCase()) ||
        p.name.toLowerCase().includes(selectedChip.toLowerCase())
      );
    }

    // Filter by filters
    if (filters.silhouette) {
      filtered = filtered.filter((p) => p.silhouette === filters.silhouette);
    }
    if (filters.fabric) {
      filtered = filtered.filter((p) => p.fabric === filters.fabric);
    }
    if (filters.occasion) {
      filtered = filtered.filter((p) => p.occasion === filters.occasion);
    }
    if (filters.sleeve) {
      filtered = filtered.filter((p) => p.sleeve === filters.sleeve);
    }
    if (filters.length) {
      filtered = filtered.filter((p) => p.length === filters.length);
    }
    if (filters.embellishment) {
      filtered = filtered.filter((p) => p.embellishment === filters.embellishment);
    }

    // Filter by facet (search)
    if (facet) {
      const query = facet.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.shortDescription.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortBy === "price-asc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else {
      // Featured: sort by rating and featured status
      filtered = [...filtered].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return b.rating - a.rating;
      });
    }

    return filtered;
  }, [allProducts, slug, facet, sortBy, selectedVariant, selectedChip, filters]);

  const handleVariantChange = (variant: string | null) => {
    setSelectedVariant(variant);
    const params = new URLSearchParams(searchParams.toString());
    if (variant) {
      params.set("variant", variant);
    } else {
      params.delete("variant");
    }
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  // Initialize filters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const variantParam = params.get("variant");
    setSelectedVariant((prev) => {
      if (variantParam && variantParam !== prev) {
        return variantParam;
      }
      if (!variantParam && prev !== null) {
        return null;
      }
      return prev;
    });

    const chipParam = params.get("chip");
    setSelectedChip((prev) => {
      if (chipParam && chipParam !== prev) {
        return chipParam;
      }
      if (!chipParam && prev !== null) {
        return null;
      }
      return prev;
    });

    const newFilters = {
      silhouette: params.get("silhouette"),
      fabric: params.get("fabric"),
      occasion: params.get("occasion"),
      sleeve: params.get("sleeve"),
      length: params.get("length"),
      embellishment: params.get("embellishment"),
    };

    setFilters((prev) => {
      const filtersChanged = 
        newFilters.silhouette !== prev.silhouette ||
        newFilters.fabric !== prev.fabric ||
        newFilters.occasion !== prev.occasion ||
        newFilters.sleeve !== prev.sleeve ||
        newFilters.length !== prev.length ||
        newFilters.embellishment !== prev.embellishment;

      return filtersChanged ? newFilters : prev;
    });
  }, [location.search]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string | null) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(filterName, value);
    } else {
      params.delete(filterName);
    }
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const handleChipClick = (chip: string) => {
    const isActive = selectedChip === chip;
    const newChip = isActive ? null : chip;
    setSelectedChip(newChip);
    const params = new URLSearchParams(searchParams.toString());
    if (newChip) {
      params.set("chip", newChip);
    } else {
      params.delete("chip");
    }
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  return (
    <div className={styles.page}>
      <section className={styles.catalog}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate("/")}>
            {t("shop.home")}
          </button>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={() => navigate(`/shop?category=${slug}`)}>
            {readableCategory}
          </button>
          {facet ? (
            <>
              <span aria-hidden="true">/</span>
              <span className={styles.breadcrumbCurrent}>{facet}</span>
            </>
          ) : null}
        </nav>
        <header className={styles.heading}>
          <h1>{readableCategory}</h1>
          <p>{categorySubtitle}</p>
        </header>
        <div className={styles.chips} role="tablist" aria-label="Sub categories">
          {catalog.chips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`${styles.chip} ${selectedChip === chip ? styles.chipActive : ""}`}
              onClick={() => handleChipClick(chip)}
            >
              {translateChip(chip)}
            </button>
          ))}
        </div>
        
        {availableVariants.length > 0 && (
          <div className={styles.variantFilters} role="group" aria-label="Variant filters">
            <button
              type="button"
              className={`${styles.variantChip} ${!selectedVariant ? styles.variantChipActive : ""}`}
              onClick={() => handleVariantChange(null)}
            >
              {t("common.all")}
            </button>
            {availableVariants.map((variant) => (
              <button
                key={variant}
                type="button"
                className={`${styles.variantChip} ${selectedVariant === variant ? styles.variantChipActive : ""}`}
                onClick={() => handleVariantChange(variant)}
              >
                {variant}
              </button>
            ))}
          </div>
        )}

        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <button type="button" className={`${styles.filter} ${styles.filterPrimary}`}>
              <FiSliders size={16} />
              Filter
            </button>
            {catalog.filters.includes("Silhouette") && availableFilterOptions.silhouette.length > 0 && (
              <FilterDropdown
                label="Silhouette"
                options={availableFilterOptions.silhouette}
                selectedValue={filters.silhouette}
                onSelect={(value) => handleFilterChange("silhouette", value)}
                placeholder="All Silhouette"
              />
            )}
            {catalog.filters.includes("Fabric") && availableFilterOptions.fabric.length > 0 && (
              <FilterDropdown
                label="Fabric"
                options={availableFilterOptions.fabric}
                selectedValue={filters.fabric}
                onSelect={(value) => handleFilterChange("fabric", value)}
                placeholder="All Fabric"
              />
            )}
            {catalog.filters.includes("Occasion") && availableFilterOptions.occasion.length > 0 && (
              <FilterDropdown
                label="Occasion"
                options={availableFilterOptions.occasion}
                selectedValue={filters.occasion}
                onSelect={(value) => handleFilterChange("occasion", value)}
                placeholder="All Occasion"
              />
            )}
            {catalog.filters.includes("Sleeve") && availableFilterOptions.sleeve.length > 0 && (
              <FilterDropdown
                label="Sleeve"
                options={availableFilterOptions.sleeve}
                selectedValue={filters.sleeve}
                onSelect={(value) => handleFilterChange("sleeve", value)}
                placeholder="All Sleeve"
              />
            )}
            {catalog.filters.includes("Length") && availableFilterOptions.length.length > 0 && (
              <FilterDropdown
                label="Length"
                options={availableFilterOptions.length}
                selectedValue={filters.length}
                onSelect={(value) => handleFilterChange("length", value)}
                placeholder="All Length"
              />
            )}
            {catalog.filters.includes("Embellishment") && availableFilterOptions.embellishment.length > 0 && (
              <FilterDropdown
                label="Embellishment"
                options={availableFilterOptions.embellishment}
                selectedValue={filters.embellishment}
                onSelect={(value) => handleFilterChange("embellishment", value)}
                placeholder="All Embellishment"
              />
            )}
          </div>
          <div className={styles.view}>
            <div className={styles.viewToggle} role="group" aria-label="View options">
              <button
                type="button"
                className={`${styles.viewButton} ${viewMode === "grid" ? styles.viewButtonActive : ""}`}
                aria-label={t("profile.grid.view")}
                onClick={() => setViewMode("grid")}
              >
                <FiGrid size={16} />
              </button>
              <button
                type="button"
                className={`${styles.viewButton} ${viewMode === "list" ? styles.viewButtonActive : ""}`}
                aria-label={t("profile.list.view")}
                onClick={() => setViewMode("list")}
              >
                <FiList size={16} />
              </button>
            </div>
            <button
              type="button"
              className={styles.sort}
              onClick={() => {
                const nextSort: typeof sortBy =
                  sortBy === "featured" ? "price-asc" : sortBy === "price-asc" ? "price-desc" : "featured";
                setSortBy(nextSort);
              }}
            >
              {t("shop.sort.by")} <strong>{sortBy === "featured" ? t("shop.sort.featured") : sortBy === "price-asc" ? t("shop.sort.price.asc") : t("shop.sort.price.desc")}</strong>
              <FiChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No products found.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ShopPage;
