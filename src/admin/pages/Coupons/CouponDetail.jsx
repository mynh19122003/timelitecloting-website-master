import React, { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiRepeat, FiTag } from 'react-icons/fi'
import AdminPage from '../../components/AdminPage/AdminPage'
import styles from './Coupons.module.css'
import { ensureTypeLabel, statusTone, normalizeCoupon } from './utils'

const toneClass = (tone) => {
  if (!tone) return ''
  const key = `tone${tone.charAt(0).toUpperCase()}${tone.slice(1)}`
  return styles[key] || ''
}

const DetailField = ({ label, value }) => (
  <div className={styles.detailField}>
    <span className={styles.detailLabel}>{label}</span>
    <strong className={styles.detailValue}>{value}</strong>
  </div>
)

const CouponDetail = () => {
  const { couponId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [coupon, setCoupon] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        setLoading(true)
        // Check if coupon is passed via location state
        const incoming = location.state?.coupon
        if (incoming) {
          setCoupon(normalizeCoupon(incoming))
          setLoading(false)
          return
        }
        
        // Otherwise, load from API when available
        // For now, coupon will be null if not in state
        // TODO: Implement API call to load coupon by ID
        setCoupon(null)
      } catch (error) {
        console.error('Failed to load coupon:', error)
        setCoupon(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadCoupon()
  }, [couponId, location.state])

  const normalizedCoupon = useMemo(() => {
    if (coupon) return normalizeCoupon(coupon)
    return null
  }, [coupon])

  const handleBack = () => {
    navigate('/coupons')
  }

  const handleDuplicate = () => {
    if (!normalizedCoupon) return
    const clone = normalizeCoupon({
      ...normalizedCoupon,
      id: undefined,
      name: `${normalizedCoupon.name} copy`,
      code: `${normalizedCoupon.code}-COPY`,
      usage: 0,
      status: 'Scheduled'
    })
    navigate('/coupons', { replace: true, state: { newCoupon: clone } })
  }

  if (loading) {
    return <AdminPage title="Coupon detail" subtitle="Loading..."><div>Loading...</div></AdminPage>
  }

  if (!normalizedCoupon) {
    return (
      <AdminPage title="Coupon detail" subtitle="The requested coupon could not be found.">
        <div className={styles.detailView}>
          <div className={styles.sheetForm}>
            <header className={styles.sheetHeader}>
              <button type="button" className={styles.backButton} onClick={handleBack}>
                <FiArrowLeft /> Back to coupons
              </button>
            </header>
            <div className={styles.sheetBody}>
              <p>It looks like this coupon is no longer available.</p>
            </div>
          </div>
        </div>
      </AdminPage>
    )
  }

  const summary = [
    { label: 'Status', value: normalizedCoupon.status, tone: toneClass(statusTone(normalizedCoupon.status)) },
    { label: 'Starts', value: normalizedCoupon.startDate },
    { label: 'Ends', value: normalizedCoupon.endDate },
    { label: 'Usage limit', value: normalizedCoupon.usageLimit }
  ];

  return (
    <AdminPage title="Coupon detail" subtitle={`Review settings for ${normalizedCoupon.name}.`}>
      <div className={styles.detailLayout}>
        <div className={styles.detailBack}>
          <button type="button" className={styles.backLink} onClick={handleBack}>
            <FiArrowLeft /> Back to coupons
          </button>
        </div>

        <div className={styles.detailContent}>
          <div className={styles.detailHero}>
            <div className={styles.heroPrimary}>
              <h2>{normalizedCoupon.name}</h2>
              <p>
                Coupon code {normalizedCoupon.code}. Currently {normalizedCoupon.status.toLowerCase()}.
              </p>
              <div className={styles.badgeGroup}>
                <span className={`${styles.badge} ${toneClass(statusTone(normalizedCoupon.status))}`}>
                  <span className={styles.badgeDot} />
                  {normalizedCoupon.status}
                </span>
                <span className={`${styles.badge} ${styles.tonePrimary}`}>
                  <FiTag /> {ensureTypeLabel(normalizedCoupon.type)}
                </span>
              </div>
            </div>

            <div className={styles.heroStats}>
              {summary.map((item) => (
                <div key={item.label} className={styles.heroStat}>
                  <span className={styles.detailLabel}>{item.label}</span>
                  {item.tone ? (
                    <span className={`${styles.badge} ${item.tone}`}>
                      <span className={styles.badgeDot} />
                      {item.value}
                    </span>
                  ) : (
                    <strong className={styles.detailValue}>{item.value}</strong>
                  )}
                </div>
              ))}
            </div>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Schedule</h3>
              <p>Track when the promotion becomes available and when it expires.</p>
            </div>
            <div className={styles.fieldGrid}>
              <DetailField label="Starts" value={normalizedCoupon.startDate} />
              <DetailField label="Ends" value={normalizedCoupon.endDate} />
              <DetailField label="Usage limit" value={normalizedCoupon.usageLimit} />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Usage & eligibility</h3>
              <p>Understand who can apply this coupon and how frequently.</p>
            </div>
            <div className={styles.fieldGrid}>
              <DetailField label="Total uses" value={normalizedCoupon.usage} />
              <DetailField label="Discount value" value={normalizedCoupon.discountValue} />
              <DetailField label="Applies to" value={normalizedCoupon.appliesTo} />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Notes</h3>
              <p>Reference notes to share context with your team.</p>
            </div>
            <DetailField
              label="Internal description"
              value={normalizedCoupon.description || 'No additional notes provided.'}
            />
          </section>
        </div>

        <aside className={styles.detailSidebar}>
          <div className={styles.sidebarCard}>
            <h4>Actions</h4>
            <button type="button" className={styles.sidebarButton} onClick={handleDuplicate}>
              <FiRepeat /> Duplicate coupon
            </button>
          </div>

          <div className={styles.sidebarCard}>
            <h4>Quick summary</h4>
            <ul className={styles.sidebarList}>
              <li>
                <span>Coupon code</span>
                <strong>{normalizedCoupon.code}</strong>
              </li>
              <li>
                <span>Applies to</span>
                <strong>{normalizedCoupon.appliesTo}</strong>
              </li>
              <li>
                <span>Total redemptions</span>
                <strong>{normalizedCoupon.usage}</strong>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </AdminPage>
  )
}

export default CouponDetail




