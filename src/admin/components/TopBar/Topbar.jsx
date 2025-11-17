import React, { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { FiSearch, FiBell, FiMessageSquare, FiChevronDown, FiLogOut, FiX } from "react-icons/fi"
import styles from "./Topbar.module.css"
import { useAuth } from "../../context/AuthContext"
import productsService from "../../services/productsService"
import ordersService from "../../services/ordersService"
import customersService from "../../services/customersService"

const Topbar = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activePanel, setActivePanel] = useState(null)
  const topbarRef = useRef(null)
  const searchRef = useRef(null)
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState({
    orders: [],
    customers: [],
    products: []
  })
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

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

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowSearchResults(value.trim().length > 0)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchResults({ orders: [], customers: [], products: [] })
    setShowSearchResults(false)
  }

  const handleResultClick = (type, id) => {
    setShowSearchResults(false)
    setSearchTerm("")
    if (type === "order") {
      navigate(`/admin/orders`)
    } else if (type === "customer") {
      navigate(`/admin/customers`)
    } else if (type === "product") {
      navigate(`/admin/products`)
    }
  }

  const totalResults = searchResults.orders.length + searchResults.customers.length + searchResults.products.length

  const togglePanel = (panel) => {
    setActivePanel((prev) => {
      const next = prev === panel ? null : panel
      if (next === "notifications") setHasUnreadNotifications(false)
      if (next === "messages") setHasUnreadMessages(false)
      return next
    })
    setIsMenuOpen(false)
  }

  const performSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setSearchResults({ orders: [], customers: [], products: [] })
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const [ordersData, customersData, productsData] = await Promise.allSettled([
        ordersService.listOrders({ page: 1, limit: 5, order_id: term }),
        customersService.listCustomers({ page: 1, limit: 5, q: term }),
        productsService.listProducts({ page: 1, limit: 5, search: term })
      ])

      setSearchResults({
        orders: ordersData.status === "fulfilled" ? ordersData.value.items : [],
        customers: customersData.status === "fulfilled" ? customersData.value.items : [],
        products: productsData.status === "fulfilled" ? productsData.value.items : []
      })
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults({ orders: [], customers: [], products: [] })
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, performSearch])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!topbarRef.current) return
      if (!topbarRef.current.contains(event.target) && 
          !searchRef.current?.contains(event.target)) {
        setActivePanel(null)
        setIsMenuOpen(false)
        setShowSearchResults(false)
      }
    }

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setActivePanel(null)
        setIsMenuOpen(false)
        setShowSearchResults(false)
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
      <div ref={searchRef} className={styles.searchWrapper}>
        <div className={styles.search}>
          <FiSearch />
          <input
            type="search"
            placeholder="Search orders, customers, products..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.trim() && setShowSearchResults(true)}
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>
        {showSearchResults && (
          <div className={styles.searchResults}>
            {isSearching ? (
              <div className={styles.searchLoading}>Searching...</div>
            ) : totalResults === 0 ? (
              <div className={styles.searchEmpty}>No results found</div>
            ) : (
              <>
                {searchResults.orders.length > 0 && (
                  <div className={styles.searchSection}>
                    <div className={styles.searchSectionHeader}>Orders</div>
                    <ul className={styles.searchList}>
                      {searchResults.orders.map((order) => (
                        <li
                          key={order.id}
                          className={styles.searchItem}
                          onClick={() => handleResultClick("order", order.id)}
                        >
                          <div>
                            <strong>#{order.order_id || order.id}</strong>
                            <p>{order.customer_name} • {order.status}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResults.customers.length > 0 && (
                  <div className={styles.searchSection}>
                    <div className={styles.searchSectionHeader}>Customers</div>
                    <ul className={styles.searchList}>
                      {searchResults.customers.map((customer) => (
                        <li
                          key={customer.id}
                          className={styles.searchItem}
                          onClick={() => handleResultClick("customer", customer.id)}
                        >
                          <div>
                            <strong>{customer.firstName} {customer.lastName}</strong>
                            <p>{customer.email}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResults.products.length > 0 && (
                  <div className={styles.searchSection}>
                    <div className={styles.searchSectionHeader}>Products</div>
                    <ul className={styles.searchList}>
                      {searchResults.products.map((product) => (
                        <li
                          key={product.id}
                          className={styles.searchItem}
                          onClick={() => handleResultClick("product", product.id)}
                        >
                          <div>
                            <strong>{product.name}</strong>
                            <p>{product.sku} • {product.pricing.listPrice}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
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