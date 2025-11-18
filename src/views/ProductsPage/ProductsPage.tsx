import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiGrid, FiList, FiSliders } from "react-icons/fi";
import {
  categoryLabels,
  normalizeCategory,
  type Category,
  type Product as UiProduct,
} from "../../data/products";
import { ProductCard } from "../../components/ui/ProductCard";
import styles from "./ProductsPage.module.css";
import ApiService from "../../services/api";
import { getAdminMediaUrl, normalizePossibleMediaUrl, toProductsPid } from "../../config/api";

const toCategorySlug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type ExtendedCategory = Category | "all" | "other";

type ApiProduct = {
  id?: number | string;
  slug?: string;
  products_id?: string | number;
  name?: string;
  short_description?: string;
  description?: string;
  price?: number | string;
  original_price?: number | string;
  image_url?: string;
  gallery?: string[] | string;
  category?: string;
  colors?: string[] | string;
  sizes?: string[] | string;
  tags?: string[] | string;
  rating?: number | string;
  reviews?: number | string;
  is_featured?: boolean | number;
  is_new?: boolean | number;
  variant?: string;
  silhouette?: string;
  fabric?: string;
  occasion?: string;
  sleeve?: string;
  length?: string;
  embellishment?: string;
};

export const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const categoryParam = params.get("category") || "";
  const facetParam = params.get("facet") || "";

  const [selectedCategory, setSelectedCategory] = useState<ExtendedCategory>("all");
  const [allProducts, setAllProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (categoryParam) {
      const normalized = normalizeCategory(categoryParam) || toCategorySlug(categoryParam);
      setSelectedCategory((normalized as ExtendedCategory) || "all");
    }
  }, [categoryParam]);

  useEffect(() => {
    let isMounted = true;
    const mapProduct = (p: ApiProduct): UiProduct => {
      const slug: string | undefined = p.slug ?? undefined;
      const productsId: string | undefined = p.products_id ?? undefined;

      const fromSlug = (s?: string): Category | "other" => {
        if (!s) return "other";
        if (s.startsWith("ao-dai-")) return "ao-dai";
        if (s.startsWith("vest-")) return "vest";
        if (s.startsWith("wedding-") || s.startsWith("bridal-")) return "wedding";
        if (s.startsWith("evening-")) return "evening";
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
      const gallery = galleryRaw.map((g: string) => normalizePossibleMediaUrl(g) || g);

      const apiCategory = p.category ? normalizeCategory(p.category) : fromSlug(slug);
      const fallbackCategory = fromSlug(slug);
      const finalCategory: Category =
        apiCategory !== "other"
          ? apiCategory
          : fallbackCategory !== "other"
          ? fallbackCategory
          : "ao-dai";

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

      const pid = productsId ? toProductsPid(productsId) : p.id ? toProductsPid(p.id) : undefined;

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
    ApiService.getProducts({ limit: 1000 })
      .then((res) => {
        const list = res?.products ?? [];
        if (isMounted) setAllProducts(list.map(mapProduct));
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        const status = typeof error === "object" && error && "status" in error ? (error as { status?: unknown }).status : undefined;
        console.error("[ProductsPage] Error loading products:", {
          error: message,
          status,
        });
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

    return allProducts.filter((product) => {
      if (selectedCategory && selectedCategory !== "all") {
        if (selectedCategory === "other") {
          if (knownCategories.includes(product.category as Category)) return false;
        } else if (product.category !== (selectedCategory as Category)) {
          return false;
        }
      }

      if (facetParam.trim()) {
        const query = facetParam.toLowerCase().trim();
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          product.shortDescription.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [allProducts, selectedCategory, facetParam]);

  const getCategoryTitle = (category: ExtendedCategory): string => {
    if (category === "all") return "All Products";
    if (category === "other") return "Other";
    return categoryLabels[category as Category] || category;
  };

  const getCategorySubtitle = (category: ExtendedCategory): string => {
    if (category === "all") return "Explore our complete collection of elegant fashion pieces.";
    if (category === "ao-dai") return "Modern silhouettes reinvented from Saigon ateliers.";
    if (category === "vest") return "Tailored suits and separates engineered for modern ceremonies.";
    if (category === "wedding") return "Dramatic silhouettes, couture draping and heirloom embellishment.";
    if (category === "evening") return "Runway-ready gowns, sculptural pleats and dramatic trains.";
    return "Discover our curated selection.";
  };

  const getCategoryChips = (category: ExtendedCategory): string[] => {
    if (category === "ao-dai") {
      return ["Silk Essentials", "Hand-Painted Motifs", "Pearl Embroidery", "Heritage Red", "Runway Pastels"];
    }
    if (category === "vest") {
      return ["Modern Slim", "Classic Cut", "Italian Linen", "Velvet Tux", "Destination Ready"];
    }
    if (category === "wedding") {
      return ["Mermaid", "Ball Gown", "Column", "Convertible", "Mini Reception"];
    }
    if (category === "evening") {
      return ["Velvet Evenings", "Gilded Sequins", "Satin Columns", "Cape Moments"];
    }
    return [];
  };

  const readableCategory = getCategoryTitle(selectedCategory);
  const categorySubtitle = getCategorySubtitle(selectedCategory);
  const categoryChips = getCategoryChips(selectedCategory);

  return (
    <div className={styles.page}>
      <section className={styles.catalog}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button type="button" onClick={() => navigate("/")}>
            Home
          </button>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={() => navigate("/products")}>
            {readableCategory}
          </button>
          {facetParam ? (
            <>
              <span aria-hidden="true">/</span>
              <span className={styles.breadcrumbCurrent}>{facetParam}</span>
            </>
          ) : null}
        </nav>

        <header className={styles.heading}>
          <h1>{readableCategory}</h1>
          <p>{categorySubtitle}</p>
        </header>

        {categoryChips.length > 0 && (
          <div className={styles.chips} role="tablist" aria-label="Sub categories">
            {categoryChips.map((chip) => (
              <button key={chip} type="button" className={styles.chip}>
                {chip}
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
            <button type="button" className={styles.filter}>
              Silhouette
              <FiChevronDown size={14} />
            </button>
            <button type="button" className={styles.filter}>
              Fabric
              <FiChevronDown size={14} />
            </button>
            <button type="button" className={styles.filter}>
              Price
              <FiChevronDown size={14} />
            </button>
          </div>
          <div className={styles.view}>
            <div className={styles.viewToggle} role="group" aria-label="View options">
              <button type="button" className={`${styles.viewButton} ${styles.viewButtonActive}`} aria-label="Grid view">
                <FiGrid size={16} />
              </button>
              <button type="button" className={styles.viewButton} aria-label="List view">
                <FiList size={16} />
              </button>
            </div>
            <button type="button" className={styles.sort}>
              Sort by <strong>Featured Items</strong>
              <FiChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div className={styles.emptyState}>
              <p>Loading products...</p>
            </div>
          ) : (
            filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </div>

        {!loading && filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No products found.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductsPage;

