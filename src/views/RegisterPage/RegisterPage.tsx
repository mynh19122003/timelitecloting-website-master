"use client";

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import styles from "./RegisterPage.module.css";

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState, string>> & {
  form?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    if (!form.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Please enter your email.";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Email format looks invalid.";
    }
    if (!form.password) {
      nextErrors.password = "Please add a password.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
      await register(form.email.trim(), form.password, form.name.trim());
      // Registration successful, show toast and navigate to profile
      showToast("Registration successful! Welcome to Timelite Couture.", "success");
      navigate("/profile", { replace: true });
    } catch (error) {
      // Error is handled by AuthContext and displayed via error state
      console.error('Registration failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.root}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.heading}>Create an account</h1>
        <p className={styles.subheading}>Enter your details below</p>

        {(errors.form || error) && (
          <div className={styles.formError}>
            {errors.form || error}
          </div>
        )}

        <label className={styles.field}>
          <span>Name</span>
          <input
            type="text"
            placeholder="Linh Tran"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            className={errors.name ? styles.inputError : undefined}
          />
          {errors.name && <p className={styles.errorText}>{errors.name}</p>}
        </label>

        <label className={styles.field}>
          <span>Email</span>
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

        <label className={styles.field}>
          <span>Confirm password</span>
          <input
            type="password"
            placeholder="********"
            value={form.confirmPassword}
            onChange={(event) =>
              handleChange("confirmPassword", event.target.value)
            }
            className={errors.confirmPassword ? styles.inputError : undefined}
          />
          {errors.confirmPassword && (
            <p className={styles.errorText}>{errors.confirmPassword}</p>
          )}
        </label>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={isSubmitting || isLoading}
        >
          {(isSubmitting || isLoading) ? "Creating..." : "Create Account"}
        </button>

        <p className={styles.footerText}>
          Already have account?{" "}
          <Link to="/login" className={styles.link}>
            Log in
          </Link>
        </p>
      </form>
    </section>
  );
};

export default RegisterPage;
