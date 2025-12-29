import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiUploadCloud, FiX } from 'react-icons/fi'
import styles from '../../styles/AddPage.module.css'
import Button from '../../components/Button/Button'
import { defaultProductImage, statusLabelMap, statusToneMap } from './productData'
import {
  createProduct,
  getProduct,
  updateProduct,
  getTags,
  getCategories,
  bulkCreateProducts
} from '../../services/productsService'
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
  imagePreview: '',
  galleryPayload: [],
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

const PRIMARY_CATEGORIES = [
  { label: 'Ao Dai', slug: 'ao-dai' },
  { label: 'Suits', slug: 'suits' },
  { label: 'Bridal & Formal Dresses', slug: 'bridal-formal-dresses' },
  { label: 'Accessories', slug: 'accessories' },
  { label: 'Lunar New Year Décor', slug: 'lunar-new-year-decor' },
  { label: 'Ceremonial Attire', slug: 'ceremonial-attire' },
  { label: 'Uniforms & Teamwear', slug: 'uniforms-teamwear' },
  { label: 'Wedding Gift Trays', slug: 'wedding-gift-trays' }
]

const CATEGORY_SLUG_MAP = PRIMARY_CATEGORIES.reduce((acc, item) => {
  acc[item.label] = item.slug
  return acc
}, {})

const toCategorySlug = (value = '') => {
  if (!value) return ''
  if (CATEGORY_SLUG_MAP[value]) return CATEGORY_SLUG_MAP[value]
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Default categories as fallback
const DEFAULT_CATEGORIES = PRIMARY_CATEGORIES

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL']
const SIZELESS_CATEGORY_SLUGS = new Set([
  'accessories',
  'lunar-new-year-decor',
  'gift-procession-sets',
  'gift-procession',
  'decor',
  'home-decor',
  'mam-qua',
  'non-la',
  'wedding-gift-trays'
])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])

const generateTempId = () => `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const createEmptyBulkProduct = () => ({
  ...emptyForm,
  id: generateTempId(),
  imagePreview: '',
  galleryPayload: [],
  mediaUploads: [],
  selectedTags: []
})

const readFilesAsUploads = (files = []) =>
  Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve({
                id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: file.name,
                dataUrl: reader.result
              })
            } else {
              reject(new Error('Failed to read file'))
            }
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
    )
  )

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read data URL'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read data URL'))
    reader.readAsDataURL(blob)
  })

const prettifyFilename = (filename = '') =>
  filename
    .split('/')
    .pop()
    ?.replace(/\.[^/.]+$/, '')
    ?.replace(/^[\s.]+/, '')
    ?.replace(/[-_]+/g, ' ')
    ?.replace(/\s+/g, ' ')
    ?.trim() || 'Untitled product'

const sortVariantsByCategory = (variants = []) =>
  [...variants].sort((a, b) => {
    if (a.category_slug === b.category_slug) {
      if (a.sort_order !== b.sort_order) return (a.sort_order || 0) - (b.sort_order || 0)
      return a.variant_name.localeCompare(b.variant_name)
    }
    return a.category_slug.localeCompare(b.category_slug)
  })

const AddProduct = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const fileInputRef = useRef(null)
  const bulkFileInputRefs = useRef({})
  const bulkImagesInputRef = useRef(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [missingFields, setMissingFields] = useState([])
  const [variantsList, setVariantsList] = useState([])
  const [tagsList, setTagsList] = useState([])
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES)
  const [selectedTags, setSelectedTags] = useState([])
  const [showNewVariantInput, setShowNewVariantInput] = useState(false)
  const [newVariantName, setNewVariantName] = useState('')
  const [mediaUploads, setMediaUploads] = useState([])
  const [existingMedia, setExistingMedia] = useState([])
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [bulkProducts, setBulkProducts] = useState([])
  const [bulkFormError, setBulkFormError] = useState('')
  const [bulkPreviewData, setBulkPreviewData] = useState(null)
  const [isProcessingImages, setIsProcessingImages] = useState(false)
  const isEditMode = !!id

  const selectedCategorySlug = useMemo(() => toCategorySlug(formData.type), [formData.type])
  const filteredVariants = useMemo(() => {
    if (!selectedCategorySlug) return variantsList
    return variantsList.filter((variant) => variant.category_slug === selectedCategorySlug)
  }, [variantsList, selectedCategorySlug])
  const variantOptions = filteredVariants.length ? filteredVariants : variantsList
  const hasSelectedVariant = useMemo(
    () => variantOptions.some((variant) => variant.variant_name === formData.variant),
    [variantOptions, formData.variant]
  )

  useEffect(() => {
    const fetchVariants = async () => {
      const list = await listVariants()
      setVariantsList(sortVariantsByCategory(list))
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
      if (Array.isArray(categories) && categories.length > 0) {
        // Always show the curated primary list in the specified order
        setCategoriesList(PRIMARY_CATEGORIES)
        return
      }
      setCategoriesList(PRIMARY_CATEGORIES)
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
              galleryPayload: [],
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
            const existingList = []
            if (productToEdit.image) {
              existingList.push({ id: 'existing-main', url: productToEdit.image, label: 'Cover' })
            }
            if (Array.isArray(productToEdit.gallery)) {
              productToEdit.gallery.forEach((url, index) => {
                existingList.push({
                  id: `existing-gallery-${index}`,
                  url,
                  label: `main_${index + 2}.webp`
                })
              })
            }
            setExistingMedia(existingList)
            setMediaUploads([])
          }
        } catch (error) {
          console.error('Failed to load product:', error)
          setFormError('Failed to load product data')
        }
      }
      loadProduct()
    }
  }, [id, isEditMode])

  useEffect(() => {
    if (!isEditMode) {
      setExistingMedia([])
      setMediaUploads([])
    }
  }, [isEditMode])

  useEffect(() => {
    if (showNewVariantInput && !selectedCategorySlug) {
      setShowNewVariantInput(false)
      setNewVariantName('')
    }
  }, [selectedCategorySlug])

  const syncMediaToFormData = (uploads) => {
    setFormData((prev) => ({
      ...prev,
      imagePreview: uploads[0]?.dataUrl || (isEditMode && existingMedia[0]?.url) || '',
      galleryPayload: uploads.length > 1 ? uploads.slice(1).map((item) => item.dataUrl) : []
    }))
  }

  const updateBulkProduct = (index, updater) => {
    setBulkProducts((prev) => {
      const next = [...prev]
      const current = next[index]
      if (!current) return prev
      const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      next[index] = updated
      return next
    })
  }

  const handleBulkInputChange = (index, event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    updateBulkProduct(index, (product) => {
      const nextState = { ...product, [name]: nextValue }
      if (name === 'type') {
        const slug = toCategorySlug(nextValue)
        if (slug && SIZELESS_CATEGORY_SLUGS.has(slug)) {
          nextState.sizes = []
        }
      }
      return nextState
    })
    if (bulkFormError) setBulkFormError('')
  }

  const handleBulkSizeToggle = (index, size) => {
    updateBulkProduct(index, (product) => {
      const currentSizes = product.sizes || []
      const nextSizes = currentSizes.includes(size)
        ? currentSizes.filter((item) => item !== size)
        : [...currentSizes, size]
      return { ...product, sizes: nextSizes }
    })
  }

  const handleBulkTagSelect = (index, event) => {
    const tag = event.target.value
    if (!tag) return
    updateBulkProduct(index, (product) => {
      const existing = product.selectedTags || []
      if (existing.includes(tag)) return product
      const selectedTags = [...existing, tag]
      return { ...product, selectedTags, tags: JSON.stringify(selectedTags) }
    })
    event.target.value = ''
  }

  const handleBulkTagRemove = (index, tagToRemove) => {
    updateBulkProduct(index, (product) => {
      const selectedTags = (product.selectedTags || []).filter((tag) => tag !== tagToRemove)
      return { ...product, selectedTags, tags: selectedTags.length ? JSON.stringify(selectedTags) : '' }
    })
  }

  const handleBulkAddProductRow = () => {
    setBulkProducts((prev) => [...prev, createEmptyBulkProduct()])
    setBulkFormError('')
  }

  const handleBulkDuplicateProduct = (index) => {
    setBulkProducts((prev) => {
      const target = prev[index]
      if (!target) return prev
      const clone = {
        ...target,
        id: generateTempId(),
        mediaUploads: (target.mediaUploads || []).map((upload) => ({
          ...upload,
          id: `${upload.id}-copy-${Math.random().toString(36).slice(2, 6)}`
        })),
        galleryPayload: [...(target.galleryPayload || [])],
        selectedTags: [...(target.selectedTags || [])]
      }
      return [...prev.slice(0, index + 1), clone, ...prev.slice(index + 1)]
    })
  }

  const handleBulkRemoveProduct = (index) => {
    setBulkProducts((prev) => {
      const target = prev[index]
      if (target?.id && bulkFileInputRefs.current[target.id]) {
        delete bulkFileInputRefs.current[target.id]
      }
      return [...prev.slice(0, index), ...prev.slice(index + 1)]
    })
  }

  const handleBulkImageChange = async (index, event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const oversizeFile = files.find((file) => file.size > MAX_FILE_SIZE)
    if (oversizeFile) {
      setBulkFormError(`"${oversizeFile.name}" exceeds the 5MB limit. Please choose a smaller file.`)
      event.target.value = ''
      return
    }

    try {
      const uploads = await readFilesAsUploads(files)
      updateBulkProduct(index, (product) => {
        const merged = [...(product.mediaUploads || []), ...uploads]
        return {
          ...product,
          mediaUploads: merged,
          imagePreview: merged[0]?.dataUrl || '',
          galleryPayload: merged.length > 1 ? merged.slice(1).map((item) => item.dataUrl) : []
        }
      })
      if (bulkFormError) setBulkFormError('')
    } catch (error) {
      console.error('[BulkAdd] Failed to process images:', error)
      setBulkFormError('Failed to process selected images. Please try again.')
    } finally {
      if (event.target) event.target.value = ''
    }
  }

  const handleBulkRemoveUpload = (index, uploadId) => {
    updateBulkProduct(index, (product) => {
      const mediaUploads = (product.mediaUploads || []).filter((item) => item.id !== uploadId)
      return {
        ...product,
        mediaUploads,
        imagePreview: mediaUploads[0]?.dataUrl || '',
        galleryPayload: mediaUploads.length > 1 ? mediaUploads.slice(1).map((item) => item.dataUrl) : []
      }
    })
  }

  const handleBulkReset = () => {
    setBulkProducts([])
    setBulkPreviewData(null)
    setBulkFormError('')
  }

  const handleBulkBrowse = (productId) => {
    const ref = bulkFileInputRefs.current?.[productId]
    if (ref) {
      ref.click()
    }
  }

  const handleBulkImagesBrowse = () => bulkImagesInputRef.current?.click()

  const handleMultipleImagesUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    setIsProcessingImages(true)
    setBulkFormError('')

    try {
      // Filter only image files
      const imageFiles = files.filter((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase()
        return extension && IMAGE_EXTENSIONS.has(extension)
      })

      if (!imageFiles.length) {
        setBulkFormError('No valid image files selected. Please select PNG, JPG, WEBP, or GIF files.')
        return
      }

      // Check file sizes
      const oversizeFiles = imageFiles.filter((file) => file.size > MAX_FILE_SIZE)
      if (oversizeFiles.length) {
        setBulkFormError(
          `Some files exceed the 5MB limit: ${oversizeFiles.map((f) => f.name).join(', ')}`
        )
        return
      }

      // Process images and create products
      const createdProducts = []
      for (const file of imageFiles) {
        try {
          const uploads = await readFilesAsUploads([file])
          if (uploads.length > 0) {
            const upload = uploads[0]
            createdProducts.push({
              ...createEmptyBulkProduct(),
              id: generateTempId(),
              name: prettifyFilename(file.name),
              mediaUploads: [upload],
              imagePreview: upload.dataUrl,
              galleryPayload: []
            })
          }
        } catch (error) {
          console.error(`[AddProduct] Failed to process ${file.name}:`, error)
        }
      }

      if (!createdProducts.length) {
        setBulkFormError('Failed to process images. Please try again.')
        return
      }

      setBulkProducts((prev) => [...prev, ...createdProducts])
      setBulkPreviewData(null)
    } catch (error) {
      console.error('[AddProduct] Failed to process images:', error)
      setBulkFormError('Failed to process images. Please try again.')
    } finally {
      setIsProcessingImages(false)
      if (event.target) event.target.value = ''
    }
  }

  const validateBulkProducts = () => {
    const requiredFields = ['name', 'description', 'price', 'inventory', 'color', 'type']
    const issues = []
    const normalized = bulkProducts.map((product, index) => {
      const missing = requiredFields.filter((key) => !`${product[key] ?? ''}`.trim())
      const missingImages = (product.mediaUploads || []).length === 0 && !product.imagePreview
      if (missing.length || missingImages) {
        issues.push(
          `Product #${index + 1} missing: ${[
            ...missing,
            ...(missingImages ? ['images'] : [])
          ].join(', ')}`
        )
      }
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        color: product.color,
        category: product.type,
        variant: product.variant,
        inventory: Number(product.inventory) || 0,
        price: Number(product.price) || 0,
        status: product.status,
        rating: Number(product.rating) || 0,
        sizes: product.sizes || [],
        tags: product.selectedTags || [],
        hasVariations: product.hasVariations,
        optionName: product.optionName,
        optionValues: product.optionValues,
        mediaCount: (product.mediaUploads || []).length
      }
    })

    if (issues.length) {
      setBulkFormError(issues.join('\n'))
      return null
    }

    setBulkFormError('')
    return normalized
  }

  const handleBulkPreview = () => {
    const normalized = validateBulkProducts()
    if (!normalized) {
      setBulkPreviewData(null)
      return
    }
    setBulkPreviewData(normalized)
    console.log('[BulkAdd] Preview payload (UI only):', normalized)
  }

  const handleBulkSave = async () => {
    const normalized = validateBulkProducts()
    if (!normalized) {
      return
    }

    // Map normalized data to API payload format
    const apiPayload = normalized.map((product) => {
      const bulkProduct = bulkProducts.find((p) => p.id === product.id)
      return {
        name: product.name,
        description: product.description,
        color: product.color,
        category: product.category,
        variant: product.variant,
        inventory: product.inventory,
        price: product.price,
        status: bulkProduct?.status || 'published',
        rating: product.rating,
        sizes: product.sizes,
        tags: product.tags,
        imagePreview: bulkProduct?.imagePreview || '',
        mediaUploads: bulkProduct?.mediaUploads || []
      }
    })

    try {
      setBulkFormError('')
      setIsProcessingImages(true) // Reuse loading state
      const result = await bulkCreateProducts(apiPayload)

      if (result.failedCount > 0) {
        const failedMessages = result.failed.map(
          (f) => `Product #${f.index + 1} (${f.productName}): ${f.error}`
        )
        setBulkFormError(
          `Created ${result.successCount} product(s). Failed:\n${failedMessages.join('\n')}`
        )
      } else {
        alert(`Successfully created ${result.successCount} product(s)!`)
        navigate('/admin/products')
      }
    } catch (error) {
      console.error('[handleBulkSave] Failed:', error)
      setBulkFormError(
        error?.response?.data?.message || 'Failed to save products. Please try again.'
      )
    } finally {
      setIsProcessingImages(false)
    }
  }

  const handleBack = () => navigate('/admin/products')

  const handleCancel = () => navigate('/admin/products')

  const shouldShowSizeSelector = useMemo(() => {
    if (!selectedCategorySlug) return true
    return !SIZELESS_CATEGORY_SLUGS.has(selectedCategorySlug)
  }, [selectedCategorySlug])

  useEffect(() => {
    if (!shouldShowSizeSelector && formData.sizes.length) {
      setFormData((prev) => ({ ...prev, sizes: [] }))
    }
  }, [shouldShowSizeSelector, formData.sizes.length])

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    const nextValue = type === 'checkbox' ? checked : value
    setFormData((prev) => {
      const nextState = { ...prev, [name]: nextValue }

      if (name === 'type') {
        const slug = toCategorySlug(nextValue)

        // Logic for Wedding Gift Trays
        if (slug === 'wedding-gift-trays') {
          nextState.variant = 'Rent'
          nextState.color = 'Default'
          nextState.inventory = '100' // Default inventory for rental items
          nextState.sizes = []
        } else if (slug && SIZELESS_CATEGORY_SLUGS.has(slug)) {
          nextState.sizes = []
        }
      }
      return nextState
    })

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

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const oversizeFile = files.find((file) => file.size > MAX_FILE_SIZE)
    if (oversizeFile) {
      setFormError(`"${oversizeFile.name}" exceeds the 5MB limit. Please choose a smaller file.`)
      event.target.value = ''
      return
    }

    try {
      const uploads = await readFilesAsUploads(files)

      setMediaUploads((prev) => {
        const merged = [...prev, ...uploads]
        syncMediaToFormData(merged)
        return merged
      })
      if (formError) setFormError('')
    } catch (error) {
      console.error('Failed to process images:', error)
      setFormError('Failed to process selected images. Please try again.')
    } finally {
      if (event.target) event.target.value = ''
    }
  }

  const handleRemoveUpload = (uploadId) => {
    setMediaUploads((prev) => {
      const updated = prev.filter((item) => item.id !== uploadId)
      syncMediaToFormData(updated)
      return updated
    })
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

    if (!isEditMode && mediaUploads.length === 0) {
      setFormError('Please upload at least one product image before saving.')
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
      if (showNewVariantInput) {
        if (!selectedCategorySlug) {
          setFormError('Please choose a category before creating a new variant.')
          return
        }

        if (!newVariantName.trim()) {
          setFormError('Please enter the new variant name.')
          return
        }

        try {
          const created = await createVariant(newVariantName.trim(), selectedCategorySlug)
          if (created) {
            finalVariant = created.variant_name
            setVariantsList((prev) => sortVariantsByCategory([...prev, created]))
            setShowNewVariantInput(false)
            setNewVariantName('')
          }
        } catch (error) {
          console.error('Failed to create variant:', error)
          setFormError(error?.response?.data?.message || 'Failed to create variant')
          return
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

  const renderBulkMode = () => (
    <main className={styles.bulkBody}>
      <section className={styles.section}>
        <div className={styles.bulkHeader}>
          <div>
            <h1>Add multiple products</h1>
            <p>
              Select multiple images to auto-generate product cards, fine-tune their details, then
              preview the payload before connecting the API.
            </p>
          </div>
          <div className={styles.bulkHeaderActions}>
            <Button type='button' variant='ghost' onClick={handleBulkReset}>
              Reset list
            </Button>
            <Button type='button' variant='ghost' onClick={handleBulkAddProductRow}>
              + Add product
            </Button>
            <Button type='button' variant='ghost' onClick={handleBulkImagesBrowse} disabled={isProcessingImages}>
              {isProcessingImages ? 'Processing images…' : 'Add images'}
            </Button>
            <Button type='button' variant='ghost' onClick={handleBulkPreview}>
              Preview payload
            </Button>
            <Button type='button' variant='primary' onClick={handleBulkSave}>
              Save products
            </Button>
            <input
              ref={bulkImagesInputRef}
              type='file'
              accept='image/*'
              multiple
              className={styles.hiddenInput}
              onChange={handleMultipleImagesUpload}
            />
          </div>
        </div>
        {bulkFormError && (
          <div className={styles.formError} role='alert' style={{ whiteSpace: 'pre-line' }}>
            {bulkFormError}
          </div>
        )}

        <div className={styles.bulkCardStack}>
          {bulkProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                No products yet. Add products manually or select multiple images to get started.
              </p>
            </div>
          ) : (
            bulkProducts.map((product, index) => {
              const productCategorySlug = toCategorySlug(product.type)
              const matchingVariants = productCategorySlug
                ? variantsList.filter((variant) => variant.category_slug === productCategorySlug)
                : variantsList
              const variantOptions = matchingVariants.length ? matchingVariants : variantsList
              const hasVariant = variantOptions.some(
                (variant) => variant.variant_name === product.variant
              )
              const showSizes =
                !productCategorySlug || !SIZELESS_CATEGORY_SLUGS.has(productCategorySlug)

              return (
                <article key={product.id} className={styles.bulkCard}>
                  <header className={styles.bulkCardHeader}>
                    <div>
                      <p className={styles.bulkCardEyebrow}>Product #{index + 1}</p>
                      <h4>{product.name || 'Untitled product'}</h4>
                    </div>
                    <div className={styles.bulkCardActions}>
                      <button
                        type='button'
                        className={styles.bulkGhostButton}
                        onClick={() => handleBulkDuplicateProduct(index)}
                      >
                        Duplicate
                      </button>
                      <button
                        type='button'
                        className={styles.bulkDangerButton}
                        onClick={() => handleBulkRemoveProduct(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </header>

                  <div className={styles.fieldRow}>
                    <label className={styles.field}>
                      Product name *
                      <input
                        name='name'
                        value={product.name}
                        onChange={(event) => handleBulkInputChange(index, event)}
                        placeholder='Summer T-Shirt'
                      />
                    </label>
                    <label className={styles.field}>
                      Product description *
                      <input
                        name='description'
                        value={product.description}
                        onChange={(event) => handleBulkInputChange(index, event)}
                        placeholder='Describe the product experience'
                      />
                    </label>
                  </div>

                  <div className={styles.fieldRow}>
                    <label className={styles.field}>
                      Inventory quantity *
                      <input
                        name='inventory'
                        type='number'
                        min='0'
                        value={product.inventory}
                        onChange={(event) => handleBulkInputChange(index, event)}
                      />
                    </label>
                    <label className={styles.field}>
                      Primary color *
                      <input
                        name='color'
                        value={product.color}
                        onChange={(event) => handleBulkInputChange(index, event)}
                        placeholder='e.g. Crimson, Champagne, Ivory'
                      />
                    </label>
                  </div>

                  <div className={styles.fieldRow}>
                    <label className={styles.field}>
                      Category *
                      <select
                        name='type'
                        value={product.type}
                        onChange={(event) => handleBulkInputChange(index, event)}
                      >
                        <option value=''>Select a category</option>
                        {categoriesList.map((cat) => (
                          <option key={cat.slug} value={cat.label}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.field}>
                      Variant (Collection)
                      <select
                        name='variant'
                        value={product.variant}
                        onChange={(event) => handleBulkInputChange(index, event)}
                      >
                        <option value=''>Select variant</option>
                        {variantOptions.map((variant) => (
                          <option
                            key={`${variant.category_slug}-${variant.variant_name}`}
                            value={variant.variant_name}
                          >
                            {variant.variant_name}
                          </option>
                        ))}
                        {!hasVariant && product.variant && (
                          <option value={product.variant}>{product.variant}</option>
                        )}
                      </select>
                    </label>
                  </div>

                  <div className={styles.fieldRow}>
                    <label className={styles.field}>
                      Status
                      <select
                        name='status'
                        value={product.status}
                        onChange={(event) => handleBulkInputChange(index, event)}
                      >
                        <option value='published'>Published</option>
                        <option value='scheduled'>Scheduled</option>
                        <option value='draft'>Draft</option>
                        <option value='archived'>Archived</option>
                      </select>
                    </label>
                    <label className={styles.field}>
                      Product rating
                      <input
                        name='rating'
                        type='number'
                        min='0'
                        max='5'
                        step='0.1'
                        value={product.rating}
                        onChange={(event) => handleBulkInputChange(index, event)}
                      />
                    </label>
                    <label className={styles.field}>
                      Product price *
                      <input
                        name='price'
                        value={product.price}
                        onChange={(event) => handleBulkInputChange(index, event)}
                        placeholder='Enter price'
                      />
                    </label>
                  </div>

                  {showSizes ? (
                    <div className={styles.fieldRow}>
                      <label className={styles.field}>
                        Sizes
                        <div className={styles.sizeSelector}>
                          {SIZES.map((size) => (
                            <button
                              key={`${product.id}-${size}`}
                              type='button'
                              className={`${styles.sizeButton} ${product.sizes.includes(size) ? styles.sizeButtonActive : ''
                                }`}
                              onClick={() => handleBulkSizeToggle(index, size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </label>
                    </div>
                  ) : (
                    product.type && (
                      <p className={styles.helperText}>
                        Category “{product.type}” does not use sizes, so the selector is hidden.
                      </p>
                    )
                  )}

                  <div className={styles.bulkMediaUpload}>
                    {product.mediaUploads.length > 0 && (
                      <div>
                        <p className={styles.mediaLabel}>Pending uploads</p>
                        <div className={styles.mediaThumbGrid}>
                          {product.mediaUploads.map((media, mediaIndex) => (
                            <figure key={media.id} className={styles.mediaThumb}>
                              <img src={media.dataUrl} alt={`Bulk upload ${mediaIndex + 1}`} />
                              <figcaption>
                                {mediaIndex === 0 ? 'main.webp (cover)' : `main_${mediaIndex + 1}.webp`}
                              </figcaption>
                              <button
                                type='button'
                                className={styles.mediaRemove}
                                onClick={() => handleBulkRemoveUpload(index, media.id)}
                                aria-label='Remove image'
                              >
                                <FiX />
                              </button>
                            </figure>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={styles.uploadActions}>
                      <button type='button' onClick={() => handleBulkBrowse(product.id)}>
                        <FiUploadCloud />
                        Add files
                      </button>
                      <span className={styles.fileHint}>
                        {product.mediaUploads.length
                          ? `${product.mediaUploads.length} file(s) ready`
                          : 'No new files selected'}
                      </span>
                    </div>
                    <input
                      ref={(node) => {
                        bulkFileInputRefs.current[product.id] = node
                      }}
                      className={styles.hiddenInput}
                      type='file'
                      accept='image/png,image/jpeg,image/webp'
                      multiple
                      onChange={(event) => handleBulkImageChange(index, event)}
                    />
                  </div>

                  <div className={styles.fieldRow}>
                    <label className={styles.checkbox}>
                      <input
                        type='checkbox'
                        name='addTax'
                        checked={product.addTax}
                        onChange={(event) => handleBulkInputChange(index, event)}
                      />
                      <span>Add tax for this product</span>
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type='checkbox'
                        name='hasVariations'
                        checked={product.hasVariations}
                        onChange={(event) => handleBulkInputChange(index, event)}
                      />
                      <span>This product has multiple options</span>
                    </label>
                  </div>

                  {product.hasVariations && (
                    <div className={styles.fieldRow}>
                      <label className={styles.field}>
                        Option name
                        <input
                          name='optionName'
                          value={product.optionName}
                          onChange={(event) => handleBulkInputChange(index, event)}
                          placeholder='Size'
                        />
                      </label>
                      <label className={styles.field}>
                        Option values
                        <input
                          name='optionValues'
                          value={product.optionValues}
                          onChange={(event) => handleBulkInputChange(index, event)}
                          placeholder='S, M, L, XL'
                        />
                      </label>
                    </div>
                  )}

                  <div className={styles.bulkTags}>
                    <label className={styles.field}>
                      Tags
                      <select
                        onChange={(event) => handleBulkTagSelect(index, event)}
                        defaultValue=''
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value=''>Select a tag</option>
                        {tagsList
                          .filter((tag) => !(product.selectedTags || []).includes(tag))
                          .map((tag) => (
                            <option key={`${product.id}-${tag}`} value={tag}>
                              {tag}
                            </option>
                          ))}
                      </select>
                    </label>
                    {(product.selectedTags || []).length > 0 ? (
                      <div className={styles.tagPills} style={{ marginTop: '12px' }}>
                        {product.selectedTags.map((tag) => (
                          <span key={`${product.id}-${tag}`}>
                            {tag}
                            <button type='button' onClick={() => handleBulkTagRemove(index, tag)}>
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.helperText}>No tags selected yet.</p>
                    )}
                  </div>
                </article>
              )
            })
          )}
        </div>
      </section>

      {bulkPreviewData && (
        <section className={styles.section}>
          <h3>Preview (UI only)</h3>
          <p className={styles.helperText}>
            Once you approve this UI, we will connect it to the backend bulk-import API.
          </p>
          <div className={styles.previewGrid}>
            {bulkPreviewData.map((product, index) => (
              <div key={product.id} className={styles.previewItem}>
                <strong>{product.name || `Product #${index + 1}`}</strong>
                <span className={styles.previewMeta}>{product.category || 'No category'}</span>
                <span className={styles.previewMeta}>Price: ${product.price}</span>
                <span className={styles.previewMeta}>Inventory: {product.inventory}</span>
                <span className={styles.previewMeta}>Variant: {product.variant || 'N/A'}</span>
                <span className={styles.previewMeta}>
                  Tags: {product.tags.length ? product.tags.join(', ') : 'None'}
                </span>
                <span className={styles.previewMeta}>Images: {product.mediaCount}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )

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
          {!isBulkMode ? (
            <Button type='submit' form='add-product-form' variant='primary'>
              Save
            </Button>
          ) : (
            <>
              <Button type='button' variant='ghost' onClick={handleBulkPreview}>
                Preview payload
              </Button>
              <Button type='button' variant='primary' onClick={handleBulkSave}>
                Save products
              </Button>
            </>
          )}
        </div>
      </header>

      <div className={styles.modeToggle}>
        <button
          type='button'
          className={`${styles.modeButton} ${!isBulkMode ? styles.modeButtonActive : ''}`}
          onClick={() => setIsBulkMode(false)}
        >
          Single product
        </button>
        <button
          type='button'
          className={`${styles.modeButton} ${isBulkMode ? styles.modeButtonActive : ''}`}
          onClick={() => setIsBulkMode(true)}
        >
          Add multiple products
        </button>
      </div>

      {isBulkMode ? (
        renderBulkMode()
      ) : (
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
                  className={`${styles.field} ${missingFields.includes('description') ? styles.fieldError : ''
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

              {selectedCategorySlug !== 'wedding-gift-trays' && (
                <div className={styles.fieldRow}>
                  <label
                    className={`${styles.field} ${missingFields.includes('inventory') ? styles.fieldError : ''
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
              )}

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
                      <option key={cat.slug} value={cat.label}>
                        {cat.label}
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
                        {variantOptions.map((v) => (
                          <option key={`${v.category_slug}-${v.variant_name}`} value={v.variant_name}>
                            {v.variant_name}
                          </option>
                        ))}
                        {!hasSelectedVariant && formData.variant && (
                          <option value={formData.variant}>{formData.variant}</option>
                        )}
                      </select>
                      <button
                        type='button'
                        onClick={() => {
                          if (!selectedCategorySlug) {
                            setFormError('Please choose a category before adding a new variant.')
                            return
                          }
                          setShowNewVariantInput(true)
                          setNewVariantName('')
                        }}
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

              {shouldShowSizeSelector ? (
                <div className={styles.fieldRow}>
                  <label className={styles.field}>
                    Sizes
                    <div className={styles.sizeSelector}>
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          type='button'
                          className={`${styles.sizeButton} ${formData.sizes.includes(size) ? styles.sizeButtonActive : ''
                            }`}
                          onClick={() => handleSizeToggle(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
              ) : (
                selectedCategorySlug && (
                  <p className={styles.helperText}>
                    Category “{formData.type}” không sử dụng size nên tuỳ chọn size được ẩn.
                  </p>
                )
              )}
            </section>

            <section className={styles.section}>
              <h3>Images</h3>
              <p className={styles.mediaNote}>
                First image becomes <code>main.webp</code>. Additional images are saved sequentially as{' '}
                <code>main_2.webp</code>, <code>main_3.webp</code>, ...
              </p>
              {(existingMedia.length > 0 || mediaUploads.length > 0) && (
                <div className={styles.mediaGallery}>
                  {existingMedia.length > 0 && (
                    <div>
                      <p className={styles.mediaLabel}>Existing images</p>
                      <div className={styles.mediaThumbGrid}>
                        {existingMedia.map((media) => (
                          <figure key={media.id} className={styles.mediaThumb}>
                            <img src={media.url} alt={media.label} />
                            <figcaption>{media.label}</figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}
                  {mediaUploads.length > 0 && (
                    <div>
                      <p className={styles.mediaLabel}>Pending uploads</p>
                      <div className={styles.mediaThumbGrid}>
                        {mediaUploads.map((media, index) => (
                          <figure key={media.id} className={styles.mediaThumb}>
                            <img src={media.dataUrl} alt={`Upload ${index + 1}`} />
                            <figcaption>
                              {index === 0 ? 'main.webp (cover)' : `main_${index + 1}.webp`}
                            </figcaption>
                            <button
                              type='button'
                              className={styles.mediaRemove}
                              onClick={() => handleRemoveUpload(media.id)}
                              aria-label='Remove image'
                            >
                              <FiX />
                            </button>
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className={styles.mediaUpload}>
                <div>
                  <strong>Upload product imagery</strong>
                  <span>PNG, JPG, WEBP up to 5 MB. You can select multiple files.</span>
                  <div className={styles.uploadActions}>
                    <button type='button' onClick={handleImageBrowse}>
                      <FiUploadCloud />
                      Add Files
                    </button>
                    <span className={styles.fileHint}>
                      {mediaUploads.length ? `${mediaUploads.length} file(s) ready` : 'No new files selected'}
                    </span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  className={styles.hiddenInput}
                  type='file'
                  accept='image/png,image/jpeg,image/webp'
                  multiple
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
      )}
    </div>
  )
}

export default AddProduct





