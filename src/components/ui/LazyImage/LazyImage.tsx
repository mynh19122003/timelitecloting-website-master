"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./LazyImage.module.css";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  loading?: "lazy" | "eager";
  placeholder?: string;
}

export const LazyImage = ({
  src,
  alt,
  className = "",
  fallback = "/images/image_1.png",
  onError,
  loading = "lazy",
  placeholder,
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder || fallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (loading === "lazy" && typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = new Image();
              img.src = src;
              img.onload = () => {
                setImageSrc(src);
                setIsLoaded(true);
              };
              img.onerror = () => {
                setHasError(true);
                setImageSrc(fallback);
              };
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: "50px",
        }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        observer.disconnect();
      };
    } else {
      setImageSrc(src);
    }
  }, [src, loading, fallback]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallback);
    }
    onError?.(e);
  };

  return (
    <div className={`${styles.imageWrapper} ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${styles.image} ${isLoaded ? styles.loaded : ""}`}
        loading={loading}
        onError={handleError}
        decoding="async"
        fetchPriority={loading === "eager" ? "high" : "auto"}
      />
      {!isLoaded && loading === "lazy" && (
        <div className={styles.placeholder}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
};

