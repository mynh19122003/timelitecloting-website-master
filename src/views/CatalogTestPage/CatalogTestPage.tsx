"use client";

import { useEffect, useState } from "react";
import { API_CONFIG } from "../../config/api";

interface Category {
  label: string;
  slug: string;
}

interface Variant {
  id: number;
  variant_name: string;
  category_slug: string;
  sort_order: number;
  created_at: string;
}

interface VariantsByCategory {
  [categorySlug: string]: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const CatalogTestPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsByCategory, setVariantsByCategory] =
    useState<VariantsByCategory>({});
  const [loading, setLoading] = useState({
    categories: false,
    variants: false,
    variantsGrouped: false,
  });
  const [errors, setErrors] = useState({
    categories: "",
    variants: "",
    variantsGrouped: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading((prev) => ({ ...prev, categories: true }));
    setErrors((prev) => ({ ...prev, categories: "" }));

    try {
      const url = `${API_CONFIG.BASE_URL}/api/php/products/categories`;
      console.log("[CatalogTest] Fetching categories from:", url);

      const response = await fetch(url);
      const data: ApiResponse<{ categories: Category[] }> =
        await response.json();

      console.log("[CatalogTest] Categories response:", data);

      if (data.success && data.data?.categories) {
        setCategories(data.data.categories);
      } else {
        setErrors((prev) => ({
          ...prev,
          categories: data.message || "Failed to fetch categories",
        }));
      }
    } catch (error) {
      console.error("[CatalogTest] Error fetching categories:", error);
      setErrors((prev) => ({ ...prev, categories: String(error) }));
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  // Fetch variants
  const fetchVariants = async (categorySlug?: string) => {
    setLoading((prev) => ({ ...prev, variants: true }));
    setErrors((prev) => ({ ...prev, variants: "" }));

    try {
      let url = `${API_CONFIG.BASE_URL}/api/php/products/variants`;
      if (categorySlug) {
        url += `?category=${encodeURIComponent(categorySlug)}`;
      }
      console.log("[CatalogTest] Fetching variants from:", url);

      const response = await fetch(url);
      const data: ApiResponse<{ variants: Variant[] }> = await response.json();

      console.log("[CatalogTest] Variants response:", data);

      if (data.success && data.data?.variants) {
        setVariants(data.data.variants);
      } else {
        setErrors((prev) => ({
          ...prev,
          variants: data.message || "Failed to fetch variants",
        }));
      }
    } catch (error) {
      console.error("[CatalogTest] Error fetching variants:", error);
      setErrors((prev) => ({ ...prev, variants: String(error) }));
    } finally {
      setLoading((prev) => ({ ...prev, variants: false }));
    }
  };

  // Fetch variants grouped by category
  const fetchVariantsGrouped = async () => {
    setLoading((prev) => ({ ...prev, variantsGrouped: true }));
    setErrors((prev) => ({ ...prev, variantsGrouped: "" }));

    try {
      const url = `${API_CONFIG.BASE_URL}/api/php/products/variants-grouped`;
      console.log("[CatalogTest] Fetching variants-grouped from:", url);

      const response = await fetch(url);
      const data: ApiResponse<{ variantsByCategory: VariantsByCategory }> =
        await response.json();

      console.log("[CatalogTest] Variants grouped response:", data);

      if (data.success && data.data?.variantsByCategory) {
        setVariantsByCategory(data.data.variantsByCategory);
      } else {
        setErrors((prev) => ({
          ...prev,
          variantsGrouped: data.message || "Failed to fetch grouped variants",
        }));
      }
    } catch (error) {
      console.error("[CatalogTest] Error fetching grouped variants:", error);
      setErrors((prev) => ({ ...prev, variantsGrouped: String(error) }));
    } finally {
      setLoading((prev) => ({ ...prev, variantsGrouped: false }));
    }
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchVariants();
    fetchVariantsGrouped();
  }, []);

  // Filter variants when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchVariants(selectedCategory);
    } else {
      fetchVariants();
    }
  }, [selectedCategory]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧪 Catalog API Test Page</h1>
      <p style={styles.subtitle}>
        API Base URL: <code style={styles.code}>{API_CONFIG.BASE_URL}</code>
      </p>

      {/* Categories Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📁 Categories</h2>
          <button
            onClick={fetchCategories}
            disabled={loading.categories}
            style={styles.refreshBtn}
          >
            {loading.categories ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>
        <p style={styles.endpoint}>
          GET <code style={styles.code}>/api/php/products/categories</code>
        </p>

        {errors.categories && (
          <p style={styles.error}>❌ {errors.categories}</p>
        )}

        {categories.length > 0 ? (
          <div style={styles.grid}>
            {categories.map((cat) => (
              <div key={cat.slug} style={styles.card}>
                <strong>{cat.label}</strong>
                <br />
                <small style={styles.slug}>slug: {cat.slug}</small>
              </div>
            ))}
          </div>
        ) : (
          !loading.categories && <p style={styles.empty}>No categories found</p>
        )}
      </section>

      {/* Variants Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🏷️ Variants</h2>
          <button
            onClick={() => fetchVariants(selectedCategory)}
            disabled={loading.variants}
            style={styles.refreshBtn}
          >
            {loading.variants ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>
        <p style={styles.endpoint}>
          GET{" "}
          <code style={styles.code}>
            /api/php/products/variants?category={"<slug>"}
          </code>
        </p>

        {/* Category Filter */}
        <div style={styles.filterRow}>
          <label style={styles.label}>Filter by category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {errors.variants && <p style={styles.error}>❌ {errors.variants}</p>}

        {variants.length > 0 ? (
          <div style={styles.grid}>
            {variants.map((v) => (
              <div key={v.id} style={styles.card}>
                <strong>{v.variant_name}</strong>
                <br />
                <small style={styles.slug}>category: {v.category_slug}</small>
                <br />
                <small style={styles.slug}>order: {v.sort_order}</small>
              </div>
            ))}
          </div>
        ) : (
          !loading.variants && <p style={styles.empty}>No variants found</p>
        )}
      </section>

      {/* Variants Grouped Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📊 Variants Grouped by Category</h2>
          <button
            onClick={fetchVariantsGrouped}
            disabled={loading.variantsGrouped}
            style={styles.refreshBtn}
          >
            {loading.variantsGrouped ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>
        <p style={styles.endpoint}>
          GET{" "}
          <code style={styles.code}>/api/php/products/variants-grouped</code>
        </p>

        {errors.variantsGrouped && (
          <p style={styles.error}>❌ {errors.variantsGrouped}</p>
        )}

        {Object.keys(variantsByCategory).length > 0 ? (
          <div style={styles.groupedContainer}>
            {Object.entries(variantsByCategory).map(
              ([categorySlug, variantNames]) => (
                <div key={categorySlug} style={styles.groupCard}>
                  <h4 style={styles.groupTitle}>{categorySlug}</h4>
                  <div style={styles.tagContainer}>
                    {variantNames.map((name) => (
                      <span key={name} style={styles.tag}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          !loading.variantsGrouped && (
            <p style={styles.empty}>No grouped variants found</p>
          )
        )}
      </section>

      {/* Usage Example */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📝 Usage in ShopPage</h2>
        <pre style={styles.codeBlock}>
          {`// Replace hardcoded VARIANTS_BY_CATEGORY_SLUG with API data:

// Before (hardcoded):
const VARIANTS_BY_CATEGORY_SLUG = {
  "ao-dai": ["Bridal Ao Dai", "Designer Ao Dai (Women)", ...],
  // ...
};

// After (dynamic):
const [variantsByCategory, setVariantsByCategory] = useState({});

useEffect(() => {
  fetch("/api/php/products/variants-grouped")
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setVariantsByCategory(data.data.variantsByCategory);
      }
    });
}, []);

// Use in component:
const availableVariants = variantsByCategory[categorySlug] || [];`}
        </pre>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "system-ui, sans-serif",
    backgroundColor: "#fdfaf5",
    minHeight: "100vh",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#1f1f1f",
  },
  subtitle: {
    color: "#666",
    marginBottom: "2rem",
  },
  code: {
    backgroundColor: "#e8e8e8",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "0.9rem",
  },
  section: {
    marginBottom: "2.5rem",
    padding: "1.5rem",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: 0,
    color: "#1f1f1f",
  },
  endpoint: {
    color: "#666",
    marginBottom: "1rem",
    fontSize: "0.9rem",
  },
  refreshBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#131313",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1rem",
  },
  card: {
    padding: "1rem",
    backgroundColor: "#f8f6f2",
    borderRadius: "8px",
    border: "1px solid #e8e4dc",
  },
  slug: {
    color: "#888",
    fontSize: "0.85rem",
  },
  error: {
    color: "#c53030",
    backgroundColor: "#fff5f5",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px solid #feb2b2",
  },
  empty: {
    color: "#666",
    fontStyle: "italic",
  },
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  label: {
    fontWeight: "500",
  },
  select: {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: "1px solid #d4d4d4",
    fontSize: "1rem",
    minWidth: "200px",
  },
  groupedContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  groupCard: {
    padding: "1rem",
    backgroundColor: "#f8f6f2",
    borderRadius: "8px",
    border: "1px solid #e8e4dc",
  },
  groupTitle: {
    margin: "0 0 0.75rem 0",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#333",
  },
  tagContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  tag: {
    padding: "0.35rem 0.75rem",
    backgroundColor: "#fff",
    borderRadius: "999px",
    border: "1px solid #cec5b8",
    fontSize: "0.85rem",
    color: "#555",
  },
  codeBlock: {
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
    padding: "1rem",
    borderRadius: "8px",
    overflow: "auto",
    fontSize: "0.85rem",
    lineHeight: "1.5",
  },
};

export default CatalogTestPage;
