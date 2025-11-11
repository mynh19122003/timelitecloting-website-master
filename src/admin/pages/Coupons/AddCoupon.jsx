import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { couponTypes } from './couponData'
import styles from '../../styles/AddPage.module.css'
import Button from '../../components/Button/Button'

const emptyForm = {
  code: '',
  name: '',
  type: couponTypes[0]?.value || 'fixed',
  value: '',
  appliesTo: '',
  startDate: '',
  endDate: '',
  limit: '',
  noDuration: false,
  noUsageLimit: false,
  description: ''
}

const AddCoupon = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [missingFields, setMissingFields] = useState([])

  const handleBack = () => navigate('/coupons')
  const handleCancel = () => navigate('/coupons')

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: nextValue }))
    if (formError) setFormError('')
    if (missingFields.length && typeof nextValue === 'string' && nextValue.trim().length > 0) {
      setMissingFields((prev) => prev.filter((field) => field !== name))
    }
  }

  const handleTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, type }))
    if (formError) setFormError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const required = ['code', 'name', 'type']
    const missing = required.filter((field) => !`${formData[field] ?? ''}`.trim())
    if (missing.length) {
      setMissingFields(missing)
      setFormError('Please complete the required fields before saving.')
      return
    }

    const timestamp = Date.now()
    const sequence = `${timestamp}`.slice(-4)

    const formatDate = (value) =>
      value
        ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Immediate'

    const status =
      formData.noDuration || !formData.startDate
        ? 'Active'
        : new Date(formData.startDate) > new Date()
          ? 'Scheduled'
          : 'Active'

    const newCoupon = {
      id: `CPN-${sequence}`,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      usage: 0,
      status,
      startDate: formatDate(formData.startDate),
      endDate: formData.noDuration ? 'No end date' : formatDate(formData.endDate),
      type: couponTypes.find((item) => item.value === formData.type)?.label || 'Fixed Discount',
      discountValue: formData.value || '0',
      appliesTo: formData.appliesTo || 'All products',
      usageLimit: formData.noUsageLimit ? 'Unlimited' : formData.limit || '0',
      description: formData.description
    }

    navigate('/coupons', { replace: true, state: { newCoupon } })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type='button' className={styles.backButton} onClick={handleBack}>
          &larr; Back
        </button>
        <div className={styles.headerActions}>
          <Button type='button' variant='ghost' onClick={handleCancel}>
            Cancel
          </Button>
          <Button type='submit' form='add-coupon-form' variant='primary'>
            Save
          </Button>
        </div>
      </header>

      <main className={styles.body}>
        <form id='add-coupon-form' className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h1>Create Coupon</h1>
            <p>Define coupon details, duration, and usage limits for your next promotion.</p>
            {formError && (
              <div className={styles.formError} role='alert'>
                {formError}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3>Coupon information</h3>
            <div className={styles.fieldRow}>
              <label className={`${styles.field} ${missingFields.includes('code') ? styles.fieldError : ''}`}>
                Code *
                <input
                  name='code'
                  placeholder='E.g. SAVE20'
                  value={formData.code}
                  onChange={handleInputChange}
                  aria-invalid={missingFields.includes('code')}
                />
              </label>
              <label className={`${styles.field} ${missingFields.includes('name') ? styles.fieldError : ''}`}>
                Name *
                <input
                  name='name'
                  placeholder='Promotion title'
                  value={formData.name}
                  onChange={handleInputChange}
                  aria-invalid={missingFields.includes('name')}
                />
              </label>
            </div>
            <label className={styles.field}>
              Description
              <textarea
                name='description'
                rows={3}
                placeholder='Internal notes or campaign details'
                value={formData.description}
                onChange={handleInputChange}
              />
            </label>
          </section>

          <section className={styles.section}>
            <h3>Coupon type</h3>
            <div className={styles.fieldRow}>
              {couponTypes.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  type='button'
                  variant={formData.type === value ? 'primary' : 'muted'}
                  className={styles.typeChoice}
                  onClick={() => handleTypeSelect(value)}
                  aria-pressed={formData.type === value}
                >
                  <Icon />
                  {label}
                </Button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3>Value & eligibility</h3>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                Discount value
                <input
                  name='value'
                  placeholder='Amount or %'
                  value={formData.value}
                  onChange={handleInputChange}
                />
              </label>
              <label className={styles.field}>
                Applies to
                <select name='appliesTo' value={formData.appliesTo} onChange={handleInputChange}>
                  <option value=''>Choose...</option>
                  <option value='All products'>All products</option>
                  <option value='Women collection'>Women collection</option>
                  <option value='Men collection'>Men collection</option>
                  <option value='Accessories'>Accessories</option>
                </select>
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Duration & limits</h3>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                Starts
                <input type='date' name='startDate' value={formData.startDate} onChange={handleInputChange} />
              </label>
              <label className={styles.field}>
                Ends
                <input
                  type='date'
                  name='endDate'
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={formData.noDuration}
                />
              </label>
              <label className={styles.field}>
                Usage limit
                <input
                  name='limit'
                  placeholder='Amount of uses'
                  value={formData.limit}
                  onChange={handleInputChange}
                  disabled={formData.noUsageLimit}
                />
              </label>
            </div>
            <div className={styles.checkboxList}>
              <label className={styles.checkbox}>
                <input
                  type='checkbox'
                  name='noDuration'
                  checked={formData.noDuration}
                  onChange={handleInputChange}
                />
                <span>Don&apos;t set an end date</span>
              </label>
              <label className={styles.checkbox}>
                <input
                  type='checkbox'
                  name='noUsageLimit'
                  checked={formData.noUsageLimit}
                  onChange={handleInputChange}
                />
                <span>Unlimited uses</span>
              </label>
            </div>
          </section>
        </form>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h4>Promotion tips</h4>
            <ul className={styles.checkboxList}>
              <li>Pick short, memorable codes customers can recall easily.</li>
              <li>Start and end dates should reflect your marketing calendar.</li>
              <li>Unlimited promotions can impact margins—set limits intentionally.</li>
            </ul>
          </div>
          <div className={styles.card}>
            <h4>Need inspiration?</h4>
            <p>Pair coupons with email or SMS automations so customers know when offers are live.</p>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default AddCoupon
