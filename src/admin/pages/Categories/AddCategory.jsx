import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from '../../styles/AddPage.module.css'
import Button from '../../components/Button/Button'
import { collectionGroups, initialCategories } from './categoryData'

const emptyForm = {
  name: '',
  description: '',
  group: collectionGroups[0]?.value || 'all',
  published: true,
  featured: false,
  cover: '',
  tags: '',
  notes: ''
}

const AddCategory = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [missingFields, setMissingFields] = useState([])
  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode) {
      const categoryToEdit = initialCategories.find((c) => c.id === id)
      if (categoryToEdit) {
        setFormData({
          name: categoryToEdit.name,
          description: categoryToEdit.description,
          group: categoryToEdit.group,
          published: categoryToEdit.published,
          featured: categoryToEdit.featured,
          cover: categoryToEdit.cover,
          tags: categoryToEdit.tags.join(', '),
          notes: categoryToEdit.notes || ''
        })
      }
    }
  }, [id, isEditMode])

  const handleBack = () => navigate('/categories')
  const handleCancel = () => navigate('/categories')

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: nextValue }))
    if (formError) setFormError('')
    if (missingFields.length && typeof nextValue === 'string' && nextValue.trim().length > 0) {
      setMissingFields((prev) => prev.filter((field) => field !== name))
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const requiredFields = ['name', 'description']
    const missing = requiredFields.filter((field) => !formData[field].trim())

    if (missing.length) {
      setMissingFields(missing)
      setFormError('Please fill in the required fields before saving.')
      return
    }

    const categoryData = {
      name: formData.name.trim(),
      products: 0,
      published: formData.published,
      featured: formData.featured,
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      description: formData.description.trim() || 'Describe the assortment and merchandising strategy.',
      group: formData.group,
      cover: formData.cover.trim(),
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      notes: formData.notes.trim()
    }

    if (isEditMode) {
      console.log('Updating category:', { ...categoryData, id })
    } else {
      const timestamp = Date.now()
      const newCategory = { ...categoryData, id: `CAT-${`${timestamp}`.slice(-3)}` }
      console.log('Creating new category:', newCategory)
    }

    navigate('/categories', { replace: true, state: { newCategory: { ...categoryData, id: id || `CAT-${Date.now()}`.slice(-3) } } })
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
          <Button type='submit' form='add-category-form' variant='primary'>
            Save
          </Button>
        </div>
      </header>

      <main className={styles.body}>
        <form id='add-category-form' className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h1>{isEditMode ? 'Edit Category' : 'Add Category'}</h1>
            <p>Set merchandising details, launch visibility, and internal notes for this collection.</p>
            {formError && (
              <div className={styles.formError} role='alert'>
                {formError}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3>Information</h3>
            <label className={`${styles.field} ${missingFields.includes('name') ? styles.fieldError : ''}`}>
              Category name *
              <input
                name='name'
                placeholder='E.g. Women Summer Collection'
                value={formData.name}
                onChange={handleInputChange}
                aria-invalid={missingFields.includes('name')}
              />
            </label>
            <label className={`${styles.field} ${missingFields.includes('description') ? styles.fieldError : ''}`}>
              Description *
              <textarea
                name='description'
                rows={4}
                placeholder='Describe what customers should expect from this collection.'
                value={formData.description}
                onChange={handleInputChange}
                aria-invalid={missingFields.includes('description')}
              />
            </label>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                Collection group
                <select name='group' value={formData.group} onChange={handleInputChange}>
                  {collectionGroups.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                Publish to storefront
                <div className={styles.checkboxList}>
                  <label className={styles.checkbox}>
                    <input
                      type='checkbox'
                      name='published'
                      checked={formData.published}
                      onChange={handleInputChange}
                    />
                    <span>Visible to customers</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input
                      type='checkbox'
                      name='featured'
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    <span>Mark as featured</span>
                  </label>
                </div>
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Assets</h3>
            <div className={styles.fieldRow}>
              <label className={styles.field}>
                Cover image URL
                <input
                  name='cover'
                  placeholder='https://'
                  value={formData.cover}
                  onChange={handleInputChange}
                />
              </label>
              <label className={styles.field}>
                Tags
                <input
                  name='tags'
                  placeholder='Separate tags with commas'
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </label>
            </div>
            <label className={styles.field}>
              Internal notes
              <textarea
                name='notes'
                rows={3}
                placeholder='Add rollout plans, merchandising reminders, or copy ideas.'
                value={formData.notes}
                onChange={handleInputChange}
              />
            </label>
          </section>
        </form>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h4>Best practices</h4>
            <ul className={styles.checkboxList}>
              <li>Use descriptive names so teams can find the collection quickly.</li>
              <li>Feature at most three collections at once to avoid crowding the homepage.</li>
              <li>Publish only when products, imagery, and copy are ready.</li>
            </ul>
          </div>
          <div className={styles.card}>
            <h4>Need imagery?</h4>
            <p>Upload a 4:3 cover image that focuses tightly on the hero product or scene.</p>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default AddCategory
