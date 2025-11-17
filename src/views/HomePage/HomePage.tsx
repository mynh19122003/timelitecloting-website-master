/* eslint-disable @next/next/no-img-element */
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";
import { TimeliteLogo } from "../../components/ui/TimeliteLogo/TimeliteLogo";

const heroTiles = [
  {
    title: "Spring-ready prints",
    subtitle: "Florals",
    image: "/images/image_2.png",
  },
  {
    title: "Tried-and-true denim",
    subtitle: "Denim",
    image: "/images/image_6.png",
  },
];

const featuredCategories = [
  { label: "Women", image: "/images/image_3.png" },
  { label: "Men", image: "/images/image_4.png" },
  { label: "Kids", image: "/images/image_1.png" },
  { label: "Shoes", image: "/images/image_5.png" },
  { label: "Home", image: "/images/image_7.png" },
  { label: "Clearance", image: "/images/image_8.png" },
];

const infoTiles = [
  {
    title: "Sign up for emails & get an extra 25% off",
    description:
      "Save on your next purchase & discover our latest offers. Valid for international customers only.",
    cta: "Sign up",
    to: "/register",
  },
  {
    title: "We now ship to over 200 locations worldwide",
    description: "Shop your favorite brands & send to friends & family around the globe.",
    cta: "Select location",
    to: "/contact",
  },
  {
    title: "Check out our international shipping FAQs",
    description: "Find answers to the most common questions about duties, delivery and tracking.",
    cta: "Get the details",
    to: "/contact",
  },
  {
    title: "Visit the U.S. & come shop in store",
    description: "Get style inspo, gift ideas, great deals & more at our retail locations.",
    cta: "Find a store",
    to: "/contact",
  },
];

export const HomePage = () => {
  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroAnnouncement}>
          <strong>Black Friday</strong>
          <span>Early Access! New deals drop every Friday.</span>
          <Link to="/shop" className={styles.heroAnnouncementLink}>
            Shop our best deals
                </Link>
              </div>

        <div className={styles.heroGrid}>
          <article className={styles.heroMain}>
            <TimeliteLogo className={styles.heroLogo} />
            <p className={styles.heroTag}>New arrivals</p>
            <h1 className={styles.heroTitle}>The latest looks for your wardrobe</h1>
            <div className={styles.heroActions}>
              <Link to="/shop" className={styles.heroButton}>
                Shop new arrivals
              </Link>
              <Link to="/about" className={styles.heroLink}>
                Learn more
              </Link>
            </div>
          </article>

          <div className={styles.heroTiles}>
            {heroTiles.map((tile) => (
              <article key={tile.title} className={styles.heroTile}>
                <img src={tile.image} alt={tile.title} className={styles.heroTileImage} />
                <div className={styles.heroTileText}>
                  <p className={styles.heroTileSubtitle}>{tile.subtitle}</p>
                  <p className={styles.heroTileTitle}>{tile.title}</p>
            </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.categoriesSection}>
        <h2 className={styles.sectionTitle}>Featured categories</h2>
        <div className={styles.categoryGrid}>
          {featuredCategories.map((category) => (
            <Link key={category.label} to="/shop" className={styles.categoryCard}>
              <img src={category.image} alt={category.label} className={styles.categoryImage} />
              <p className={styles.categoryLabel}>{category.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.noticeSection}>
        Timelite.com is a U.S. website. All offers are based on USD, U.S. times & dates. International
        exchange rates will be applied.
      </section>

      <section className={styles.infoSection}>
        {infoTiles.map((tile) => (
          <article key={tile.title} className={styles.infoCard}>
            <p className={styles.infoTitle}>{tile.title}</p>
            <p className={styles.infoBody}>{tile.description}</p>
            <Link to={tile.to} className={styles.infoLink}>
              {tile.cta}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
