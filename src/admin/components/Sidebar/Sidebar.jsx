import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiBox,
  FiUsers,
  FiBarChart2,
  FiTag,
  FiInbox,
  FiSettings,
  FiChevronsDown,
  FiChevronRight,
  FiSearch
} from 'react-icons/fi';
import styles from './Sidebar.module.css';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const links = [
    { to: '/admin', label: 'Dashboard', icon: FiHome },
    { to: '/admin/orders', label: 'Orders', icon: FiPackage },
    { to: '/admin/products', label: 'Products', icon: FiBox },
    { to: '/admin/customers', label: 'Customers', icon: FiUsers },
    // { to: '/admin/reports', label: 'Reports', icon: FiBarChart2 },
    // { to: '/admin/coupons', label: 'Coupons', icon: FiTag },
    // { to: '/admin/inbox', label: 'Inbox', icon: FiInbox }, // temporarily disabled
    { to: '/admin/settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.brandRow}>
        <div className={styles.brandMark}>TimElite</div>
        <button
          className={styles.collapseBtn}
          type="button"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          {isCollapsed ? <FiChevronsDown /> : <FiChevronRight />}
        </button>
      </div>

      <div className={styles.searchBox}>
        <FiSearch />
        <input placeholder="Quick search" />
      </div>

      <nav className={styles.menu}>
        <div className={styles.section}>
          <ul className={styles.list}>
            {links.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ''} ${
                      isCollapsed ? styles.justIcon : ''
                    }`
                  }
                  end={to === '/admin'}
                >
                  <Icon className={styles.icon} />
                  {!isCollapsed && <span className={styles.label}>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
