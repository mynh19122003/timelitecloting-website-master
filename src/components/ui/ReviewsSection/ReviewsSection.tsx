import { useState, useEffect } from "react";
import { FiStar } from "react-icons/fi";
import { useI18n } from "../../../context/I18nContext";
import styles from "./ReviewsSection.module.css";
import ApiService from "../../../services/api";

export interface Review {
  id: number | string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  verified_purchase?: boolean;
  helpful_count?: number;
}

interface ReviewsSectionProps {
  productId: string | number;
  productRating?: number;
  productReviewsCount?: number;
}

export const ReviewsSection = ({ 
  productId, 
  productRating = 0, 
  productReviewsCount = 0 
}: ReviewsSectionProps) => {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch reviews from API
        // For now, we'll use mock data since API might not have reviews endpoint yet
        // TODO: Replace with actual API call when reviews endpoint is available
        // const response = await ApiService.getProductReviews(productId);
        // setReviews(response.reviews || []);
        
        // Mock data for demonstration
        const mockReviews: Review[] = [
          {
            id: 1,
            user_name: "Lan Nguyen",
            rating: 5,
            comment: "Stunning craftsmanship and buttery silk. The ao dai fit perfectly and feels luxurious.",
            created_at: "2024-01-15T10:30:00Z",
            verified_purchase: true,
            helpful_count: 12,
          },
          {
            id: 2,
            user_name: "Minh Tran",
            rating: 4,
            comment: "Beautiful piece with fast shipping. Fabric is excellent, though the price is on the higher side.",
            created_at: "2024-01-10T14:20:00Z",
            verified_purchase: true,
            helpful_count: 8,
          },
          {
            id: 3,
            user_name: "Huong Le",
            rating: 5,
            comment: "Wonderful experience. The design is refined and the customer service team was incredibly helpful.",
            created_at: "2024-01-05T09:15:00Z",
            verified_purchase: true,
            helpful_count: 15,
          },
          {
            id: 4,
            user_name: "Duc Pham",
            rating: 4,
            comment: "Quality matches the description. Vibrant colors and precise tailoring—definitely worth the investment.",
            created_at: "2023-12-28T16:45:00Z",
            verified_purchase: true,
            helpful_count: 6,
          },
        ];

        // Only show mock reviews if product has reviews count > 0
        if (productReviewsCount > 0) {
          // Show a subset based on actual review count
          const reviewsToShow = Math.min(mockReviews.length, productReviewsCount);
          setReviews(mockReviews.slice(0, reviewsToShow));
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
        setError("Unable to load reviews");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadReviews();
    }
  }, [productId, productReviewsCount]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= Math.round(rating);
      return (
        <FiStar
          key={index}
          className={`${styles.star} ${isFilled ? styles.starFilled : ""}`}
        />
      );
    });
  };

  if (loading) {
    return (
      <section className={styles.reviewsSection}>
        <h2 className={styles.title}>{t("product.reviews.title")}</h2>
        <p className={styles.loading}>Loading reviews...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.reviewsSection}>
        <h2 className={styles.title}>{t("product.reviews.title")}</h2>
        <p className={styles.error}>{error}</p>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className={styles.reviewsSection}>
        <h2 className={styles.title}>{t("product.reviews.title")}</h2>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{t("product.reviews.empty")}</p>
        </div>
      </section>
    );
  }

  // Calculate average rating from reviews
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t("product.reviews.title")}</h2>
        {productReviewsCount > 0 && (
          <p className={styles.summary}>
            {t("product.reviews.rating.summary").replace(
              "{count}",
              productReviewsCount.toString()
            )}
          </p>
        )}
      </div>

      <div className={styles.ratingSummary}>
        <div className={styles.ratingDisplay}>
          <span className={styles.ratingValue}>
            {productRating > 0 ? productRating.toFixed(1) : averageRating.toFixed(1)}
          </span>
          <div className={styles.starsContainer}>
            {renderStars(productRating > 0 ? productRating : averageRating)}
          </div>
        </div>
      </div>

      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <article key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                <h3 className={styles.reviewerName}>{review.user_name}</h3>
                {review.verified_purchase && (
                  <span className={styles.verifiedBadge}>
                    {t("product.reviews.verified.purchase")}
                  </span>
                )}
              </div>
              <div className={styles.reviewMeta}>
                <div className={styles.reviewRating}>
                  {renderStars(review.rating)}
                </div>
                <time className={styles.reviewDate}>
                  {formatDate(review.created_at)}
                </time>
              </div>
            </div>
            <p className={styles.reviewComment}>{review.comment}</p>
            {review.helpful_count !== undefined && review.helpful_count > 0 && (
              <div className={styles.reviewFooter}>
                <span className={styles.helpfulText}>
                  {review.helpful_count} people found this review {t("product.reviews.helpful")}
                </span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

