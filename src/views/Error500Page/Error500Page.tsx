"use client";

import { ErrorPage } from "../../components/ErrorPage";
import { useEffect } from "react";
import logger from "../../utils/logger";

interface Error500PageProps {
  error?: Error | null;
  errorInfo?: unknown;
}

export const Error500Page = ({ error, errorInfo }: Error500PageProps = {}) => {
  useEffect(() => {
    if (error) {
      logger.logComponentError("Error500Page", error, errorInfo);
    } else {
      logger.error("500 Error", new Error("Internal Server Error"), {
        url: window.location.href,
      });
    }
  }, [error, errorInfo]);

  return (
    <ErrorPage
      code={500}
      title="Lỗi máy chủ"
      message="Đã xảy ra lỗi không mong muốn trên máy chủ."
      description="Chúng tôi đang khắc phục sự cố. Vui lòng thử lại sau."
      showHomeButton={true}
      showReloadButton={true}
      showDetails={process.env.NODE_ENV === "development"}
      errorDetails={{ error, errorInfo }}
    />
  );
};

export default Error500Page;

