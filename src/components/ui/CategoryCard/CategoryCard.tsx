/* eslint-disable @next/next/no-img-element */
"use client";

import { Link } from "react-router-dom";
import { Category, categoryLabels } from "../../../data/products";
import styles from "./CategoryCard.module.css";

type CategoryCardProps = {
  category: Category;
  image: string;
  description: string;
  accent?: "primary" | "gold";
};

export const CategoryCard = ({
  category,
  image,
  description,
  accent = "primary",
}: CategoryCardProps) => {
  const eyebrowClass = accent === "primary" ? styles.eyebrow : styles.eyebrowGold;

  return (
  <article className={`${styles.card} group`}>
      <img
        src={image}
        alt={categoryLabels[category]}
        className={styles.image}
      />
      <div className={styles.content}>
        <span className={eyebrowClass}>{categoryLabels[category]}</span>
        <p className={styles.title}>
          {category === "ao-dai" ? "Ao Dai signature" : categoryLabels[category]}
        </p>
        <p className={styles.description}>{description}</p>
        <Link to={`/shop?category=${category}`} className={styles.link}>
          Explore
          <span className={styles.linkLine} />
        </Link>
      </div>
    </article>
  );
};
