import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from '../../styles/AddPage.module.css'
import Button from '../../components/Button/Button'
import { usStates } from './customerData'
import { getCustomer, updateCustomer } from '../../services/customersService'

const requiredFields = ['firstName', 'lastName', 'email']

const toCommaSeparated = (values) => {
  if (!values) return ''
  if (Array.isArray(values)) return values.join(', ')
  return values
}

const EditCustomer = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [formData, setFormData] = useState(() => ({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'CA',
    postalCode: '',
    segment: 'New',
    status: 'Active',
    tags: '',
    notes: ''
  }))

  const [errors, setErrors] = useState([])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const data = await getCustomer(id)
        if (!cancelled) {
          setCustomer(data)
          setFormData({
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            address: data.address ?? '',
            city: data.city ?? '',
            state: data.state ?? 'CA',
            postalCode: data.postalCode ?? '',
            segment: data.segment ?? 'New',
            status: data.status ?? 'Active',
            tags: toCommaSeparated(data.tags),
            notes: data.notes ?? ''
          })
        }
      } catch (err) {
        if (!cancelled) setLoadError(err?.message || 'Không thể tải khách hàng')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.body}>
          <section className={styles.section}>
            <h1>Loading...</h1>
          </section>
        </main>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className={styles.page}>
        <main className={styles.body}>
          <section className={styles.section}>
            <h1>Customer not found</h1>
            <p>{loadError || 'The customer you are trying to edit could not be located.'}</p>
            <Button type="button" variant="primary" onClick={() => navigate('/admin/customers')}>
              Back to customers
            </Button>
          </section>
        </main>
      </div>
    )
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors.length) {
      setErrors((prev) => prev.filter((field) => field !== name))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const missing = requiredFields.filter((field) => !formData[field]?.trim())
    if (missing.length) {
      setErrors(missing)
      return
    }
    try {
      await updateCustomer(id, {
        ...formData,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      })
      navigate('/admin/customers')
    } catch (err) {
      window.alert(err?.message || 'Không thể lưu thay đổi')
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          &larr; Back
        </button>
        <div className={styles.headerActions}>
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/customers')}>
            Cancel
          </Button>
          <Button type="submit" form="edit-customer-form" variant="primary">
            Save changes
          </Button>
        </div>
      </header>

      <main className={styles.body}>
        <form id="edit-customer-form" className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h1>Edit customer</h1>
            <p>Update customer details before syncing with your CRM.</p>
            {errors.length > 0 && (
              <div className={styles.formError} role="alert">
                Please fill in the required fields.
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3>Identity</h3>
            <div className={styles.fieldRow}>
              <label className={`${styles.field} ${errors.includes('firstName') ? styles.fieldError : ''}`}>
                First name *
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  aria-invalid={errors.includes('firstName')}
                />
              </label>
              <label className={`${styles.field} ${errors.includes('lastName') ? styles.fieldError : ''}`}>
                Last name *
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  aria-invalid={errors.includes('lastName')}
                />
              </label>
            </div>
            <div className={styles.fieldRow}>
              <label className={`${styles.field} ${errors.includes('email') ? styles.fieldError : ''}`}>
                Email *
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@domain.com"
                  aria-invalid={errors.includes('email')}
                />
              </label>
              <label className={styles.field}>
                Phone
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(000) 000-0000"
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Address</h3>
            <label className={styles.field}>
              Street address
              <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Street address" />
            </label>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                City
                <input name="city" value={formData.city} onChange={handleInputChange} placeholder="City" />
              </label>
              <label className={styles.field}>
                State
                <select name="state" value={formData.state} onChange={handleInputChange}>
                  {usStates.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                Postal code
                <input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="ZIP / Postal code"
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Segmentation</h3>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                Segment
                <select name="segment" value={formData.segment} onChange={handleInputChange}>
                  <option value="New">New</option>
                  <option value="Returning">Returning</option>
                  <option value="VIP">VIP</option>
                  <option value="Dormant">Dormant</option>
                </select>
              </label>
              <label className={styles.field}>
                Status
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Churn Risk">Churn Risk</option>
                </select>
              </label>
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                Tags
                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Separate tags with commas"
                />
              </label>
              <label className={styles.field}>
                Notes
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add notes about customer preferences or history"
                />
              </label>
            </div>
          </section>
        </form>
      </main>
    </div>
  )
}

export default EditCustomer
