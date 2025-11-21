import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getApiUrl } from "../../config/api";
import { useI18n } from "../../context/I18nContext";
import styles from "./VerifyEmailPage.module.css";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t("error.verification.invalid"));
      setIsVerifying(false);
      return;
    }

    // Call API to verify email
    const verifyEmail = async () => {
      try {
        const response = await fetch(getApiUrl('/api/node/users/verify-email'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || t("verify.email.failed.message"));
          setIsVerifying(false);
          return;
        }

        // Success
        setSuccess(true);
        setIsVerifying(false);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: unknown) {
        console.error('Verify email error:', err);
        setError(t("verify.email.network.error"));
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.card}>
          <h1 className={styles.heading}>{t("verify.email.title")}</h1>

          {isVerifying && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>{t("verify.email.verifying")}</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p className={styles.errorTitle}>{t("verify.email.failed")}</p>
              <p className={styles.errorText}>{error}</p>
              <Link to="/login" className={styles.button}>
                {t("verify.email.return.login")}
              </Link>
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <p className={styles.successTitle}>{t("verify.email.success")}</p>
              <p className={styles.successText}>
                {t("verify.email.success.message")}
              </p>
              <Link to="/login" className={styles.button}>
                {t("verify.email.go.login")}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VerifyEmailPage;



