import styles from "./TimeliteLogo.module.css";

export const TimeliteLogo = ({ className }: { className?: string }) => {
  return (
    <div className={`${styles.logoContainer} ${className || ""}`}>
      <img
        src="/images/banner2.png"
        alt="TimEliteClothing Logo"
        className={styles.logoImage}
      />
    </div>
  );
};

