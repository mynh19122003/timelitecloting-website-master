"use client";

import { ErrorPage } from "../../components/ErrorPage";
import { useEffect } from "react";
import logger from "../../utils/logger";

interface Error400PageProps {
  error?: Error | null;
  message?: string;
}

export const Error400Page = ({ error, message }: Error400PageProps = {}) => {
  useEffect(() => {
    logger.warn("400 Bad Request", {
      url: window.location.href,
      error: error?.message || message,
    });
  }, [error, message]);

  return (
    <ErrorPage
      code={400}
      title="Yêu cầu không hợp lệ"
      message={message || "Yêu cầu của bạn không hợp lệ hoặc thiếu thông tin cần thiết."}
      description="Vui lòng kiểm tra lại thông tin bạn đã nhập và thử lại."
      showHomeButton={true}
      showReloadButton={true}
    />
  );
};

export default Error400Page;

