import { useState, FormEvent, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./ResetPasswordPage.module.css";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }

      // Validate password length
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsSubmitting(false);
        return;
      }

      // Call API to reset password
      const response = await fetch('http://localhost:3001/api/node/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Success
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Create new password</h1>
          <p className={styles.description}>
            Enter your new password below. Make sure it's at least 6 characters long.
          </p>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {success ? (
            <div className={styles.success}>
              <p className={styles.successTitle}>Password reset successful!</p>
              <p className={styles.successText}>
                Your password has been changed. You will be redirected to the login page in a moment.
              </p>
              <Link to="/login" className={styles.button}>
                Go to login now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label className={styles.label}>
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    disabled={isSubmitting || !token}
                    className={styles.input}
                  />
                </label>
              </div>

              <div>
                <label className={styles.label}>
                  Confirm password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    disabled={isSubmitting || !token}
                    className={styles.input}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !token}
                className={styles.button}
              >
                {isSubmitting ? 'Resetting...' : 'Reset password'}
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

export default ResetPasswordPage;



