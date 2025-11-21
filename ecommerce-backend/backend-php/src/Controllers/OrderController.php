<?php

namespace App\Controllers;

use App\Services\OrderService;
use App\Middleware\AuthMiddleware;

class OrderController
{
    private OrderService $orderService;

    public function __construct()
    {
        $this->orderService = new OrderService();
    }

    public function createOrder(): void
    {
        try {
            error_log('[OrderController] createOrder called');
            $user = AuthMiddleware::authenticate();
            error_log('[OrderController] User authenticated: ' . json_encode(['userId' => $user['userId'] ?? 'unknown']));
            
            $rawInput = file_get_contents('php://input');
            error_log('[OrderController] Raw input: ' . $rawInput);
            $input = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('[OrderController] JSON decode error: ' . json_last_error_msg());
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Invalid JSON in request body: ' . json_last_error_msg());
                return;
            }
            
            error_log('[OrderController] Parsed input: ' . json_encode($input));
            
            if (!isset($input['items']) || !is_array($input['items']) || empty($input['items'])) {
                error_log('[OrderController] Validation failed: items array is required');
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Items array is required and must not be empty');
                return;
            }

            // Validate items - support product_id, products_id, or product_slug
            foreach ($input['items'] as $item) {
                // Check if item has at least one product identifier
                $hasProductId = isset($item['product_id']);
                $hasProductsId = isset($item['products_id']);
                $hasProductSlug = isset($item['product_slug']);
                
                if (!$hasProductId && !$hasProductsId && !$hasProductSlug) {
                    $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Each item must have product_id, products_id, or product_slug');
                    return;
                }
                
                if (!isset($item['quantity'])) {
                    $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Each item must have quantity');
                    return;
                }

                // quantity must be numeric
                if (!is_numeric($item['quantity'])) {
                    $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'quantity must be numeric');
                    return;
                }

                if ($item['quantity'] <= 0) {
                    $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Quantity must be greater than 0');
                    return;
                }
            }

            // Extract order details - support both old format (customer_info, shipping_address) and new format (firstname, lastname, address, phonenumber)
            $orderDetails = [
                'firstname' => $input['firstname'] ?? null,
                'lastname' => $input['lastname'] ?? null,
                'address' => $input['address'] ?? null,
                'phonenumber' => $input['phonenumber'] ?? null,
                'customer_info' => $input['customer_info'] ?? null,
                'shipping_address' => $input['shipping_address'] ?? null,
                'notes' => $input['notes'] ?? null,
                'total_amount' => $input['total_amount'] ?? null,
                'payment_method' => $input['payment_method'] ?? null
            ];

            error_log('[OrderController] Calling orderService->createOrder with userId: ' . $user['userId']);
            error_log('[OrderController] Items: ' . json_encode($input['items']));
            error_log('[OrderController] Order details: ' . json_encode($orderDetails));
            
            $order = $this->orderService->createOrder($user['userId'], $input['items'], $orderDetails);
            
            error_log('[OrderController] Order created successfully: ' . json_encode($order));
            $this->sendSuccessResponse(201, 'Order created successfully', $order);
        } catch (\Exception $e) {
            error_log('[OrderController] Exception caught: ' . $e->getMessage());
            error_log('[OrderController] Exception trace: ' . $e->getTraceAsString());
            
            if ($e->getMessage() === 'ERR_PRODUCT_NOT_FOUND') {
                $this->sendErrorResponse(404, 'ERR_PRODUCT_NOT_FOUND', 'One or more products not found');
            } elseif ($e->getMessage() === 'ERR_INSUFFICIENT_STOCK') {
                $this->sendErrorResponse(400, 'ERR_INSUFFICIENT_STOCK', 'Insufficient stock for one or more products');
            } elseif ($e->getMessage() === 'ERR_VALIDATION_FAILED') {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Validation failed: ' . $e->getMessage());
            } else {
                error_log('[OrderController] Unexpected error: ' . $e->getMessage());
                $this->sendErrorResponse(500, 'ERR_CREATE_ORDER_FAILED', 'Failed to create order: ' . $e->getMessage());
            }
        }
    }

    public function getOrderHistory(): void
    {
        try {
            $user = AuthMiddleware::authenticate();
            $page = (int) ($_GET['page'] ?? 1);
            $limit = (int) ($_GET['limit'] ?? 10);
            
            $result = $this->orderService->getOrderHistory($user['userId'], $page, $limit);
            
            $this->sendSuccessResponse(200, 'Order history retrieved successfully', $result);
        } catch (\Exception $e) {
            $this->sendErrorResponse(500, 'ERR_GET_ORDER_HISTORY_FAILED', 'Failed to get order history');
        }
    }

    public function getOrderById(): void
    {
        try {
            $user = AuthMiddleware::authenticate();
            $id = (int) ($_GET['id'] ?? 0);
            
            if ($id <= 0) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Invalid order ID');
                return;
            }
            
            $order = $this->orderService->getOrderById($id, $user['userId']);
            
            $this->sendSuccessResponse(200, 'Order retrieved successfully', $order);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'ERR_ORDER_NOT_FOUND') {
                $this->sendErrorResponse(404, 'ERR_ORDER_NOT_FOUND', 'Order not found');
            } else {
                $this->sendErrorResponse(500, 'ERR_GET_ORDER_FAILED', 'Failed to get order');
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
