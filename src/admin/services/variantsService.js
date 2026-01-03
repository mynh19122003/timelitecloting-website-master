import { AdminApi } from '../api';
import { invalidateVariantsCache } from '../../services/variantsService';

export const listVariants = async (categorySlug) => {
  try {
    const params = categorySlug ? { category: categorySlug } : undefined;
    const res = await AdminApi.get('/variants', { params });
    return res.data?.data || [];
  } catch (error) {
    console.error('Failed to list variants:', error);
    return [];
  }
};

export const createVariant = async (variantName, categorySlug) => {
  try {
    const res = await AdminApi.post('/variants', { variant_name: variantName, category_slug: categorySlug });
    // Invalidate frontend cache so new variant shows up immediately
    invalidateVariantsCache();
    return res.data?.data || null;
  } catch (error) {
    console.error('Failed to create variant:', error);
    throw error;
  }
};

export default {
  listVariants,
  createVariant
};

