"use client";

import { ErrorPage } from "../../components/ErrorPage";
import { useEffect } from "react";
import logger from "../../utils/logger";

interface Error503PageProps {
  error?: Error | null;
}

export const Error503Page = ({ error }: Error503PageProps = {}) => {
  useEffect(() => {
    logger.error("503 Service Unavailable", error || new Error("Service Unavailable"), {
      url: window.location.href,
    });
  }, [error]);

  return (
    <ErrorPage
      code={503}
      title="Dịch vụ không khả dụng"
      message="Dịch vụ hiện đang bảo trì hoặc tạm thời không khả dụng."
      description="Vui lòng thử lại sau vài phút."
      showHomeButton={true}
      showReloadButton={true}
    />
  );
};

export default Error503Page;

