import { useState } from 'react';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookMessenger, FaComments } from 'react-icons/fa';
import styles from './ChatWidget.module.css';
import { LiveChatModal } from './LiveChatModal';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const openWhatsApp = () => {
    // Replace with your WhatsApp business number
    const phoneNumber = '16692547401'; // Format: country code + number (no spaces, no +)
    const message = encodeURIComponent('Hello! I have a question about Timelite Couture products.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const openMessenger = () => {
    // Replace with your Facebook Page ID or username
    // Example: https://m.me/YourPageUsername
    const pageId = 'timelitecouture'; // Replace with your actual Facebook page username
    window.open(`https://m.me/${pageId}`, '_blank');
  };

  const openLiveChat = () => {
    setShowLiveChat(true);
    setIsOpen(false); // Close the menu when opening live chat
  };

  return (
    <>
      {/* Chat Widget Button */}
      <div className={styles.chatWidget}>
        {/* Options Menu */}
        {isOpen && (
          <div className={styles.chatMenu}>
            <button
              className={`${styles.chatOption} ${styles.whatsapp}`}
              onClick={openWhatsApp}
              aria-label="Chat on WhatsApp"
            >
              <FaWhatsapp className={styles.optionIcon} />
              <span>WhatsApp</span>
            </button>

            <button
              className={`${styles.chatOption} ${styles.messenger}`}
              onClick={openMessenger}
              aria-label="Chat on Messenger"
            >
              <FaFacebookMessenger className={styles.optionIcon} />
              <span>Messenger</span>
            </button>

            <button
              className={`${styles.chatOption} ${styles.liveChat}`}
              onClick={openLiveChat}
              aria-label="Live Chat"
            >
              <FaComments className={styles.optionIcon} />
              <span>Live Chat</span>
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <button
          className={`${styles.mainButton} ${isOpen ? styles.active : ''}`}
          onClick={toggleWidget}
          aria-label={isOpen ? 'Close chat options' : 'Open chat options'}
        >
          {isOpen ? (
            <FiX className={styles.mainIcon} />
          ) : (
            <FiMessageCircle className={styles.mainIcon} />
          )}
        </button>
      </div>

      {/* Live Chat Modal */}
      {showLiveChat && (
        <LiveChatModal onClose={() => setShowLiveChat(false)} />
      )}
    </>
  );
};



