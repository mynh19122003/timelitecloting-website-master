"use client";

import { FiHeadphones, FiShield, FiTruck } from "react-icons/fi";
import styles from "./ValueProps.module.css";

const valueProps = [
  {
    icon: FiShield,
    title: "Warranty",
    description: "Complementary tailoring and care for 24 months.",
  },
  {
    icon: FiTruck,
    title: "Express Shipping",
    description: "Complimentary to the U.S. for orders above $1,500.",
  },
  {
    icon: FiHeadphones,
    title: "Concierge 24/7",
    description: "Dedicated stylist support for your occasion.",
  },
];

export const ValueProps = () => {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {valueProps.map(({ icon: Icon, title, description }) => (
          <div key={title} className={styles.item}>
            <div className={styles.iconWrapper}>
              <Icon className={styles.icon} />
            </div>
            <div>
              <p className={styles.title}>{title}</p>
              <p className={styles.description}>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
