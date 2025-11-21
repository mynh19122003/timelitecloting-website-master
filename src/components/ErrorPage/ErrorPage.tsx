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
    title: "Yêu cầu không hợp lệ",
    message: "Yêu cầu của bạn không hợp lệ hoặc thiếu thông tin cần thiết.",
    description: "Vui lòng kiểm tra lại thông tin bạn đã nhập và thử lại.",
  },
  401: {
    title: "Không có quyền truy cập",
    message: "Bạn cần đăng nhập để truy cập trang này.",
    description: "Vui lòng đăng nhập để tiếp tục.",
  },
  403: {
    title: "Không có quyền",
    message: "Bạn không có quyền truy cập trang này.",
    description: "Liên hệ quản trị viên nếu bạn nghĩ đây là lỗi.",
  },
  404: {
    title: "Trang không tồn tại",
    message: "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.",
    description: "Có thể URL đã thay đổi hoặc trang đã bị xóa.",
  },
  500: {
    title: "Lỗi máy chủ",
    message: "Đã xảy ra lỗi không mong muốn trên máy chủ.",
    description: "Chúng tôi đang khắc phục sự cố. Vui lòng thử lại sau.",
  },
  503: {
    title: "Dịch vụ không khả dụng",
    message: "Dịch vụ hiện đang bảo trì hoặc tạm thời không khả dụng.",
    description: "Vui lòng thử lại sau vài phút.",
  },
};

// Static translations (ErrorPage may be rendered outside Router/I18n context)
const translations = {
  "error.go.home": "Về trang chủ",
  "error.reload.page": "Tải lại trang",
  "error.login": "Đăng nhập",
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
                Chi tiết lỗi (Development)
              </summary>
              <div className={styles.errorContent}>
                {errorDetails.error && (
                  <div className={styles.errorSection}>
                    <h3>Lỗi:</h3>
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
                    <h3>Thông tin lỗi:</h3>
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

