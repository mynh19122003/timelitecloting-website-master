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

    public function getAll(int $page = 1, int $limit = 10, string $search = '', string $category = '', string $sortBy = 'created_at', string $sortOrder = 'DESC'): array
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

            if ($category && strtolower($category) !== 'all') {
                $conditions[] = 'category = ?';
                $searchParams[] = $category;
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

            // Get products with valid columns from schema
            $productsQuery = "
                SELECT 
                    id,
                    products_id,
                    slug,
                    name,
                    category,
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
            // Bind search params first (as strings)
            $paramIndex = 1;
            foreach ($searchParams as $param) {
                $stmt->bindValue($paramIndex++, $param, PDO::PARAM_STR);
            }
            // Bind limit/offset as integers to avoid MySQL errors when emulation is off
            $stmt->bindValue($paramIndex++, (int) $limit, PDO::PARAM_INT);
            $stmt->bindValue($paramIndex++, (int) $offset, PDO::PARAM_INT);
            $stmt->execute();
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Normalize image urls so storefronts can fetch directly
            foreach ($products as &$p) {
                $p['image_url'] = $this->resolveImageUrl($p['image_url'] ?? null, $p['products_id'] ?? null);
            }
            unset($p);

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
            
            $product['image_url'] = $this->resolveImageUrl($product['image_url'] ?? null, $product['products_id'] ?? null);
            return $product;
        } catch (PDOException $e) {
            error_log('Get product by ID error: ' . $e->getMessage());
            throw new \Exception('ERR_GET_PRODUCT_FAILED');
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
    private function resolveImageUrl(?string $raw, ?string $productsId = null): ?string
    {
        if (!$raw) return $raw;
        $url = trim($raw);
        if ($url === '') return $url;
        if (preg_match('/^(https?:)?\/\//i', $url) || str_starts_with($url, 'data:')) {
            return $url;
        }
        if (str_starts_with($url, '/admin/admindata/picture/')) {
            // Build absolute URL using forwarded proto/host if available
            $proto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            return sprintf('%s://%s%s', $proto, $host, $url);
        }
        // Support old format for backward compatibility
        if (str_starts_with($url, '/admin/media/')) {
            // Convert old format to new format
            $newUrl = str_replace('/admin/media/admin/data/picture/', '/admin/admindata/picture/', $url);
            $proto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            return sprintf('%s://%s%s', $proto, $host, $newUrl);
        }
        
        // Extract PID from productsId if available, otherwise try to extract from URL
        $pid = $productsId;
        if (!$pid && preg_match('/^(PID\d+)/i', $url, $matches)) {
            $pid = $matches[1];
        }
        
        // If we have a PID, use the new format: /admin/admindata/picture/<PID>/main.webp
        if ($pid) {
            $fileName = strpos($url, '/') !== false ? basename($url) : 'main.webp';
            $basePath = '/admin/admindata/picture/' . $pid . '/' . $fileName;
            $proto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            return sprintf('%s://%s%s', $proto, $host, $basePath);
        }
        
        // Fallback: use old format for backward compatibility
        $clean = preg_replace('#^/?(admin/media/)?#', '', $url);
        $basePath = '/admin/media/' . $clean;
        $proto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        return sprintf('%s://%s%s%s', $proto, $host, str_starts_with($basePath, '/') ? '' : '/', $basePath);
    }
}
