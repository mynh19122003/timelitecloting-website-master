import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import styles from "./ForgotPasswordPage.module.css";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        setIsSubmitting(false);
        return;
      }

      // Call API to request password reset
      const response = await fetch('http://localhost:3001/api/node/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send reset link. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success
      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Reset your password</h1>
          <p className={styles.description}>
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success ? (
            <div className={styles.success}>
              <p className={styles.successTitle}>Check your email</p>
              <p className={styles.successText}>
                We've sent password reset instructions to <strong>{email || 'your email'}</strong>.
                Check the console logs for the reset token (since email service is not yet configured).
              </p>
              <Link to="/login" className={styles.button}>
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label className={styles.label}>
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isSubmitting}
                    className={styles.input}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.button}
              >
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>

              <p className={styles.footer}>
                Remember your password?{' '}
                <Link to="/login" className={styles.link}>
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswordPage;



