<?php

namespace App\Models;

use App\Config\Database;
use PDO;
use PDOException;

class Product
{
    private PDO $db;

    /**
     * Maps normalized category filters (slugs or keywords) to database labels.
     */
    private const CATEGORY_SYNONYMS = [
        // Ao Dai capsule
        'ao-dai' => ['Ao Dai', 'Ao Dai Couture', 'Ceremonial Attire'],
        'ao-dai-couture' => ['Ao Dai', 'Ao Dai Couture'],

        // Suiting / Suits
        'suiting' => ['Suiting', 'Tailored Suiting', 'Suits', 'Uniforms & Teamwear'],
        'tailored-suiting' => ['Suiting', 'Tailored Suiting', 'Suits'],
        'vest' => ['Suiting', 'Tailored Suiting', 'Suits', 'Uniforms & Teamwear'],
        'suits' => ['Suits', 'Suiting', 'Tailored Suiting'],
        'uniforms-teamwear' => ['Uniforms & Teamwear'],

        // Bridal & formal
        'bridal' => ['Bridal', 'Bridal Gowns', 'Bridal & Formal Dresses'],
        'bridal-gowns' => ['Bridal', 'Bridal Gowns', 'Bridal & Formal Dresses'],
        'wedding' => ['Bridal', 'Bridal Gowns', 'Bridal & Formal Dresses'],
        'bridal-formal-dresses' => ['Bridal & Formal Dresses', 'Bridal Gowns'],

        // Evening
        'evening' => ['Evening', 'Evening Couture', 'Evening Dresses'],
        'evening-couture' => ['Evening', 'Evening Couture', 'Evening Dresses'],

        // Accessories / Conical hats
        'conical-hats' => ['Conical Hats', 'Accessories'],
        'non-la' => ['Conical Hats', 'Accessories'],
        'accessories' => ['Accessories', 'Conical Hats'],

        // Kids
        'kidswear' => ['Kidswear'],

        // Gift / Lunar New Year décor
        'gift-procession-sets' => ['Gift Procession Sets', 'Gift Procession', 'Lunar New Year Décor'],
        'gift-procession' => ['Gift Procession Sets', 'Gift Procession', 'Lunar New Year Décor'],
        'gift' => ['Gift Procession Sets', 'Gift Procession', 'Lunar New Year Décor'],
        'lunar-new-year-decor' => ['Lunar New Year Décor', 'Lunar New Year Decor', 'Gift Procession Sets'],

        // Ceremonial
        'ceremonial-attire' => ['Ceremonial Attire', 'Ao Dai'],

        // Shop all
        'all' => [],
        'shop-all' => [],
    ];
    
    /**
     * Maps normalized variant filters (slugs or keywords) to possible database values.
     */
    private const VARIANT_SYNONYMS = [
        'classic' => ['Classic', 'Cổ Điển', 'Co Dien'],
        'co-dien' => ['Classic', 'Cổ Điển', 'Co Dien'],
        'modern' => ['Modern', 'Modern Cut'],
        'modern-cut' => ['Modern Cut', 'Modern'],
        'minimal' => ['Minimal'],
        'layered' => ['Layered'],
        'daily-wear' => ['Daily Wear', 'Dailywear'],
        'engagement' => ['Engagement'],
        'ceremony' => ['Ceremony'],
        'wedding-ao-dai' => ['Wedding Ao Dai'],
        'mix-match' => ['Mix & Match', 'Mix and Match'],
        'mix-and-match' => ['Mix & Match', 'Mix and Match'],
        'best-sellers' => ['Best Sellers'],
        'new-arrivals' => ['New Arrivals', 'New Ao Dai'],
    ];

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function getAll(int $page = 1, int $limit = 10, string $search = '', string $category = '', string $variant = '', string $sortBy = 'created_at', string $sortOrder = 'DESC'): array
    {
        try {
            $offset = ($page - 1) * $limit;
            
            // Build search and filter conditions
            $conditions = [];
            $searchParams = [];
            
            if ($search) {
                $conditions[] = 'name LIKE ?';
                $searchParams[] = "%{$search}%";
            }
            if ($category) {
                $categoryFilters = $this->resolveCategoryFilter($category);
                $this->applyFilterCondition('category', $categoryFilters, $conditions, $searchParams);
            }
            if ($variant) {
                $variantFilters = $this->resolveVariantFilter($variant);
                $this->applyFilterCondition('variant', $variantFilters, $conditions, $searchParams);
            }

            $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

            // Validate sortBy
            $allowedSortFields = ['name', 'price', 'created_at'];
            if (!in_array($sortBy, $allowedSortFields)) {
                $sortBy = 'created_at';
            }

            // Validate sortOrder
            $allowedSortOrders = ['ASC', 'DESC'];
            if (!in_array(strtoupper($sortOrder), $allowedSortOrders)) {
                $sortOrder = 'DESC';
            }

            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM products {$whereClause}";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute($searchParams);
            $total = $countStmt->fetch()['total'];

            // Get products with all fields
            $productsQuery = "
                SELECT 
                    id,
                    products_id,
                    slug,
                    name,
                    category,
                    variant,
                    short_description,
                    description,
                    price,
                    original_price,
                    stock,
                    colors,
                    sizes,
                    image_url,
                    gallery,
                    rating,
                    reviews,
                    tags,
                    is_featured,
                    is_new,
                    created_at
                FROM products 
                {$whereClause}
                ORDER BY {$sortBy} {$sortOrder}
                LIMIT ? OFFSET ?
            ";
            
            $stmt = $this->db->prepare($productsQuery);
            $stmt->execute([...$searchParams, $limit, $offset]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Decode JSON fields and normalize types
            $products = array_map(function (array $row) {
                $row['price'] = isset($row['price']) ? (float)$row['price'] : null;
                $row['original_price'] = isset($row['original_price']) ? (float)$row['original_price'] : null;
                $row['colors'] = isset($row['colors']) ? self::decodeJsonArray($row['colors']) : [];
                $row['sizes'] = isset($row['sizes']) ? self::decodeJsonArray($row['sizes']) : [];
                $row['gallery'] = isset($row['gallery']) ? self::decodeJsonArray($row['gallery']) : [];
                $row['tags'] = isset($row['tags']) ? self::decodeJsonArray($row['tags']) : [];
                $row['rating'] = isset($row['rating']) ? (float)$row['rating'] : null;
                $row['reviews'] = isset($row['reviews']) ? (int)$row['reviews'] : null;
                $row['is_featured'] = isset($row['is_featured']) ? (bool)$row['is_featured'] : false;
                $row['is_new'] = isset($row['is_new']) ? (bool)$row['is_new'] : false;
                return $row;
            }, $rows);

            return [
                'products' => $products,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int) $total,
                    'totalPages' => (int) ceil($total / $limit)
                ]
            ];
        } catch (PDOException $e) {
            error_log('Get products error: ' . $e->getMessage());
            throw new \Exception('ERR_GET_PRODUCTS_FAILED');
        }
    }

    public function findById(int $productId): array
    {
        try {
            $stmt = $this->db->prepare('
                SELECT 
                    id,
                    products_id,
                    slug,
                    name,
                    category,
                    variant,
                    short_description,
                    description,
                    price,
                    original_price,
                    stock,
                    colors,
                    sizes,
                    image_url,
                    gallery,
                    rating,
                    reviews,
                    tags,
                    is_featured,
                    is_new,
                    created_at
                FROM products 
                WHERE id = ?
            ');
            $stmt->execute([$productId]);
            
            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$product) {
                throw new \Exception('ERR_PRODUCT_NOT_FOUND');
            }
            $product['price'] = isset($product['price']) ? (float)$product['price'] : null;
            $product['original_price'] = isset($product['original_price']) ? (float)$product['original_price'] : null;
            $product['colors'] = isset($product['colors']) ? self::decodeJsonArray($product['colors']) : [];
            $product['sizes'] = isset($product['sizes']) ? self::decodeJsonArray($product['sizes']) : [];
            $product['gallery'] = isset($product['gallery']) ? self::decodeJsonArray($product['gallery']) : [];
            $product['tags'] = isset($product['tags']) ? self::decodeJsonArray($product['tags']) : [];
            $product['rating'] = isset($product['rating']) ? (float)$product['rating'] : null;
            $product['reviews'] = isset($product['reviews']) ? (int)$product['reviews'] : null;
            $product['is_featured'] = isset($product['is_featured']) ? (bool)$product['is_featured'] : false;
            $product['is_new'] = isset($product['is_new']) ? (bool)$product['is_new'] : false;

            return $product;
        } catch (PDOException $e) {
            error_log('Get product by ID error: ' . $e->getMessage());
            throw new \Exception('ERR_GET_PRODUCT_FAILED');
        }
    }

    public function findByProductId(string $slug): array
    {
        try {
            // Use exact match for products_id (case-sensitive for exact PID matching)
            $stmt = $this->db->prepare('
                SELECT 
                    id,
                    products_id,
                    slug,
                    name,
                    category,
                    variant,
                    short_description,
                    description,
                    price,
                    original_price,
                    stock,
                    colors,
                    sizes,
                    image_url,
                    gallery,
                    rating,
                    reviews,
                    tags,
                    is_featured,
                    is_new,
                    created_at
                FROM products 
                WHERE products_id = ?
                LIMIT 1
            ');
            $stmt->execute([$slug]);

            $product = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$product) {
                throw new \Exception('ERR_PRODUCT_NOT_FOUND');
            }

            $product['price'] = isset($product['price']) ? (float)$product['price'] : null;
            $product['original_price'] = isset($product['original_price']) ? (float)$product['original_price'] : null;
            $product['colors'] = isset($product['colors']) ? self::decodeJsonArray($product['colors']) : [];
            $product['sizes'] = isset($product['sizes']) ? self::decodeJsonArray($product['sizes']) : [];
            $product['gallery'] = isset($product['gallery']) ? self::decodeJsonArray($product['gallery']) : [];
            $product['tags'] = isset($product['tags']) ? self::decodeJsonArray($product['tags']) : [];
            $product['rating'] = isset($product['rating']) ? (float)$product['rating'] : null;
            $product['reviews'] = isset($product['reviews']) ? (int)$product['reviews'] : null;
            $product['is_featured'] = isset($product['is_featured']) ? (bool)$product['is_featured'] : false;
            $product['is_new'] = isset($product['is_new']) ? (bool)$product['is_new'] : false;

            return $product;
        } catch (PDOException $e) {
            error_log('Get product by slug error: ' . $e->getMessage());
            throw new \Exception('ERR_GET_PRODUCT_FAILED');
        }
    }

    private static function decodeJsonArray($value): array
    {
        if (is_array($value)) return $value;
        if ($value === null || $value === '') return [];
        try {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        } catch (\Throwable $e) {
            return [];
        }
    }
    
    private function resolveCategoryFilter(string $category): array
    {
        $normalized = $this->normalizeFilterKey($category);
        if ($normalized === '' || $normalized === 'all' || $normalized === 'shop-all') {
            return [];
        }
        
        if (isset(self::CATEGORY_SYNONYMS[$normalized])) {
            return $this->deduplicateValues(self::CATEGORY_SYNONYMS[$normalized]);
        }
        
        // Direct match fallback (case-insensitive)
        return [$category];
    }
    
    private function resolveVariantFilter(string $variant): array
    {
        $normalized = $this->normalizeFilterKey($variant);
        if ($normalized === '') {
            return [];
        }
        
        if (isset(self::VARIANT_SYNONYMS[$normalized])) {
            return $this->deduplicateValues(self::VARIANT_SYNONYMS[$normalized]);
        }
        
        return [$variant];
    }
    
    private function applyFilterCondition(string $column, array $values, array &$conditions, array &$params): void
    {
        $values = $this->deduplicateValues($values);
        if (empty($values)) {
            return;
        }
        
        if (count($values) === 1) {
            $conditions[] = "{$column} = ?";
            $params[] = $values[0];
            return;
        }
        
        $placeholders = implode(', ', array_fill(0, count($values), '?'));
        $conditions[] = "{$column} IN ({$placeholders})";
        foreach ($values as $value) {
            $params[] = $value;
        }
    }
    
    private function normalizeFilterKey(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return '';
        }
        
        $transliterated = @iconv('UTF-8', 'ASCII//TRANSLIT', $value);
        if ($transliterated !== false) {
            $value = $transliterated;
        }
        
        $value = strtolower($value);
        $value = preg_replace('/[^a-z0-9]+/u', '-', $value);
        return trim($value ?? '', '-');
    }
    
    private function deduplicateValues(array $values): array
    {
        $unique = [];
        foreach ($values as $value) {
            $value = trim((string)$value);
            if ($value === '') {
                continue;
            }
            if (!in_array($value, $unique, true)) {
                $unique[] = $value;
            }
        }
        return $unique;
    }

    public function checkStock(int $productId, int $quantity): bool
    {
        try {
            $stmt = $this->db->prepare('SELECT stock FROM products WHERE id = ?');
            $stmt->execute([$productId]);
            
            $product = $stmt->fetch();
            if (!$product) {
                throw new \Exception('ERR_PRODUCT_NOT_FOUND');
            }

            if ($product['stock'] < $quantity) {
                throw new \Exception('ERR_INSUFFICIENT_STOCK');
            }

            return true;
        } catch (PDOException $e) {
            throw new \Exception('ERR_CHECK_STOCK_FAILED');
        }
    }

    public function updateStock(int $productId, int $quantity): bool
    {
        try {
            $stmt = $this->db->prepare(
                'UPDATE products SET stock = stock - ? WHERE id = ?'
            );
            return $stmt->execute([$quantity, $productId]);
        } catch (PDOException $e) {
            throw new \Exception('ERR_UPDATE_STOCK_FAILED');
        }
    }

    /**
     * Get all unique tags from all products
     * @return array Array of unique tag strings
     */
    public function getAllTags(): array
    {
        try {
            $stmt = $this->db->query('SELECT tags FROM products WHERE tags IS NOT NULL AND tags != "null" AND tags != ""');
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $allTags = [];
            foreach ($rows as $row) {
                $tags = self::decodeJsonArray($row['tags']);
                if (is_array($tags)) {
                    foreach ($tags as $tag) {
                        if (is_string($tag) && trim($tag) !== '') {
                            $allTags[] = trim($tag);
                        }
                    }
                }
            }
            
            // Remove duplicates and sort
            $uniqueTags = array_unique($allTags);
            sort($uniqueTags);
            
            return array_values($uniqueTags);
        } catch (PDOException $e) {
            error_log('Get tags error: ' . $e->getMessage());
            throw new \Exception('ERR_GET_TAGS_FAILED');
        }
    }

    // JSON parsing no longer required with minimal schema
}