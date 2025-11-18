#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const DEFAULT_ADMIN_BASE = process.env.ADMIN_BASE_URL || 'http://localhost:3001';
const DEFAULT_ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || 'changeme-admin-token';

const PROJECT_ROOT = process.cwd();

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseArgs = (argv) => {
  const positional = [];
  const options = {};
  argv.forEach((arg) => {
    if (!arg.startsWith('--')) {
      positional.push(arg);
      return;
    }
    const [key, value = true] = arg.replace(/^--/, '').split('=');
    const normalizedKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    options[normalizedKey] = value === true ? true : value;
  });
  return { positional, options };
};

const formatError = (err) => {
  if (err.response) {
    return `${err.response.status} ${err.response.statusText}: ${JSON.stringify(err.response.data)}`;
  }
  if (err.request) {
    return `No response: ${err.message}`;
  }
  return err.message;
};

const toDataUri = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_MAP[ext] || 'image/jpeg';
  return `data:${mime};base64,${buffer.toString('base64')}`;
};

const ensureAbsolute = (maybeRelative) =>
  path.isAbsolute(maybeRelative) ? maybeRelative : path.join(process.cwd(), maybeRelative);

const buildPayloadFromProduct = async (product) => {
  const sourceField = product.source_image || product.sourceImage || '';
  const normalizedSource = path.isAbsolute(sourceField)
    ? sourceField
    : path.resolve(PROJECT_ROOT, sourceField);
  const imageData = await toDataUri(normalizedSource);

  return {
    products_id: product.products_id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    short_description: product.short_description,
    description: product.description,
    price: product.price,
    original_price: product.original_price,
    stock: product.stock,
    colors: product.colors,
    sizes: product.sizes,
    tags: product.tags,
    rating: product.rating,
    reviews: product.reviews,
    is_featured: product.is_featured ? 1 : 0,
    is_new: product.is_new ? 1 : 0,
    image_url: imageData,
    gallery: product.gallery || [],
  };
};

const getProduct = async (client, productsId) => {
  try {
    const res = await client.get(`/admin/products/${encodeURIComponent(productsId)}`);
    return res.data?.data || res.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
};

const withAuthHeaders = (token) => {
  if (!token) throw new Error('Missing admin token');
  return {
    Authorization: `Bearer ${token}`,
    'X-Admin-Token': token,
  };
};

const createProduct = async (client, token, payload) => {
  await client.post(
    '/admin/products',
    payload,
    {
      headers: {
        ...withAuthHeaders(token),
      },
    }
  );
};

const updateProduct = async (client, token, productsId, payload) => {
  await client.patch(
    `/admin/products/${encodeURIComponent(productsId)}`,
    payload,
    {
      headers: {
        ...withAuthHeaders(token),
      },
    }
  );
};

const main = async () => {
  const { positional, options } = parseArgs(process.argv.slice(2));
  if (positional.length === 0) {
    console.error('Usage: node scripts/import-products-from-manifest.mjs <manifestPath> [--admin-base=URL] [--token=TOKEN] [--force]');
    process.exit(1);
  }

  const manifestPath = ensureAbsolute(positional[0]);
  const adminBase = (options.adminBase || DEFAULT_ADMIN_BASE).replace(/\/+$/, '');
  const adminToken = options.token || DEFAULT_ADMIN_TOKEN;
  const forceUpdate = Boolean(options.force);
  const dryRun = Boolean(options.dryRun);

  const rawManifest = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(rawManifest);
  if (!Array.isArray(manifest.products) || manifest.products.length === 0) {
    console.error('Manifest missing products array.');
    process.exit(1);
  }

  const client = axios.create({
    baseURL: adminBase,
    timeout: 30_000,
  });

  const summary = {
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  for (const product of manifest.products) {
    try {
      const payload = await buildPayloadFromProduct(product);
      if (dryRun) {
        console.log(`[DRY-RUN] ${product.products_id} prepared`);
        summary.skipped += 1;
        continue;
      }

      const existing = await getProduct(client, product.products_id);
      if (existing && !forceUpdate) {
        console.log(`[SKIP] ${product.products_id} already exists (use --force to update)`);
        summary.skipped += 1;
        continue;
      }

      if (existing) {
        await updateProduct(client, adminToken, product.products_id, payload);
        console.log(`[UPDATE] ${product.products_id}`);
        summary.updated += 1;
      } else {
        await createProduct(client, adminToken, payload);
        console.log(`[CREATE] ${product.products_id}`);
        summary.created += 1;
      }

      // Small delay to avoid overwhelming backend
      await sleep(250);
    } catch (err) {
      summary.failed += 1;
      console.error(`[ERROR] ${product.products_id}: ${formatError(err)}`);
    }
  }

  console.log('Done:', summary);
};

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});

