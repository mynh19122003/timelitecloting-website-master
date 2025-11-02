/* eslint-disable @next/next/no-img-element */
import { ValueProps } from "../../components/ui/ValueProps";
import styles from "./AboutPage.module.css";

const timelines = [
  {
    year: "2016",
    title: "Timelite founded in Saigon",
    description: "Started as a small couture atelier dedicated to bespoke ao dai for brides.",
  },
  {
    year: "2019",
    title: "Concierge service launched for U.S. clients",
    description: "Built a bi-continental team linking New York stylists with artisans in Vietnam.",
  },
  {
    year: "2023",
    title: "First Manhattan showroom opens",
    description: "Introduced the Heritage Capsule to the American luxury bridal community.",
  },
];

export const AboutPage = () => {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>About Timelite</span>
          <h1 className={styles.heroTitle}>Reimagining Vietnamese ao dai for the global couture stage</h1>
          <p className={styles.heroText}>
            We connect Vietnamese heritage with the design, operations, and service standards of American
            luxury fashion to create modern heirlooms for clients worldwide.
          </p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.splitGrid}>
          <div className={styles.philosophyContainer}>
            <h2 className={styles.philosophyTitle}>Design philosophy</h2>
            <p className={styles.philosophyText}>
              Timelite designs around three pillars: elevated materials, couture craftsmanship, and a
              deeply personal client experience. Every garment begins with the wearer&apos;s story, whether she
              is a Vietnamese-American bride in Manhattan or a founder preparing for a Los Angeles gala.
            </p>
            <p className={styles.philosophyText}>
              We collaborate with master embroiderers in Hue and Hanoi and partner with international
              stylists to ensure each piece honors Vietnamese roots while standing shoulder to shoulder
              with global luxury houses.
            </p>
          </div>

          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>A few milestones</h3>
            <ul className={styles.statsList}>
              <li>- Over 1,200 Vietnamese brides in the U.S. have chosen Timelite for their celebrations.</li>
              <li>- 20 full-time artisans specialize in embroidery, tailoring, and structural fitting.</li>
              <li>- Concierge response within 48 hours, the fastest in our couture segment.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <h2 className={styles.timelineTitle}>Timeline</h2>
        <div className={styles.timelineGrid}>
          {timelines.map((item) => (
            <div key={item.year} className={styles.timelineCard}>
              <p className={styles.timelineYear}>{item.year}</p>
              <h3 className={styles.timelineCardTitle}>{item.title}</h3>
              <p className={styles.timelineDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.dualGrid}>
        <div className={styles.teamCard}>
          <h2 className={styles.teamTitle}>Our team</h2>
          <p className={styles.teamText}>
            The New York stylist collective is led by founder Minh Anh, a Parsons graduate, who works
            hand in hand with master tailors in Saigon. Each commission includes a dedicated project
            manager to protect timelines and couture standards.
          </p>
          <p className={styles.teamText}>
            A 16-step quality control process ensures that every garment is inspected before it leaves our
            atelier, guaranteeing a made-to-measure fit on arrival.
          </p>
        </div>
        <div className={styles.sustainabilityCard}>
          <h2 className={styles.teamTitle}>Sustainability promise</h2>
          <p className={styles.teamText}>
            Timelite sources organic mulberry silk, produces primarily made-to-order to avoid excess
            inventory, and uses recycled packing materials whenever possible. We prioritize low-emission
            logistics partners to reduce our footprint across the U.S.
          </p>
        </div>
      </section>

      <div className={styles.valueProps}>
        <ValueProps />
      </div>
    </div>
  );
};

export default AboutPage;


