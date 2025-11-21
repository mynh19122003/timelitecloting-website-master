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
            user_name: "Nguyễn Thị Lan",
            rating: 5,
            comment: "Sản phẩm rất đẹp và chất lượng tốt. Áo dài vừa vặn, chất liệu lụa mềm mại. Rất hài lòng với sản phẩm này!",
            created_at: "2024-01-15T10:30:00Z",
            verified_purchase: true,
            helpful_count: 12,
          },
          {
            id: 2,
            user_name: "Trần Văn Minh",
            rating: 4,
            comment: "Sản phẩm đẹp, giao hàng nhanh. Chất liệu tốt nhưng giá hơi cao một chút. Nhìn chung là hài lòng.",
            created_at: "2024-01-10T14:20:00Z",
            verified_purchase: true,
            helpful_count: 8,
          },
          {
            id: 3,
            user_name: "Lê Thị Hương",
            rating: 5,
            comment: "Tuyệt vời! Áo dài rất đẹp, thiết kế tinh tế. Dịch vụ khách hàng cũng rất tốt. Sẽ mua thêm sản phẩm khác.",
            created_at: "2024-01-05T09:15:00Z",
            verified_purchase: true,
            helpful_count: 15,
          },
          {
            id: 4,
            user_name: "Phạm Đức Anh",
            rating: 4,
            comment: "Chất lượng sản phẩm tốt, đúng như mô tả. Màu sắc đẹp, form dáng chuẩn. Đáng giá tiền.",
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
        setError("Không thể tải đánh giá");
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
    return date.toLocaleDateString("vi-VN", {
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
        <p className={styles.loading}>Đang tải đánh giá...</p>
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
                  {review.helpful_count} người thấy đánh giá này {t("product.reviews.helpful")}
                </span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

