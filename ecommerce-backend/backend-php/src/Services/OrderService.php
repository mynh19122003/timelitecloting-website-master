<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Config\Database;

class OrderService
{
    private Order $orderModel;
    private Product $productModel;
    private \PDO $db;

    public function __construct()
    {
        $this->orderModel = new Order();
        $this->productModel = new Product();
        $this->db = Database::getInstance();
    }

    public function createOrder(int $userId, array $items, array $orderDetails = []): array
    {
        $this->db->beginTransaction();

        try {
            // Validate items and compute total
            $processedItems = [];
            $totalAmount = 0.0;
            $nameParts = [];

            foreach ($items as $item) {
                if (!isset($item['products_id']) && !isset($item['product_id']) && !isset($item['product_slug'])) {
                    throw new \Exception('ERR_VALIDATION_FAILED');
                }
                if (!isset($item['quantity'])) {
                    throw new \Exception('ERR_VALIDATION_FAILED');
                }
                $productId = isset($item['product_id']) ? (int) $item['product_id'] : 0;
                $qty = (int) $item['quantity'];
                if ($qty <= 0) {
                    throw new \Exception('ERR_VALIDATION_FAILED');
                }

                // Resolve by products_id first
                if ($productId <= 0 && isset($item['products_id'])) {
                    $pid = (string) $item['products_id'];
                    $stmt = $this->db->prepare('SELECT id FROM products WHERE products_id = ?');
                    $stmt->execute([$pid]);
                    $row = $stmt->fetch();
                    if (!$row) {
                        throw new \Exception('ERR_PRODUCT_NOT_FOUND');
                    }
                    $productId = (int) $row['id'];
                }

                // Fallback: resolve by slug
                if ($productId <= 0 && isset($item['product_slug'])) {
                    $slug = (string) $item['product_slug'];
                    $stmt = $this->db->prepare('SELECT id FROM products WHERE slug = ?');
                    $stmt->execute([$slug]);
                    $row = $stmt->fetch();
                    if (!$row) {
                        throw new \Exception('ERR_PRODUCT_NOT_FOUND');
                    }
                    $productId = (int) $row['id'];
                }

                if ($productId <= 0) {
                    throw new \Exception('ERR_VALIDATION_FAILED');
                }

                // Validate stock
                $this->productModel->checkStock($productId, $qty);

                // Get product to read price
                $product = $this->productModel->findById($productId);
                $price = (float) $product['price'];
                $totalAmount += $price * $qty;

                // Fetch products_id for echoing back in items JSON
                $pidStmt = $this->db->prepare('SELECT products_id FROM products WHERE id = ?');
                $pidStmt->execute([$productId]);
                $pidRow = $pidStmt->fetch();
                $productsIdStr = $pidRow['products_id'] ?? null;

                $processedItems[] = [
                    'product_id' => $productId,
                    'products_id' => $productsIdStr,
                    'name' => $product['name'],
                    'quantity' => $qty,
                    'price' => $price,
                    'color' => $item['color'] ?? null,
                    'size' => $item['size'] ?? null,
                ];
                $label = $product['name'] . (isset($item['color']) ? ' (' . $item['color'] . (isset($item['size']) ? '/' . $item['size'] : '') . ')' : (isset($item['size']) ? ' (' . $item['size'] . ')' : ''));
                $nameParts[] = $label . ' x' . $qty;
            }

            // Use provided total_amount or calculated total
            $finalTotal = isset($orderDetails['total_amount']) && is_numeric($orderDetails['total_amount'])
                ? (float) $orderDetails['total_amount']
                : $totalAmount;

            // Compose user fields and totals
            $first = isset($orderDetails['firstname']) ? trim((string)$orderDetails['firstname']) : '';
            $last = isset($orderDetails['lastname']) ? trim((string)$orderDetails['lastname']) : '';
            $userName = trim($first . ' ' . $last);
            $userAddress = $orderDetails['address'] ?? null;
            $userPhone = $orderDetails['phonenumber'] ?? null;
            $paymentMethod = $orderDetails['payment_method'] ?? 'cod';
            $totalPrice = $finalTotal; // có thể thêm phí vận chuyển sau
            $productsName = implode(', ', $nameParts);
            $productsItems = json_encode($processedItems, JSON_UNESCAPED_UNICODE);

            // Create order with new structure
            $orderId = $this->orderModel->create(
                $userId,
                $userName,
                $userAddress,
                $userPhone,
                $finalTotal,
                $totalPrice,
                $paymentMethod,
                'pending'
            );

            // Persist products_name and products_items
            $upd = $this->db->prepare('UPDATE orders SET products_name = ?, products_items = ? WHERE id = ?');
            $upd->execute([$productsName, $productsItems, $orderId]);

            // Update stock
            foreach ($processedItems as $item) {
                $this->productModel->updateStock($item['product_id'], $item['quantity']);
            }

            $this->db->commit();

            // Get created order with items
            return $this->orderModel->findById($orderId, $userId);
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log('Order creation error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function getOrderHistory(int $userId, int $page = 1, int $limit = 10): array
    {
        return $this->orderModel->getOrderHistory($userId, $page, $limit);
    }

    public function getOrderById(int $orderId, int $userId): array
    {
        return $this->orderModel->findById($orderId, $userId);
    }
}
