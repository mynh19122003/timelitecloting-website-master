import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiUploadCloud } from 'react-icons/fi'
import styles from '../../styles/AddPage.module.css'
import Button from '../../components/Button/Button'
import { defaultProductImage, statusLabelMap, statusToneMap } from './productData'
import { createProduct, getProduct, updateProduct, getTags, getCategories } from '../../services/productsService'
import { listVariants, createVariant } from '../../services/variantsService'

const emptyForm = {
  name: '',
  description: '',
  inventory: '',
  color: '',
  variant: '',
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

// Default categories as fallback
const DEFAULT_CATEGORIES = [
  'Ao Dai',
  'Suiting',
  'Bridal Gowns',
  'Bridal',
  'Evening Couture',
  'Conical Hats',
  'Accessories',
  'Kidswear',
  'Gift Procession Sets'
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

const AddProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [missingFields, setMissingFields] = useState([])
  const [variantsList, setVariantsList] = useState([])
  const [tagsList, setTagsList] = useState([])
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES)
  const [selectedTags, setSelectedTags] = useState([])
  const [showNewVariantInput, setShowNewVariantInput] = useState(false)
  const [newVariantName, setNewVariantName] = useState('')
  const isEditMode = !!id

  useEffect(() => {
    const fetchVariants = async () => {
      const list = await listVariants()
      setVariantsList(list)
    }
    fetchVariants()
  }, [])

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getTags()
      setTagsList(tags)
    }
    fetchTags()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getCategories()
      if (categories && categories.length > 0) {
        setCategoriesList(categories)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        try {
          // Ensure id is a string to avoid issues
          const productId = typeof id === 'string' ? id : String(id || '')
          if (!productId) {
            console.error('Invalid product id:', id)
            setFormError('Invalid product ID')
            return
          }
          const productToEdit = await getProduct(productId)
          if (productToEdit) {
            // Parse tags if they exist
            let parsedTags = []
            try {
              if (productToEdit.tags) {
                if (typeof productToEdit.tags === 'string') {
                  parsedTags = JSON.parse(productToEdit.tags)
                } else if (Array.isArray(productToEdit.tags)) {
                  parsedTags = productToEdit.tags
                }
              }
            } catch (_) {
              parsedTags = []
            }
            
            setSelectedTags(Array.isArray(parsedTags) ? parsedTags : [])
            setFormData({
              name: productToEdit.name,
              description: 'This is a placeholder description for the product.',
              inventory: productToEdit.stock.onHand.toString(),
              color: productToEdit.color || '',
              variant: productToEdit.variant || '',
              type: productToEdit.category || '',
              price: productToEdit.pricing.listPrice.replace(/[^0-9.]/g, ''),
              status: productToEdit.status.label.toLowerCase(),
              imagePreview: productToEdit.image,
              rating: productToEdit.rating.toString(),
              tags: Array.isArray(parsedTags) && parsedTags.length > 0 ? JSON.stringify(parsedTags) : '',
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

  const handleTagSelect = (event) => {
    const selectedTag = event.target.value
    if (!selectedTag) return

    if (!selectedTags.includes(selectedTag)) {
      const newTags = [...selectedTags, selectedTag]
      setSelectedTags(newTags)
      setFormData((prev) => ({ ...prev, tags: JSON.stringify(newTags) }))
    }
    // Reset select to empty
    event.target.value = ''
  }

  const handleTagRemove = (tagToRemove) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove)
    setSelectedTags(newTags)
    setFormData((prev) => ({ ...prev, tags: newTags.length > 0 ? JSON.stringify(newTags) : '' }))
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
      
      // Handle new variant creation if applicable
      let finalVariant = formData.variant
      if (showNewVariantInput && newVariantName.trim()) {
        try {
          const created = await createVariant(newVariantName.trim())
          if (created) {
            finalVariant = created.variant_name
            setVariantsList((prev) => [...prev, created].sort((a, b) => a.variant_name.localeCompare(b.variant_name)))
          }
        } catch (error) {
          console.error('Failed to create variant:', error)
          // Continue with empty or existing variant?
          // Maybe show error? For now just log.
        }
      }

      if (isEditMode) {
        // Update product via backend API
        const updatePayload = { 
          ...formData, 
          variant: finalVariant,
          inventory: inventoryValue,
          price: normalizedPrice
        }
        console.log('[AddProduct] Attempting to update product with payload:', updatePayload)
        
        const updatedUi = await updateProduct(id, updatePayload)
        console.log('[AddProduct] Product updated successfully:', updatedUi)
        
        // Navigate back to products list with updated data
        navigate('/admin/products', { replace: true, state: { updatedProduct: updatedUi } })
        return
      }

      // Create via backend API
      const payload = { ...formData, variant: finalVariant }
      console.log('[AddProduct] Attempting to create product with payload:', payload)
      
      const createdUi = await createProduct(payload)
      console.log('[AddProduct] Product created successfully:', createdUi)
      
      // Điều hướng lại trang danh sách sản phẩm cùng dữ liệu mới
      navigate('/admin/products', { replace: true, state: { newProduct: createdUi } })
    } catch (err) {
      console.error('[AddProduct] Error creating product:', err)
      console.error('[AddProduct] Error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        headers: err?.response?.headers,
        config: {
          url: err?.config?.url,
          method: err?.config?.method,
          baseURL: err?.config?.baseURL,
          headers: err?.config?.headers
        }
      })
      
      // Hiển thị lỗi chi tiết hơn
      let errorMessage = 'Failed to save product'
      if (err?.response?.status === 403) {
        errorMessage = `403 Forbidden: ${err?.response?.data?.message || 'Bạn không có quyền tạo sản phẩm. Vui lòng kiểm tra admin token.'}`
        if (err?.response?.data?.error) {
          errorMessage += `\nError code: ${err.response.data.error}`
        }
      } else if (err?.response?.status === 401) {
        errorMessage = `401 Unauthorized: ${err?.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.'}`
      } else if (err?.response?.data?.message) {
        errorMessage = `${err.response.status || 'Error'}: ${err.response.data.message}`
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setFormError(errorMessage)
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
              <div className={styles.formError} role='alert' style={{ whiteSpace: 'pre-line' }}>
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
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                Variant (Collection)
                {!showNewVariantInput ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      name='variant'
                      value={formData.variant}
                      onChange={handleInputChange}
                      style={{ flex: 1 }}
                    >
                      <option value=''>Select variant</option>
                      {variantsList.map((v) => (
                        <option key={v.id} value={v.variant_name}>
                          {v.variant_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type='button'
                      onClick={() => setShowNewVariantInput(true)}
                      style={{ whiteSpace: 'nowrap', padding: '0 8px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                    >
                      + New
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={newVariantName}
                      onChange={(e) => setNewVariantName(e.target.value)}
                      placeholder='Enter new variant'
                      style={{ flex: 1 }}
                    />
                    <button
                      type='button'
                      onClick={() => setShowNewVariantInput(false)}
                      style={{ whiteSpace: 'nowrap', padding: '0 8px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </label>
            </div>

            <div className={styles.fieldRow}>
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
              <select
                onChange={handleTagSelect}
                defaultValue=''
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value=''>Select a tag</option>
                {tagsList
                  .filter((tag) => !selectedTags.includes(tag))
                  .map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
              </select>
            </label>
            {selectedTags.length > 0 && (
              <div className={styles.tagPills} style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    {tag}
                    <button
                      type='button'
                      onClick={() => handleTagRemove(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        marginLeft: '4px',
                        fontSize: '16px',
                        lineHeight: '1',
                        color: '#666'
                      }}
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
              ))}
            </div>
            )}
            {tagsList.length === 0 && (
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                No tags available. Tags will appear here once products are created.
              </p>
            )}
          </div>

        </aside>
      </main>
    </div>
  )
}

export default AddProduct





