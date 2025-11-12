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
            $user = AuthMiddleware::authenticate();
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['items']) || !is_array($input['items']) || empty($input['items'])) {
                $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Items array is required and must not be empty');
                return;
            }

            // Validate items
            foreach ($input['items'] as $item) {
                if (!isset($item['product_id']) || !isset($item['quantity'])) {
                    $this->sendErrorResponse(400, 'ERR_VALIDATION_FAILED', 'Each item must have product_id and quantity');
                    return;
                }

                // product_id can be numeric (1, 2, 3) or string (vest-silk-noir)
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

            // Extract order details
            $orderDetails = [
                'customer_info' => $input['customer_info'] ?? null,
                'shipping_address' => $input['shipping_address'] ?? null,
                'notes' => $input['notes'] ?? null,
                'total_amount' => $input['total_amount'] ?? null
            ];

            $order = $this->orderService->createOrder($user['userId'], $input['items'], $orderDetails);
            
            $this->sendSuccessResponse(201, 'Order created successfully', $order);
        } catch (\Exception $e) {
            if ($e->getMessage() === 'ERR_PRODUCT_NOT_FOUND') {
                $this->sendErrorResponse(404, 'ERR_PRODUCT_NOT_FOUND', 'One or more products not found');
            } elseif ($e->getMessage() === 'ERR_INSUFFICIENT_STOCK') {
                $this->sendErrorResponse(400, 'ERR_INSUFFICIENT_STOCK', 'Insufficient stock for one or more products');
            } else {
                $this->sendErrorResponse(500, 'ERR_CREATE_ORDER_FAILED', 'Failed to create order');
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
