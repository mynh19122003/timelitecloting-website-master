import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import Topbar from '../components/TopBar/Topbar'
import styles from './DashboardLayout.module.css'

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`app-shell ${styles.shell} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className={styles.main}>
        <Topbar />
        <div className={styles.scrollArea} data-scroll-area>
          <div className="content-area">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
