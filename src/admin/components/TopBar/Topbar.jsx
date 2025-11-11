import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiSearch, FiBell, FiMessageSquare, FiChevronDown, FiLogOut } from "react-icons/fi"
import styles from "./Topbar.module.css"
import { useAuth } from "../../context/AuthContext"

const Topbar = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const topbarRef = useRef(null)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true)

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev)
  const handleSignOut = () => {
    signOut()
    setIsMenuOpen(false)
    setActivePanel(null)
    navigate("/admin/login", { replace: true })
  }

  const handleSettings = () => {
    setIsMenuOpen(false)
    setActivePanel(null)
    navigate("settings")
  }

  const togglePanel = (panel) => {
    setActivePanel((prev) => {
      const next = prev === panel ? null : panel
      if (next === "notifications") setHasUnreadNotifications(false)
      if (next === "messages") setHasUnreadMessages(false)
      return next
    })
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!topbarRef.current) return
      if (!topbarRef.current.contains(event.target)) {
        setActivePanel(null)
        setIsMenuOpen(false)
      }
    }

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setActivePanel(null)
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

  const userName = user?.name || "Randhir Kumar"
  const userRole = user?.role || "Store Manager"
  const initials = userName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const notifications = [
    { id: "notif-1", title: "New order received", meta: "#FC-1045 - 2m ago", tone: "Success" },
    { id: "notif-2", title: "Payment pending approval", meta: "Invoice #INV-8831 - 14m ago", tone: "Warning" },
    { id: "notif-3", title: "Inventory running low", meta: "SKU-1523 - 1h ago", tone: "Danger" }
  ]

  const inboxMessages = [
    { id: "msg-1", sender: "Aaron Howard", preview: "Can we expedite shipping on the latest order?", time: "5m ago" },
    { id: "msg-2", sender: "Maria Carter", preview: "Shared the draft for our upcoming campaign.", time: "22m ago" },
    { id: "msg-3", sender: "Support Bot", preview: "Weekly analytics report is ready to review.", time: "1h ago" }
  ]

  return (
    <header ref={topbarRef} className={styles.topbar}>
      <div className={styles.search}>
        <FiSearch />
        <input type="search" placeholder="Search orders, customers, products..." />
      </div>

      <div className={styles.right}>
        <div className={styles.iconCluster}>
          <div className={styles.iconWrapper}>
            <button
              type="button"
              className={`${styles.iconBtn} ${activePanel === "notifications" ? styles.iconActive : ""}`}
              aria-label="Notifications"
              aria-expanded={activePanel === "notifications"}
              aria-haspopup="true"
              onClick={() => togglePanel("notifications")}
            >
              <FiBell />
              {hasUnreadNotifications && <span className={styles.dot} />}
            </button>
            {activePanel === "notifications" && (
              <div className={`${styles.panel} ${styles.notifications} ${styles.panelActive}`} role="dialog" aria-label="Notifications">
                <header className={styles.panelHeader}>
                  <strong>Notifications</strong>
                  <span>Last updates</span>
                </header>
                <ul className={styles.panelList}>
                  {notifications.map((item) => (
                    <li key={item.id} className={`${styles.panelItem} ${styles[`tone${item.tone}`]}`}>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.meta}</p>
                      </div>
                      <button
                        type="button"
                        className={styles.quickAction}
                        onClick={() => {
                          setHasUnreadNotifications(false)
                          setActivePanel(null)
                        }}
                      >
                        View
                      </button>
                    </li>
                  ))}
                </ul>
                <footer className={styles.panelFooter}>
                  <button
                    type="button"
                    onClick={() => {
                      setHasUnreadNotifications(false)
                      setActivePanel(null)
                    }}
                  >
                    Mark all as read
                  </button>
                </footer>
              </div>
            )}
          </div>
          <div className={styles.iconWrapper}>
            <button
              type="button"
              className={`${styles.iconBtn} ${activePanel === "messages" ? styles.iconActive : ""}`}
              aria-label="Messages"
              aria-expanded={activePanel === "messages"}
              aria-haspopup="true"
              onClick={() => togglePanel("messages")}
            >
              <FiMessageSquare />
              {hasUnreadMessages && <span className={styles.dot} />}
            </button>
            {activePanel === "messages" && (
              <div className={`${styles.panel} ${styles.messages} ${styles.panelActive}`} role="dialog" aria-label="Inbox messages">
                <header className={styles.panelHeader}>
                  <strong>Inbox</strong>
                  <span>Recent conversations</span>
                </header>
                <ul className={styles.panelList}>
                  {inboxMessages.map((message) => (
                    <li key={message.id} className={styles.messageItem}>
                      <div className={styles.messageMeta}>
                        <strong>{message.sender}</strong>
                        <span>{message.time}</span>
                      </div>
                      <p>{message.preview}</p>
                    </li>
                  ))}
                </ul>
                <footer className={styles.panelFooter}>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePanel(null)
                      navigate("inbox")
                    }}
                  >
                    Open inbox
                  </button>
                </footer>
              </div>
            )}
          </div>
        </div>
        <div className={styles.profileWrapper}>
          <button type="button" className={styles.profile} onClick={handleToggleMenu} aria-expanded={isMenuOpen}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.profileMeta}>
              <span className={styles.name}>{userName}</span>
              <span className={styles.role}>{userRole}</span>
            </div>
            <FiChevronDown className={`${styles.chevron} ${isMenuOpen ? styles.chevronOpen : ""}`} />
          </button>

          {isMenuOpen && (
            <div className={`${styles.dropdown} ${styles.dropdownActive}`} role="menu">
              <div className={styles.dropdownHeader}>
                <div className={styles.avatar}>{initials}</div>
                <div>
                  <strong>{userName}</strong>
                  <span>{user?.email || "store@fastcart.com"}</span>
                </div>
              </div>
              <button type="button" className={styles.dropdownItem} role="menuitem" onClick={handleSettings}>
                Account settings
              </button>
              <button type="button" className={`${styles.dropdownItem} ${styles.signOut}`} role="menuitem" onClick={handleSignOut}>
                <FiLogOut />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Topbar