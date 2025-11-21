    "use client";

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useI18n } from "../../context/I18nContext";
import styles from "./LoginPage.module.css";

type FormState = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormState, string>> & {
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        if (!prev[key]) {
          return prev;
        }
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (errors.form) {
      setErrors((prev) => {
        if (!prev.form) {
          return prev;
        }
        const next = { ...prev };
        delete next.form;
        return next;
      });
    }
    // Clear API error when user types
    if (error) {
      clearError();
    }
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.email.trim()) {
      nextErrors.email = t("auth.login.email.required");
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = t("auth.login.email.invalid");
    }
    if (!form.password) {
      nextErrors.password = t("auth.login.password.required");
    } else if (form.password.length < 8) {
      nextErrors.password = t("auth.login.password.min");
    }
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isLoading) {
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await login(form.email.trim(), form.password);
      // Login successful, show toast and navigate to profile
      showToast(t("auth.login.success"), "success");
      navigate("/profile", { replace: true });
    } catch (error) {
      // Error is handled by AuthContext and displayed via error state
      console.error('Login failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.root}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.heading}>{t("auth.login.title")}</h1>
        <p className={styles.subheading}>{t("auth.login.subtitle")}</p>

        {(errors.form || error) && (
          <div className={styles.formError}>
            {errors.form || error}
          </div>
        )}

        <label className={styles.field}>
          <span>{t("auth.login.email.label")}</span>
          <input
            type="email"
            placeholder={t("auth.login.email.placeholder")}
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className={errors.email ? styles.inputError : undefined}
          />
          {errors.email && <p className={styles.errorText}>{errors.email}</p>}
        </label>

        <label className={styles.field}>
          <span>{t("auth.login.password.label")}</span>
          <input
            type="password"
            placeholder={t("auth.login.password.placeholder")}
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            className={errors.password ? styles.inputError : undefined}
          />
          {errors.password && (
            <p className={styles.errorText}>{errors.password}</p>
          )}
        </label>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.loginButton}
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) ? t("auth.login.button.loading") : t("auth.login.button")}
          </button>
          <Link to="/forgot-password" className={styles.forgotLink}>
            {t("auth.login.forgot")}
          </Link>
        </div>

        <p className={styles.footerText}>
          {t("auth.login.footer")}
          <Link to="/register" className={styles.link}>
            {t("auth.login.create.account")}
          </Link>
        </p>
      </form>
    </section>
  );
};

export default LoginPage;
