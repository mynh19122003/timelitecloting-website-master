"use client";

import type { ErrorInfo } from "react";
import styles from "./ErrorPage.module.css";

interface ErrorPageProps {
  code: number;
  title: string;
  message: string;
  description?: string;
  showHomeButton?: boolean;
  showReloadButton?: boolean;
  showDetails?: boolean;
  errorDetails?: {
    error?: Error | null;
    errorInfo?: ErrorInfo;
  };
}

const errorMessages: Record<number, { title: string; message: string; description?: string }> = {
  400: {
    title: "Invalid request",
    message: "Your request is missing required information.",
    description: "Double-check the details you entered and try again.",
  },
  401: {
    title: "Unauthorized",
    message: "You need to sign in to access this page.",
    description: "Please sign in to continue.",
  },
  403: {
    title: "Forbidden",
    message: "You do not have permission to view this page.",
    description: "Contact the administrator if you believe this is a mistake.",
  },
  404: {
    title: "Page not found",
    message: "The page you're looking for does not exist or has moved.",
    description: "The URL may have changed or the page was removed.",
  },
  500: {
    title: "Server error",
    message: "An unexpected error occurred on the server.",
    description: "We're working to resolve it. Please try again later.",
  },
  503: {
    title: "Service unavailable",
    message: "The service is down for maintenance or temporarily unavailable.",
    description: "Please try again in a few minutes.",
  },
};

// Static translations (ErrorPage may be rendered outside Router/I18n context)
const translations = {
  "error.go.home": "Back to home",
  "error.reload.page": "Reload page",
  "error.login": "Sign in",
};

export const ErrorPage = ({
  code,
  title,
  message,
  description,
  showHomeButton = true,
  showReloadButton = true,
  showDetails = process.env.NODE_ENV === "development",
  errorDetails,
}: ErrorPageProps) => {
  const errorInfo = errorMessages[code] || { title, message, description };

  const handleHomeClick = () => {
    window.location.href = "/";
  };

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorCode}>{code}</div>
          <h1 className={styles.title}>{errorInfo.title || title}</h1>
          <h2 className={styles.heading}>{errorInfo.message || message}</h2>
          {(errorInfo.description || description) && (
            <p className={styles.description}>
              {errorInfo.description || description}
            </p>
          )}
          <div className={styles.actions}>
            {showHomeButton && (
              <button
                onClick={handleHomeClick}
                className={styles.primaryButton}
              >
                {translations["error.go.home"]}
              </button>
            )}
            {showReloadButton && (
              <button
                onClick={() => window.location.reload()}
                className={styles.secondaryButton}
              >
                {translations["error.reload.page"]}
              </button>
            )}
            {code === 401 && (
              <button
                onClick={handleLoginClick}
                className={styles.primaryButton}
              >
                {translations["error.login"]}
              </button>
            )}
          </div>
          {showDetails && errorDetails && (
            <details className={styles.errorDetails}>
              <summary className={styles.errorSummary}>
                Error details (Development)
              </summary>
              <div className={styles.errorContent}>
                {errorDetails.error && (
                  <div className={styles.errorSection}>
                    <h3>Error:</h3>
                    <pre>{errorDetails.error.message}</pre>
                    {errorDetails.error.stack && (
                      <pre className={styles.stackTrace}>
                        {errorDetails.error.stack}
                      </pre>
                    )}
                  </div>
                )}
                {errorDetails.errorInfo && (
                  <div className={styles.errorSection}>
                    <h3>Error information:</h3>
                    <pre>{JSON.stringify(errorDetails.errorInfo, null, 2)}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

