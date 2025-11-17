"use client";

import { ErrorPage } from "../../components/ErrorPage";
import { useEffect } from "react";
import logger from "../../utils/logger";

interface Error401PageProps {
  error?: Error | null;
}

export const Error401Page = ({ error }: Error401PageProps = {}) => {
  useEffect(() => {
    logger.warn("401 Unauthorized", {
      url: window.location.href,
      error: error?.message,
    });
  }, [error]);

  return (
    <ErrorPage
      code={401}
      title="Không có quyền truy cập"
      message="Bạn cần đăng nhập để truy cập trang này."
      description="Vui lòng đăng nhập để tiếp tục."
      showHomeButton={true}
      showReloadButton={false}
    />
  );
};

export default Error401Page;

