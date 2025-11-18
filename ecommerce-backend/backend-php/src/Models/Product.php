<?php

namespace App\Models;

use App\Config\Database;
use PDO;
use PDOException;

class Product
{
    private PDO $db;

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
                $conditions[] = 'category = ?';
                $searchParams[] = $category;
            }
            if ($variant) {
                $conditions[] = 'variant = ?';
                $searchParams[] = $variant;
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
                WHERE slug = ?
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

    // JSON parsing no longer required with minimal schema
}

            throw new \Exception('ERR_UPDATE_STOCK_FAILED');
        }
    }

    // JSON parsing no longer required with minimal schema
}

            throw new \Exception('ERR_UPDATE_STOCK_FAILED');
        }
    }

    // JSON parsing no longer required with minimal schema
}

            throw new \Exception('ERR_UPDATE_STOCK_FAILED');
        }
    }

    // JSON parsing no longer required with minimal schema
}
