/* eslint-disable @next/next/no-img-element */
import { Link } from "react-router-dom";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { CategoryCard } from "../../components/ui/CategoryCard";
import { ValueProps } from "../../components/ui/ValueProps";
import styles from "./HomePage.module.css";

const categories = [
  {
    category: "ao-dai" as const,
    image: "/images/image_2.png",
    description:
      "Heritage ao dai redesigned with couture craftsmanship for women living in the United States.",
    accent: "primary" as const,
  },
  {
    category: "wedding" as const,
    image: "/images/image_1.png",
    description:
      "Statement bridal gowns and wedding ao dai that balance Vietnamese tradition with modern American style.",
    accent: "gold" as const,
  },
  {
    category: "vest" as const,
    image: "/images/image_6.png",
    description:
      "Tailor-made vests and separates that celebrate sharp minimal lines with Timelite signatures in gold.",
    accent: "primary" as const,
  },
];

export const HomePage = () => {
  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroWrapper}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Timelite Couture</span>
              <h1 className={styles.headingLarge}>
                Ao Dai heritage, reimagined for the American aesthetic
              </h1>
              <p className={styles.bodyText}>
                Explore a considered edit of ao dai, tailored suiting, bridal wear and evening dresses.
                Every silhouette is handcrafted in Saigon and finished with couture techniques to meet the
                expectations of luxury clients across the United States.
              </p>
              <div className={styles.ctaGroup}>
                <Link to="/shop" className={styles.primaryCta}>
                  Shop Ao Dai
                </Link>
                <Link to="/about" className={styles.secondaryCta}>
                  Our Story
                </Link>
              </div>
            </div>
            <div className={styles.heroBadge}>
              <img
                src="/images/banner2.png"
                alt="Timelite Couture atelier details"
                className={styles.heroBadgeImage}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.collectionsSection}>
        <SectionHeading
          eyebrow="Collections"
          title="Signature categories"
          description="We spotlight the ao dai as our house icon, complemented by tailored separates, bridal gowns, and eveningwear that transition from cultural ceremonies to Manhattan rooftops."
        />
        <div className={styles.collectionsGrid}>
          {categories.map((item) => (
            <CategoryCard key={item.category} {...item} />
          ))}
        </div>
      </section>

      <ValueProps />

      <section className={styles.experienceSection}>
        <div className={styles.experienceCard}>
          <img
            src="/images/image_3.png"
            alt="Timelite stylist consultation"
            className={styles.experienceImage}
          />
          <div className={styles.experienceContent}>
            <span className={styles.eyebrow}>Couture Experience</span>
            <h3 className={styles.experienceTitle}>
              Virtual fittings with a dedicated Timelite stylist
            </h3>
            <p className={styles.bodyText}>
              Receive a made-to-measure experience from your home. We guide measurements, create
              personalized moodboards, and oversee every alteration until the garment fits perfectly.
            </p>
            <ul className={styles.experienceList}>
              <li>
                <span className={styles.listMarker} aria-hidden="true" />
                Complimentary US measurement kit
              </li>
              <li>
                <span className={styles.listMarker} aria-hidden="true" />
                Alterations within 14 days of delivery
              </li>
              <li>
                <span className={styles.listMarker} aria-hidden="true" />
                Video fittings and styling sessions
              </li>
            </ul>
            <Link to="/contact" className={styles.experienceCta}>
              Book consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
