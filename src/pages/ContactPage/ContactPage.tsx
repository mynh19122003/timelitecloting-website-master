/* eslint-disable @next/next/no-img-element */
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { ValueProps } from "../../components/ui/ValueProps";
import styles from "./ContactPage.module.css";

export const ContactPage = () => {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Contact</span>
          <h1 className={styles.heroTitle}>Connect with the Timelite concierge</h1>
          <p className={styles.heroText}>
            Our stylist team is ready to support measurements, curate moodboards, and arrange virtual
            fittings for clients throughout the United States.
          </p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.column}>
            <div>
              <h2 className={styles.sectionTitle}>Boutique</h2>
              <div className={styles.locationList}>
                <div className={styles.locationItem}>
                  <FiMapPin className={styles.locationIcon} />
                  <div>
                    <p className={styles.locationHeader}>San Jose, California</p>
                    <p>
                      236 N Claremont Ave
                      <br />
                      San Jose, CA 95127
                    </p>
                    <p className={styles.schedule}>By appointment only</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.conciergeSection}>
              <h3 className={styles.sectionTitle}>Concierge</h3>
              <div className={styles.contactInfo}>
                <p className={styles.contactItem}>
                  <FiPhone className={styles.locationIcon} />
                  <a href="tel:+16692547401">669.254.7401</a>
                </p>
                <p className={styles.contactItem}>
                  <FiMail className={styles.locationIcon} />
                  <a href="mailto:tim19092016@gmail.com">tim19092016@gmail.com</a>
                </p>
                <p className={styles.schedule}>
                  Mon - Sat: 9:00 AM - 6:00 PM (PST)
                </p>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <p className={styles.serviceTitle}>Styling services</p>
              <ul className={styles.serviceList}>
                <li>- Virtual fittings via Zoom</li>
                <li>- Personalized lookbook and color palette</li>
                <li>- Concierge support before and after your event</li>
              </ul>
            </div>
          </div>

          <div className={styles.formCard}>
            <form className={styles.form}>
              <div>
                <label className={styles.label}>Name</label>
                <input type="text" className={styles.input} placeholder="Your name" />
              </div>
              <div className={styles.twoCol}>
                <div>
                  <label className={styles.label}>Email</label>
                  <input type="email" className={styles.input} placeholder="you@email.com" />
                </div>
                <div>
                  <label className={styles.label}>Phone</label>
                  <input type="tel" className={styles.input} placeholder="+1 (212) ..." />
                </div>
              </div>
              <div>
                <label className={styles.label}>Event date (optional)</label>
                <input type="date" className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>Message</label>
                <textarea
                  rows={5}
                  className={styles.textArea}
                  placeholder="Tell us about your occasion, style preferences, or sizing questions."
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                Submit request
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className={styles.valueProps}>
        <ValueProps />
      </div>
    </div>
  );
};

  export default ContactPage;
