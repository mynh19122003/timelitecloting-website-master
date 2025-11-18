#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'push-api', 'config', 'folder-presets.json');
const ASSET_ROOT = path.join(ROOT, 'push-api');
const OUTPUT_DIR = path.join(ASSET_ROOT, 'manifests');
const VALID_EXT = /\.(jpe?g|png|webp)$/i;

/**
 * Format numeric index with leading zeros.
 * @param {number} value
 * @param {number} size
 */
const pad = (value, size = 3) => value.toString().padStart(size, '0');

/**
 * Build PID-style identifier.
 * @param {number} base
 * @param {number} offset
 */
const buildProductId = (base, offset) => `PID${(base + offset).toString().padStart(5, '0')}`;

/**
 * Normalize Windows path to POSIX for manifest output.
 * @param {string} input
 */
const toPosix = (input) => input.split(path.sep).join('/');

async function loadConfig() {
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function listAssets(folderName) {
  const folderPath = path.join(ASSET_ROOT, folderName);
  const entries = await fs.readdir(folderPath);
  return entries
    .filter((name) => VALID_EXT.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

function buildProductRecord({ filename, sequence, idx, folderName, preset }) {
  const sequenceLabel = pad(sequence);
  const productsId = buildProductId(preset.productIdStart, idx);
  const slug = `${preset.slugPrefix}-${sequenceLabel}`;
  const name = `${preset.namePrefix} ${sequenceLabel}`;
  const sourceRelative = toPosix(path.join('push-api', folderName, filename));
  const plannedOutput = toPosix(path.join(preset.asset_plan.output_root, productsId, preset.asset_plan.main_name));

  return {
    products_id: productsId,
    slug,
    name,
    category: preset.category,
    variant: preset.variant,
    short_description: preset.short_description,
    description: preset.description,
    price: preset.price,
    original_price: preset.original_price,
    stock: preset.stock,
    colors: preset.colors,
    sizes: preset.sizes,
    image_url: `${productsId}/${preset.asset_plan.main_name}`,
    gallery: preset.asset_plan.gallery ?? [],
    rating: preset.rating,
    reviews: preset.reviews,
    tags: preset.tags,
    is_featured: !!preset.is_featured,
    is_new: !!preset.is_new,
    source_image: sourceRelative,
    planned_output: plannedOutput
  };
}

async function generateManifest(folderName, preset) {
  const files = await listAssets(folderName);
  const products = files.map((filename, index) =>
    buildProductRecord({
      filename,
      sequence: preset.sequenceStart + index,
      idx: index,
      folderName,
      preset
    })
  );

  return {
    folder: folderName,
    generated_at: new Date().toISOString(),
    total_assets: files.length,
    config_snapshot: {
      category: preset.category,
      variant: preset.variant,
      namePrefix: preset.namePrefix,
      slugPrefix: preset.slugPrefix,
      productIdStart: preset.productIdStart,
      sequenceStart: preset.sequenceStart,
      asset_plan: preset.asset_plan
    },
    products
  };
}

async function main() {
  const config = await loadConfig();
  await ensureDir(OUTPUT_DIR);

  const positionalArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  const folderFilter = positionalArgs[0];
  const manifestPaths = [];

  for (const [folderName, preset] of Object.entries(config)) {
    if (folderFilter && folderName !== folderFilter) continue;
    if (!preset.enabled) continue;

    const manifest = await generateManifest(folderName, preset);
    const outputPath = path.join(OUTPUT_DIR, `${folderName}.manifest.json`);
    await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
    manifestPaths.push({ folder: folderName, outputPath });
  }

  if (manifestPaths.length === 0) {
    console.warn('No manifests generated. Check folder name filter or enable presets.');
    return;
  }

  console.log('Generated manifests:');
  manifestPaths.forEach(({ folder, outputPath }) => {
    console.log(`- ${folder}: ${path.relative(ROOT, outputPath)}`);
  });
}

main().catch((error) => {
  console.error('Failed to generate manifest:', error);
  process.exitCode = 1;
});

