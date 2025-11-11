import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../styles/AddPage.module.css'
import Button from '../../components/Button/Button'
import { usStates } from './customerData'

const emptyForm = {
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
}

const AddCustomer = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [missingFields, setMissingFields] = useState([])

  const handleCancel = () => navigate('/customers')
  const handleBack = () => navigate('/customers')

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formError) setFormError('')
    if (missingFields.length) {
      if (value.trim().length > 0) {
        setMissingFields((prev) => prev.filter((field) => field !== name))
      }
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const requiredFields = ['firstName', 'lastName', 'email']
    const missing = requiredFields.filter((field) => !formData[field] || !formData[field].trim())

    if (missing.length) {
      setMissingFields(missing)
      setFormError('Please complete the required fields before saving.')
      return
    }

    const timestamp = Date.now()
    const customerId = `CUS-${`${timestamp}`.slice(-4)}`
    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const newCustomer = {
      id: customerId,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '-',
      city: formData.city.trim() || '-',
      state: formData.state || 'CA',
      segment: formData.segment || 'New',
      status: formData.status || 'Active',
      orders: 0,
      lifetimeValue: 0,
      lastOrder: '—',
      tags
    }

    navigate('/customers', { replace: true, state: { newCustomer } })
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
          <Button type='submit' form='add-customer-form' variant='primary'>
            Save
          </Button>
        </div>
      </header>

      <main className={styles.body}>
        <form id='add-customer-form' className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h1>Add Customer</h1>
            <p>Create a customer profile, segment them for campaigns, and keep retention notes organised.</p>
            {formError && (
              <div className={styles.formError} role='alert'>
                {formError}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3>Identity</h3>
            <div className={styles.fieldRow}>
              <label className={`${styles.field} ${missingFields.includes('firstName') ? styles.fieldError : ''}`}>
                First name *
                <input
                  name='firstName'
                  placeholder='First name'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  aria-invalid={missingFields.includes('firstName')}
                />
              </label>
              <label className={`${styles.field} ${missingFields.includes('lastName') ? styles.fieldError : ''}`}>
                Last name *
                <input
                  name='lastName'
                  placeholder='Last name'
                  value={formData.lastName}
                  onChange={handleInputChange}
                  aria-invalid={missingFields.includes('lastName')}
                />
              </label>
            </div>
            <div className={styles.fieldRow}>
              <label className={`${styles.field} ${missingFields.includes('email') ? styles.fieldError : ''}`}>
                Email *
                <input
                  type='email'
                  name='email'
                  placeholder='name@domain.com'
                  value={formData.email}
                  onChange={handleInputChange}
                  aria-invalid={missingFields.includes('email')}
                />
              </label>
              <label className={styles.field}>
                Phone
                <input
                  name='phone'
                  placeholder='(000) 000-0000'
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Address</h3>
            <label className={styles.field}>
              Street address
              <input
                name='address'
                placeholder='Street address'
                value={formData.address}
                onChange={handleInputChange}
              />
            </label>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                City
                <input name='city' placeholder='City' value={formData.city} onChange={handleInputChange} />
              </label>
              <label className={styles.field}>
                State
                <select name='state' value={formData.state} onChange={handleInputChange}>
                  {usStates.map((stateOption) => (
                    <option key={stateOption} value={stateOption}>
                      {stateOption}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                Postal code
                <input
                  name='postalCode'
                  placeholder='ZIP / Postal code'
                  value={formData.postalCode}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Segmentation</h3>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                Segment
                <select name='segment' value={formData.segment} onChange={handleInputChange}>
                  <option value='New'>New</option>
                  <option value='Returning'>Returning</option>
                  <option value='VIP'>VIP</option>
                  <option value='Dormant'>Dormant</option>
                </select>
              </label>
              <label className={styles.field}>
                Status
                <select name='status' value={formData.status} onChange={handleInputChange}>
                  <option value='Active'>Active</option>
                  <option value='Inactive'>Inactive</option>
                  <option value='Churn Risk'>Churn Risk</option>
                </select>
              </label>
            </div>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                Tags
                <input
                  name='tags'
                  placeholder='Separate tags with commas'
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </label>
              <label className={styles.field}>
                Notes
                <textarea
                  name='notes'
                  rows={4}
                  placeholder='Add notes about customer preferences or history'
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </section>
        </form>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h4>Segmentation tips</h4>
            <ul className={styles.checkboxList}>
              <li>Add at least one descriptive tag to improve campaign targeting.</li>
              <li>VIP status unlocks loyalty workflows automatically.</li>
              <li>Churn risk customers feed into the retention pipeline.</li>
            </ul>
          </div>
          <div className={styles.card}>
            <h4>Reminder</h4>
            <p>
              Profiles created here sync with Fastcart CRM. Keep naming consistent so automations and reporting stay
              accurate.
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default AddCustomer
