import React, { useState, useRef, useEffect, useMemo } from 'react'
import { FaCloudUploadAlt, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import JSZip from 'jszip'
import Button from '../../components/Button/Button'
import productsService from '../../services/productsService'
import { listVariants, createVariant } from '../../services/variantsService'
import styles from './BulkProductModal.module.css'

// --- Constants & Helpers (Copied/Adapted from AddProduct.jsx) ---
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

const SIZES = ['XS', 'S', 'M', 'L', 'XL']
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

const sortVariantsByCategory = (variants = []) =>
    [...variants].sort((a, b) => {
        if (a.category_slug === b.category_slug) {
            if (a.sort_order !== b.sort_order) return (a.sort_order || 0) - (b.sort_order || 0)
            return a.variant_name.localeCompare(b.variant_name)
        }
        return a.category_slug.localeCompare(b.category_slug)
    })

const emptyForm = {
    name: '',
    description: '',
    inventory: '',
    color: '',
    variant: '',
    type: '',
    price: '',
    status: 'published',
    tags: '',
    rating: '4.5',
    sizes: []
}

const BulkProductModal = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null)
    const [imageFiles, setImageFiles] = useState([])
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0 })
    const [status, setStatus] = useState('')
    const [results, setResults] = useState(null)

    // Form State
    const [formData, setFormData] = useState(emptyForm)
    const [variantsList, setVariantsList] = useState([])
    const [tagsList, setTagsList] = useState([])
    const [categoriesList, setCategoriesList] = useState(PRIMARY_CATEGORIES)
    const [selectedTags, setSelectedTags] = useState([])
    const [showNewVariantInput, setShowNewVariantInput] = useState(false)
    const [newVariantName, setNewVariantName] = useState('')

    const fileInputRef = useRef(null)

    // --- Effects for Data Loading ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const [variants, tags, cats] = await Promise.all([
                    listVariants(),
                    productsService.getTags(),
                    productsService.getCategories()
                ])
                setVariantsList(sortVariantsByCategory(variants))
                setTagsList(tags)
                // Keep primary categories fixed as per AddProduct logic
                setCategoriesList(PRIMARY_CATEGORIES)
            } catch (err) {
                console.error('Failed to load initial data', err)
            }
        }
        loadData()
    }, [])

    // --- Computed Properties ---
    const selectedCategorySlug = useMemo(() => toCategorySlug(formData.type), [formData.type])

    const filteredVariants = useMemo(() => {
        if (!selectedCategorySlug) return variantsList
        return variantsList.filter((variant) => variant.category_slug === selectedCategorySlug)
    }, [variantsList, selectedCategorySlug])

    const variantOptions = filteredVariants.length ? filteredVariants : variantsList

    const shouldShowSizeSelector = useMemo(() => {
        if (!selectedCategorySlug) return true
        return !SIZELESS_CATEGORY_SLUGS.has(selectedCategorySlug)
    }, [selectedCategorySlug])

    // --- Handlers ---

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const next = { ...prev, [name]: value }
            if (name === 'type') {
                const slug = toCategorySlug(value)

                // Logic for Wedding Gift Trays
                if (slug === 'wedding-gift-trays') {
                    next.variant = 'Rent'
                    next.color = 'Default'
                    next.inventory = '100' // Default inventory for rental items
                    next.sizes = []
                } else if (slug && SIZELESS_CATEGORY_SLUGS.has(slug)) {
                    next.sizes = []
                }
            }
            return next
        })
    }

    const handleSizeToggle = (size) => {
        setFormData(prev => {
            const current = prev.sizes || []
            const next = current.includes(size)
                ? current.filter(s => s !== size)
                : [...current, size]
            return { ...prev, sizes: next }
        })
    }

    const handleTagSelect = (e) => {
        const val = e.target.value
        if (!val) return
        if (!selectedTags.includes(val)) {
            const newTags = [...selectedTags, val]
            setSelectedTags(newTags)
            setFormData(prev => ({ ...prev, tags: JSON.stringify(newTags) }))
        }
        e.target.value = ''
    }

    const handleTagRemove = (tag) => {
        const newTags = selectedTags.filter(t => t !== tag)
        setSelectedTags(newTags)
        setFormData(prev => ({ ...prev, tags: newTags.length ? JSON.stringify(newTags) : '' }))
    }

    const handleFileChange = async (e) => {
        const selected = e.target.files[0]
        if (!selected) return
        setFile(selected)
        setStatus('Reading ZIP file...')
        setResults(null)
        setImageFiles([])

        try {
            const zip = new JSZip()
            const contents = await zip.loadAsync(selected)
            const images = []

            // Iterate through files in ZIP
            for (const filename of Object.keys(contents.files)) {
                const fileData = contents.files[filename]
                if (fileData.dir) continue

                // Check extension
                if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) continue

                // Don't read content yet to save memory, just store reference
                images.push({ filename, fileData })
            }

            if (images.length === 0) {
                setStatus('No valid images found in ZIP.')
                setFile(null)
                return
            }

            setImageFiles(images)
            setStatus(`Ready to upload ${images.length} products from ZIP.`)
        } catch (err) {
            console.error(err)
            setStatus('Failed to read ZIP file: ' + err.message)
            setFile(null)
        }
    }

    const handleUpload = async () => {
        if (!imageFiles.length) return

        // Validation
        if (!formData.name || !formData.price) {
            alert('Please fill in at least Name and Price.')
            return
        }

        setUploading(true)
        setProgress({ current: 0, total: imageFiles.length })
        setStatus('Preparing products...')
        setResults(null)

        try {
            const productsToUpload = []

            for (let i = 0; i < imageFiles.length; i++) {
                const { filename, fileData } = imageFiles[i]

                // Get base64
                const base64 = await fileData.async('base64')
                const mime = filename.toLowerCase().endsWith('.png') ? 'image/png' :
                    filename.toLowerCase().endsWith('.webp') ? 'image/webp' :
                        filename.toLowerCase().endsWith('.gif') ? 'image/gif' : 'image/jpeg'
                const dataUrl = `data:${mime};base64,${base64}`

                // Auto-increment name: "Name", "Name 2", "Name 3"...
                const productName = i === 0 ? formData.name : `${formData.name} ${i + 1}`

                const payload = {
                    name: productName,
                    description: formData.description,
                    price: formData.price,
                    inventory: formData.inventory,
                    color: formData.color,
                    category: formData.type, // Map 'type' to 'category'
                    variant: formData.variant,
                    rating: formData.rating,
                    status: formData.status,
                    sizes: formData.sizes,
                    tags: formData.tags,
                    imagePreview: dataUrl,
                    mediaUploads: []
                }

                // Log missing fields check
                const missing = []
                if (!payload.name) missing.push('name')
                if (!payload.price) missing.push('price')
                if (!payload.category) missing.push('category')

                if (missing.length > 0) {
                    console.warn(`[BulkUpload] Product ${filename} missing fields:`, missing)
                }

                productsToUpload.push(payload)
            }

            setStatus(`Uploading ${productsToUpload.length} products...`)

            // Call bulk API
            const result = await productsService.bulkCreateProducts(productsToUpload, (progressEvent) => {
                setProgress({
                    current: progressEvent.processed,
                    total: progressEvent.total
                })
                setStatus(`Uploading chunk ${progressEvent.currentChunk}/${progressEvent.totalChunks}...`)
            })

            setResults({
                success: result.success || [],
                errors: result.errors || []
            })

            if (onSuccess) onSuccess()

        } catch (err) {
            console.error('Bulk upload failed', err)
            setResults({
                success: [],
                errors: [{ name: 'Batch Upload', error: err.message }]
            })
        } finally {
            setUploading(false)
            setStatus('Upload complete!')
        }
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>Upload Multi Products</h3>
                    <button onClick={onClose} className={styles.closeBtn}><FaTimes /></button>
                </div>

                <div className={styles.body}>
                    {!results ? (
                        <div className={styles.formContainer}>
                            {/* Left: File Upload */}
                            <div className={styles.uploadSection}>
                                <div className={styles.dropzone} onClick={() => fileInputRef.current?.click()}>
                                    <FaCloudUploadAlt size={40} />
                                    <p>{file ? file.name : 'Click to select ZIP file'}</p>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".zip"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                {imageFiles.length > 0 && (
                                    <div className={styles.fileInfo}>
                                        <p>Found {imageFiles.length} images</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Common Data Form */}
                            <div className={styles.fieldsSection}>
                                <h4>Common Attributes</h4>

                                <div className={styles.row}>
                                    <div className={styles.field}>
                                        <label>Product Name</label>
                                        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Summer T-Shirt" />
                                    </div>
                                    <div className={styles.field}>
                                        <label>{selectedCategorySlug === 'wedding-gift-trays' ? 'Rental Price ($)' : 'Price ($)'}</label>
                                        <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="0.00" />
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.field}>
                                        <label>Category</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange}>
                                            <option value="">Select Category</option>
                                            {categoriesList.map(c => (
                                                <option key={c.slug} value={c.label}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.field}>
                                        <label>Status</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange}>
                                            <option value="published">Published</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                    </div>
                                </div>

                                {selectedCategorySlug !== 'wedding-gift-trays' && (
                                    <div className={styles.row}>
                                        <div className={styles.field}>
                                            <label>Color</label>
                                            <input name="color" value={formData.color} onChange={handleInputChange} placeholder="e.g. Blue" />
                                        </div>
                                        <div className={styles.field}>
                                            <label>Inventory</label>
                                            <input name="inventory" type="number" value={formData.inventory} onChange={handleInputChange} placeholder="0" />
                                        </div>
                                    </div>
                                )}

                                <div className={styles.row}>
                                    {selectedCategorySlug !== 'wedding-gift-trays' && (
                                        <div className={styles.field}>
                                            <label>Variant</label>
                                            <select name="variant" value={formData.variant} onChange={handleInputChange}>
                                                <option value="">Select Variant</option>
                                                {variantOptions.map(v => (
                                                    <option key={v.id} value={v.variant_name}>{v.variant_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className={styles.field}>
                                        <label>Rating</label>
                                        <input name="rating" type="number" step="0.1" value={formData.rating} onChange={handleInputChange} />
                                    </div>
                                </div>

                                {shouldShowSizeSelector && (
                                    <div className={styles.field}>
                                        <label>Sizes</label>
                                        <div className={styles.sizes}>
                                            {SIZES.map(size => (
                                                <label key={size} className={styles.sizeLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.sizes.includes(size)}
                                                        onChange={() => handleSizeToggle(size)}
                                                    />
                                                    {size}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={styles.field}>
                                    <label>Tags</label>
                                    <select onChange={handleTagSelect} value="">
                                        <option value="">Add Tag...</option>
                                        {tagsList.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <div className={styles.tagsList}>
                                        {selectedTags.map(tag => (
                                            <span key={tag} className={styles.tag}>
                                                {tag} <button onClick={() => handleTagRemove(tag)}>&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.field}>
                                    <label>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className={styles.results}>
                            <div className={styles.resultSummary}>
                                <div className={styles.successCount}>
                                    <FaCheckCircle color="green" /> {results.success.length} Success
                                </div>
                                <div className={styles.errorCount}>
                                    <FaExclamationTriangle color="red" /> {results.errors.length} Errors
                                </div>
                            </div>
                            {results.errors.length > 0 && (
                                <div className={styles.errorList}>
                                    <h4>Errors:</h4>
                                    <ul>
                                        {results.errors.map((err, idx) => (
                                            <li key={idx}><strong>{err.name}:</strong> {err.error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {uploading && (
                        <div className={styles.progressOverlay}>
                            <FaSpinner className={styles.spin} size={40} />
                            <h3>{status}</h3>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                ></div>
                            </div>
                            <p>{progress.current} / {progress.total}</p>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    {!results && !uploading && (
                        <Button
                            variant="primary"
                            onClick={handleUpload}
                            disabled={!imageFiles.length || !formData.name}
                        >
                            Start Upload
                        </Button>
                    )}
                    {(results || !uploading) && (
                        <Button variant="ghost" onClick={onClose}>Close</Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BulkProductModal
