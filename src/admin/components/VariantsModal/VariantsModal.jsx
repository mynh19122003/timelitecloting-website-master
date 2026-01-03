import React, { useEffect, useState } from 'react';
import { FaTimes, FaPlus, FaSpinner } from 'react-icons/fa';
import Button from '../Button/Button';
import variantsService from '../../services/variantsService';
import productsService from '../../services/productsService';
import styles from './VariantsModal.module.css';

// Fallback categories if API fails
const FALLBACK_CATEGORIES = [
  { name: 'Ao Dai', slug: 'ao-dai' },
  { name: 'Suits', slug: 'suits' },
  { name: 'Bridal & Formal Dresses', slug: 'bridal-formal-dresses' },
  { name: 'Accessories', slug: 'accessories' },
  { name: 'Lunar New Year Décor', slug: 'lunar-new-year-decor' },
  { name: 'Ceremonial Attire', slug: 'ceremonial-attire' },
  { name: 'Uniforms & Teamwear', slug: 'uniforms-teamwear' },
  { name: 'Wedding Gift Trays', slug: 'wedding-gift-trays' },
  { name: 'Kidswear', slug: 'kidswear' },
];

const VariantsModal = ({ onClose, onVariantCreated }) => {
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [newVariantName, setNewVariantName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(FALLBACK_CATEGORIES[0].slug);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load categories and variants from API in parallel
      const [categoriesData, variantsData] = await Promise.all([
        productsService.listCategories().catch(() => []),
        variantsService.listVariants().catch(() => [])
      ]);
      
      console.log('[VariantsModal] API categories:', categoriesData);
      
      // Use API categories if available and valid
      if (categoriesData && categoriesData.length > 0) {
        // Normalize category data structure
        const normalizedCategories = categoriesData
          .map(cat => ({
            name: cat.name || cat.category_name || cat.categories_name || cat.slug || '',
            slug: cat.slug || cat.category_slug || cat.categories_id?.toString() || 
                  (cat.name || cat.category_name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          }))
          .filter(cat => cat.name && cat.slug); // Only keep valid categories
        
        console.log('[VariantsModal] Normalized categories:', normalizedCategories);
        
        if (normalizedCategories.length > 0) {
          setCategories(normalizedCategories);
          setSelectedCategory(normalizedCategories[0].slug);
        } else {
          // Keep fallback categories if normalization resulted in empty list
          console.log('[VariantsModal] Using fallback categories');
          setSelectedCategory(FALLBACK_CATEGORIES[0].slug);
        }
      } else {
        // Keep fallback categories
        console.log('[VariantsModal] No API categories, using fallback');
        setSelectedCategory(FALLBACK_CATEGORIES[0].slug);
      }
      
      setVariants(variantsData || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data, using fallback categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVariant = async (e) => {
    e.preventDefault();
    
    if (!newVariantName.trim()) {
      setError('Please enter a variant name');
      return;
    }
    
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      await variantsService.createVariant(newVariantName.trim(), selectedCategory);
      
      // Clear form
      setNewVariantName('');
      
      // Reload variants
      const updatedVariants = await variantsService.listVariants();
      setVariants(updatedVariants || []);
      
      // Notify parent
      if (onVariantCreated) {
        onVariantCreated();
      }
      
      alert(`Variant "${newVariantName.trim()}" created successfully!`);
    } catch (err) {
      console.error('Failed to create variant:', err);
      setError(err.message || 'Failed to create variant');
    } finally {
      setCreating(false);
    }
  };

  // Group variants by category
  const variantsByCategory = variants.reduce((acc, v) => {
    const cat = v.category_slug || v.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Manage Variants</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.content}>
          {/* Add new variant form */}
          <form className={styles.addForm} onSubmit={handleCreateVariant}>
            <h3>Add New Variant</h3>
            
            <div className={styles.formRow}>
              <label>Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={creating || loading}
              >
                {categories
                  .filter(cat => cat.slug && cat.name)
                  .map((cat, idx) => (
                    <option key={`${cat.slug}-${idx}`} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className={styles.formRow}>
              <label>Variant Name</label>
              <input
                type="text"
                placeholder="e.g. Traditional Ao Dai (Women)"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                disabled={loading || creating}
              />
            </div>
            
            {error && <div className={styles.error}>{error}</div>}
            
            <Button type="submit" variant="primary" disabled={loading || creating}>
              {creating ? (
                <>
                  <FaSpinner className={styles.spin} /> Creating...
                </>
              ) : (
                <>
                  <FaPlus /> Add Variant
                </>
              )}
            </Button>
          </form>

          {/* Existing variants list */}
          <div className={styles.variantsList}>
            <h3>Existing Variants</h3>
            
            {loading ? (
              <div className={styles.loading}>Loading variants...</div>
            ) : Object.keys(variantsByCategory).length === 0 ? (
              <div className={styles.empty}>No variants found</div>
            ) : (
              Object.entries(variantsByCategory).map(([category, categoryVariants]) => (
                <div key={category} className={styles.categoryGroup}>
                  <h4>{category}</h4>
                  <ul>
                    {categoryVariants.map((v, idx) => (
                      <li key={v.id || idx}>{v.variant_name || v.name}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantsModal;
