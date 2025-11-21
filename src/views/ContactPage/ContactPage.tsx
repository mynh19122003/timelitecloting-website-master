import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { ValueProps } from "../../components/ui/ValueProps";
import { useI18n } from "../../context/I18nContext";
import styles from "./ContactPage.module.css";

export const ContactPage = () => {
  const { t } = useI18n();
  
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>{t("contact.eyebrow")}</span>
          <h1 className={styles.heroTitle}>{t("contact.title")}</h1>
          <p className={styles.heroText}>
            {t("contact.description")}
          </p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.column}>
            <div>
              <h2 className={styles.sectionTitle}>{t("contact.boutique")}</h2>
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
                    <p className={styles.schedule}>{t("contact.by.appointment")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.conciergeSection}>
              <h3 className={styles.sectionTitle}>{t("contact.concierge")}</h3>
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
                  {t("contact.hours")}
                </p>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <p className={styles.serviceTitle}>{t("contact.styling.services")}</p>
              <ul className={styles.serviceList}>
                <li>- {t("contact.virtual.fittings")}</li>
                <li>- {t("contact.personalized.lookbook")}</li>
                <li>- {t("contact.concierge.support")}</li>
              </ul>
            </div>
          </div>

          <div className={styles.formCard}>
            <form className={styles.form}>
              <div>
                <label className={styles.label}>{t("contact.name")}</label>
                <input type="text" className={styles.input} placeholder={t("contact.name.placeholder")} />
              </div>
              <div className={styles.twoCol}>
                <div>
                  <label className={styles.label}>{t("contact.email")}</label>
                  <input type="email" className={styles.input} placeholder={t("contact.email.placeholder")} />
                </div>
                <div>
                  <label className={styles.label}>{t("contact.phone")}</label>
                  <input type="tel" className={styles.input} placeholder={t("contact.phone.placeholder")} />
                </div>
              </div>
              <div>
                <label className={styles.label}>{t("contact.event.date")}</label>
                <input type="date" className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>{t("contact.message")}</label>
                <textarea
                  rows={5}
                  className={styles.textArea}
                  placeholder={t("contact.message.placeholder")}
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                {t("contact.submit.request")}
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
