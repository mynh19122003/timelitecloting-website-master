"use client";

import { ErrorPage } from "../../components/ErrorPage";
import { useEffect } from "react";
import logger from "../../utils/logger";

interface Error403PageProps {
  error?: Error | null;
}

export const Error403Page = ({ error }: Error403PageProps = {}) => {
  useEffect(() => {
    logger.warn("403 Forbidden", {
      url: window.location.href,
      error: error?.message,
    });
  }, [error]);

  return (
    <ErrorPage
      code={403}
      title="Không có quyền"
      message="Bạn không có quyền truy cập trang này."
      description="Liên hệ quản trị viên nếu bạn nghĩ đây là lỗi."
      showHomeButton={true}
      showReloadButton={false}
    />
  );
};

export default Error403Page;

