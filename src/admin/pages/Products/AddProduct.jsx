import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiUploadCloud } from 'react-icons/fi'
import styles from '../../styles/AddPage.module.css'
import Button from '../../components/Button/Button'
import { defaultProductImage, statusLabelMap, statusToneMap } from './productData'
import { createProduct, getProduct } from '../../services/productsService'

const emptyForm = {
  name: '',
  description: '',
  inventory: '',
  color: '',
  type: '',
  price: '',
  status: 'published',
  imageFile: null,
  imagePreview: '',
  tags: '',
  discountPrice: '',
  addTax: false,
  hasVariations: false,
  optionName: '',
  optionValues: '',
  weight: '',
  country: '',
  digitalItem: false,
  rating: '4.5',
  sizes: []
}

const CATEGORIES = [
  'Ao Dai',
  'Bridal Gowns',
  'Tailored Suiting',
  'Evening Dresses',
  'Long Dress',
  'Wedding Gown',
  'Evening Dress',
  'Evening Suit'
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

const AddProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [missingFields, setMissingFields] = useState([])
  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        try {
          const productToEdit = await getProduct(id)
          if (productToEdit) {
            setFormData({
              name: productToEdit.name,
              description: 'This is a placeholder description for the product.',
              inventory: productToEdit.stock.onHand.toString(),
              color: productToEdit.color || '',
              type: productToEdit.category,
              price: productToEdit.pricing.listPrice.replace(/[^0-9.]/g, ''),
              status: productToEdit.status.label.toLowerCase(),
              imagePreview: productToEdit.image,
              rating: productToEdit.rating.toString(),
              tags: '',
              discountPrice: '',
              addTax: false,
              hasVariations: false,
              optionName: '',
              optionValues: '',
              weight: '',
              country: '',
              digitalItem: false,
              sizes: productToEdit.sizes || []
            })
          }
        } catch (error) {
          console.error('Failed to load product:', error)
          setFormError('Failed to load product data')
        }
      }
      loadProduct()
    }
  }, [id, isEditMode])

  const handleBack = () => navigate('/admin/products')

  const handleCancel = () => navigate('/admin/products')

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: nextValue }))

    if (formError) setFormError('')
    if (missingFields.length) {
      const isFilled =
        typeof nextValue === 'string' ? nextValue.trim().length > 0 : Boolean(nextValue)
      if (isFilled) {
        setMissingFields((prev) => prev.filter((field) => field !== name))
      }
    }
  }

  const handleSizeToggle = (size) => {
    setFormData((prev) => {
      const currentSizes = prev.sizes || []
      const newSizes = currentSizes.includes(size)
        ? currentSizes.filter((s) => s !== size)
        : [...currentSizes, size]
      return { ...prev, sizes: newSizes }
    })
  }

  const handleImageBrowse = () => fileInputRef.current?.click()

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: typeof reader.result === 'string' ? reader.result : ''
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const requiredFields = ['name', 'description', 'price', 'inventory', 'color', 'type']
    const missing = requiredFields.filter((key) => !`${formData[key] ?? ''}`.trim())

    if (missing.length) {
      setFormError('Please fill in all required fields before saving.')
      setMissingFields(missing)
      return
    }

    const inventorySource = `${formData.inventory ?? ''}`.replace(/[^0-9]/g, '')
    const inventoryValue = Math.max(parseInt(inventorySource, 10) || 0, 0)
    const inventoryTone = inventoryValue <= 0 ? 'danger' : inventoryValue < 150 ? 'warning' : 'success'
    const inventoryLabel = inventoryValue <= 0 ? 'out of stock' : inventoryValue < 150 ? 'low stock' : 'in stock'

    const statusKey = (formData.status || 'published').toLowerCase()
    const statusLabel = statusLabelMap[statusKey] || statusLabelMap.published
    const statusTone = statusToneMap[statusKey] || statusToneMap.published

    const ratingValue = Math.min(Math.max(parseFloat(formData.rating) || 0, 0), 5)

    const normalizedPrice = parseFloat(formData.price)
    const price = Number.isNaN(normalizedPrice)
      ? '$0.00'
      : normalizedPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

    const productData = {
      name: formData.name || 'Untitled product',
      image: formData.imagePreview || defaultProductImage,
      inventory: { value: inventoryValue.toLocaleString(), label: inventoryLabel, tone: inventoryTone },
      color: formData.color || 'N/A',
      type: formData.type || 'General',
      price,
      status: { label: statusLabel, tone: statusTone },
      rating: Number(ratingValue.toFixed(1))
    }

    try {
      setFormError('')
      if (isEditMode) {
        // Editing not wired to API list yet; fallback to client-side update
        navigate('/admin/products', { replace: true, state: { newProduct: { ...productData, id } } })
        return
      }

      // Create via backend API
      const createdUi = await createProduct(formData)
      navigate('/admin/products', { replace: true, state: { newProduct: createdUi } })
    } catch (err) {
      setFormError(err?.message || 'Failed to save product')
    }
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
          <Button type='submit' form='add-product-form' variant='primary'>
            Save
          </Button>
        </div>
      </header>

      <main className={styles.body}>
        <form id='add-product-form' className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h1>{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
            <p>Define product information, inventory, pricing, and SEO before publishing.</p>
            {formError && (
              <div className={styles.formError} role='alert'>
                {formError}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3>Information</h3>
            <div className={styles.fieldRow}>
              <label
                className={`${styles.field} ${missingFields.includes('name') ? styles.fieldError : ''}`}
              >
                Product name *
                <input
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='Summer T-Shirt'
                  aria-invalid={missingFields.includes('name')}
                />
              </label>
              <label
                className={`${styles.field} ${
                  missingFields.includes('description') ? styles.fieldError : ''
                }`}
              >
                Product description *
                <input
                  name='description'
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder='Describe the product experience'
                  aria-invalid={missingFields.includes('description')}
                />
              </label>
            </div>

            <div className={styles.fieldRow}>
              <label
                className={`${styles.field} ${
                  missingFields.includes('inventory') ? styles.fieldError : ''
                }`}
              >
                Inventory quantity *
                <input
                  name='inventory'
                  type='number'
                  min='0'
                  value={formData.inventory}
                  onChange={handleInputChange}
                  placeholder='Enter stock quantity'
                  aria-invalid={missingFields.includes('inventory')}
                />
              </label>
              <label
                className={`${styles.field} ${missingFields.includes('color') ? styles.fieldError : ''}`}
              >
                Primary color *
                <input
                  name='color'
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder='e.g. Crimson, Champagne, Ivory'
                  aria-invalid={missingFields.includes('color')}
                />
              </label>
            </div>

            <div className={styles.fieldRow}>
              <label
                className={`${styles.field} ${missingFields.includes('type') ? styles.fieldError : ''}`}
              >
                Category *
                <select
                  name='type'
                  value={formData.type}
                  onChange={handleInputChange}
                  aria-invalid={missingFields.includes('type')}
                >
                  <option value=''>Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                Status
                <select name='status' value={formData.status} onChange={handleInputChange}>
                  <option value='published'>Published</option>
                  <option value='scheduled'>Scheduled</option>
                  <option value='draft'>Draft</option>
                  <option value='archived'>Archived</option>
                </select>
              </label>
            </div>

            <div className={styles.fieldRow}>
              <label className={styles.field}>
                Sizes
                <div className={styles.sizeSelector}>
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type='button'
                      className={`${styles.sizeButton} ${
                        formData.sizes.includes(size) ? styles.sizeButtonActive : ''
                      }`}
                      onClick={() => handleSizeToggle(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Images</h3>
            <div className={styles.mediaUpload}>
              <div className={styles.preview}>
                <img src={formData.imagePreview || defaultProductImage} alt='Preview' />
              </div>
              <div>
                <strong>Upload product imagery</strong>
                <span>PNG, JPG up to 5 MB</span>
                <div className={styles.uploadActions}>
                  <button type='button' onClick={handleImageBrowse}>
                    <FiUploadCloud />
                    Add File
                  </button>
                  <span className={styles.fileHint}>
                    {formData.imageFile ? formData.imageFile.name : 'No file selected'}
                  </span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                className={styles.hiddenInput}
                type='file'
                accept='image/png,image/jpeg,image/webp'
                onChange={handleImageChange}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3>Pricing</h3>
            <div className={styles.fieldRow}>
              <label
                className={`${styles.field} ${missingFields.includes('price') ? styles.fieldError : ''}`}
              >
                Product price *
                <input
                  name='price'
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder='Enter price'
                  aria-invalid={missingFields.includes('price')}
                />
              </label>
              <label className={styles.field}>
                Discount price
                <input
                  name='discountPrice'
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  placeholder='Price at discount'
                />
              </label>
              <label className={styles.field}>
                Product rating
                <input
                  name='rating'
                  type='number'
                  min='0'
                  max='5'
                  step='0.1'
                  value={formData.rating}
                  onChange={handleInputChange}
                  placeholder='4.5'
                />
              </label>
            </div>
            <label className={styles.checkbox}>
              <input
                type='checkbox'
                name='addTax'
                checked={formData.addTax}
                onChange={handleInputChange}
              />
              <span>Add tax for this product</span>
            </label>
          </section>

          <section className={styles.section}>
            <h3>Different options</h3>
            <label className={styles.checkbox}>
              <input
                type='checkbox'
                name='hasVariations'
                checked={formData.hasVariations}
                onChange={handleInputChange}
              />
              <span>This product has multiple options</span>
            </label>
            {formData.hasVariations && (
              <div className={styles.fieldRow}>
                <label className={styles.field}>
                  Option name
                  <input
                    name='optionName'
                    value={formData.optionName}
                    onChange={handleInputChange}
                    placeholder='Size'
                  />
                </label>
                <label className={styles.field}>
                  Option values
                  <input
                    name='optionValues'
                    value={formData.optionValues}
                    onChange={handleInputChange}
                    placeholder='S, M, L, XL'
                  />
                </label>
              </div>
            )}
          </section>

        </form>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h4>Tags</h4>
            <label className={styles.field}>
              Add tags
              <input
                name='tags'
                value={formData.tags}
                onChange={handleInputChange}
                placeholder='Enter tag name'
              />
            </label>
            <div className={styles.tagPills}>
              {['T-Shirt', 'Men Clothes', 'Summer Collection'].map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

        </aside>
      </main>
    </div>
  )
}

export default AddProduct





