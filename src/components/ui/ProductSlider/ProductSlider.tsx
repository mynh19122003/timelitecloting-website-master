/* eslint-disable @next/next/no-img-element */
import { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { ProductCard } from "../ProductCard";
import { Product } from "../../../data/products";
import { useI18n } from "../../../context/I18nContext";
import styles from "./ProductSlider.module.css";

type ProductSliderProps = {
  products: Product[];
  itemsPerView?: number;
  loading?: boolean;
};

export const ProductSlider = ({ 
  products, 
  itemsPerView = 5,
  loading = false 
}: ProductSliderProps) => {
  const { t } = useI18n();
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (!sliderRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener("scroll", checkScrollability);
    window.addEventListener("resize", checkScrollability);

    return () => {
      slider.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current || !trackRef.current) return;

    const slider = sliderRef.current;
    const firstItem = trackRef.current.children[0] as HTMLElement;
    if (!firstItem) return;

    const cardWidth = firstItem.offsetWidth;
    const gap = 32; // gap-8 = 32px
    const scrollAmount = (cardWidth + gap) * itemsPerView;

    const newScrollLeft =
      direction === "left"
        ? slider.scrollLeft - scrollAmount
        : slider.scrollLeft + scrollAmount;

    slider.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className={styles.sliderWrapper}>
        <div className={styles.loading}>
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={styles.sliderWrapper}>
        <div className={styles.empty}>
          <p>{t("product.related.empty", "No related products available")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sliderContainer}>
      {canScrollLeft && (
        <button
          className={`${styles.navButton} ${styles.navButtonLeft}`}
          onClick={() => scroll("left")}
          aria-label="Previous products"
        >
          <FiChevronLeft size={24} />
        </button>
      )}
      
      <div className={styles.sliderWrapper} ref={sliderRef}>
        <div className={styles.sliderTrack} ref={trackRef}>
          {products.map((product) => (
            <div key={product.id} className={styles.sliderItem}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {canScrollRight && (
        <button
          className={`${styles.navButton} ${styles.navButtonRight}`}
          onClick={() => scroll("right")}
          aria-label="Next products"
        >
          <FiChevronRight size={24} />
        </button>
      )}
    </div>
  );
};

