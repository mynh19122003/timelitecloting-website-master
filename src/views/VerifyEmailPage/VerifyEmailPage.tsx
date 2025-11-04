import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getApiUrl, API_CONFIG } from "../../config/api";
import styles from "./VerifyEmailPage.module.css";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link.');
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
          setError(data.message || 'Email verification failed.');
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
      } catch (err: any) {
        console.error('Verify email error:', err);
        setError('Network error. Please check your connection and try again.');
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Email Verification</h1>

          {isVerifying && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Verifying your email...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p className={styles.errorTitle}>Verification Failed</p>
              <p className={styles.errorText}>{error}</p>
              <Link to="/login" className={styles.button}>
                Return to login
              </Link>
            </div>
          )}

          {success && (
            <div className={styles.success}>
              <p className={styles.successTitle}>Email Verified!</p>
              <p className={styles.successText}>
                Your email has been successfully verified. You will be redirected to the login page in a moment.
              </p>
              <Link to="/login" className={styles.button}>
                Go to login now
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VerifyEmailPage;



