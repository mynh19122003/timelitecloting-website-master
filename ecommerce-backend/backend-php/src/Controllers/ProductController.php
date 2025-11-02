<?php

namespace App\Controllers;

use App\Models\Product;

class ProductController
{
    private Product $productModel;

    public function __construct()
    {
        $this->productModel = new Product();
    }

    public function getProducts(): void
    {
        try {
            $page = (int) ($_GET['page'] ?? 1);
            $limit = (int) ($_GET['limit'] ?? 10);
            $search = $_GET['search'] ?? '';
            $category = $_GET['category'] ?? '';
            $sortBy = $_GET['sortBy'] ?? 'created_at';
            $sortOrder = $_GET['sortOrder'] ?? 'DESC';
            
            $result = $this->productModel->getAll($page, $limit, $search, $category, $sortBy, $sortOrder);
            
            $this->sendSuccessResponse(200, 'Products retrieved successfully', $result);
        } catch (\Exception $e) {
            error_log('Get products error: ' . $e->getMessage());
            $this->sendErrorResponse(500, 'ERR_GET_PRODUCTS_FAILED', 'Failed to get products');
        }
    }

    public function getProductById(): void
    {
        try {
            // Support both numeric ID and string product_id
            $id = $_GET['id'] ?? '';
            $productId = $_GET['product_id'] ?? '';
            
            if ($productId) {
                // Get by string product_id (e.g., vest-silk-noir)
                $product = $this->productModel->findByProductId($productId);
            } elseif (is_numeric($id) && (int)$id > 0) {
                // Get by numeric ID
                $product = $this->productModel->findById((int)$id);
            } else {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Invalid product ID or product_id');
                return;
            }
            
            $this->sendSuccessResponse(200, 'Product retrieved successfully', $product);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'ERR_PRODUCT_NOT_FOUND') {
                $this->sendErrorResponse(404, 'ERR_PRODUCT_NOT_FOUND', 'Product not found');
            } else {
                error_log('Get product error: ' . $e->getMessage());
                $this->sendErrorResponse(500, 'ERR_GET_PRODUCT_FAILED', 'Failed to get product');
            }
        }
    }

    private function sendSuccessResponse(int $statusCode, string $message, array $data = []): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
    }

    private function sendErrorResponse(int $statusCode, string $error, string $message): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => $error,
            'message' => $message
        ]);
    }
}
