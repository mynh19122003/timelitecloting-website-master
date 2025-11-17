"use client";

import { ErrorPage } from "../../components/ErrorPage";
import { useEffect } from "react";
import logger from "../../utils/logger";

export const NotFoundPage = () => {
  useEffect(() => {
    logger.warn("404 Not Found", {
      url: window.location.href,
    });
  }, []);

  return (
    <ErrorPage
      code={404}
      title="Trang không tồn tại"
      message="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển."
      description="Có thể URL đã thay đổi hoặc trang đã bị xóa."
      showHomeButton={true}
      showReloadButton={false}
    />
  );
};

export default NotFoundPage;

