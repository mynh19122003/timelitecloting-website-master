"use client";

import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
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
      nextErrors.email = "Please enter your email or phone number.";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Email format looks invalid.";
    }
    if (!form.password) {
      nextErrors.password = "Please add your password.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
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
      showToast("Login successful! Welcome back.", "success");
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
        <h1 className={styles.heading}>Log in to Exclusive</h1>
        <p className={styles.subheading}>Enter your details below</p>

        {(errors.form || error) && (
          <div className={styles.formError}>
            {errors.form || error}
          </div>
        )}

        <label className={styles.field}>
          <span>Email or Phone Number</span>
          <input
            type="email"
            placeholder="your-email@example.com"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className={errors.email ? styles.inputError : undefined}
          />
          {errors.email && <p className={styles.errorText}>{errors.email}</p>}
        </label>

        <label className={styles.field}>
          <span>Password</span>
          <input
            type="password"
            placeholder="********"
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
            {(isSubmitting || isLoading) ? "Signing in..." : "Log In"}
          </button>
          <Link to="/forgot-password" className={styles.forgotLink}>
            Forget Password?
          </Link>
        </div>

        <p className={styles.footerText}>
          New to Timelite?{" "}
          <Link to="/register" className={styles.link}>
            Create an account
          </Link>
        </p>
      </form>
    </section>
  );
};

export default LoginPage;
