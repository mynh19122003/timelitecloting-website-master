import { AdminApi } from '../api';

export const listVariants = async () => {
  try {
    const res = await AdminApi.get('/variants');
    return res.data?.data || [];
  } catch (error) {
    console.error('Failed to list variants:', error);
    return [];
  }
};

export const createVariant = async (variantName) => {
  try {
    const res = await AdminApi.post('/variants', { variant_name: variantName });
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

