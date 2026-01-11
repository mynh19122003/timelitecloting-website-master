<?php

namespace App\Models;

use App\Config\Database;
use PDO;
use PDOException;

class Order
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function create(
        ?int $userId,
        string $userName,
        ?string $userAddress,
        ?string $userPhone,
        ?string $email,
        float $productsPrice,
        float $totalPrice,
        string $paymentMethod,
        string $paymentStatus,
        string $status = 'pending',
        ?string $productsName = null,
        ?string $productsItems = null
    ): int
    {
        try {
            $stmt = $this->db->prepare(
                'INSERT INTO orders (
                    user_id,
                    user_name,
                    user_address,
                    user_phone,
                    email,
                    products_price,
                    total_price,
                    payment_method,
                    payment_status,
                    status,
                    products_name,
                    products_items
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([$userId, $userName, $userAddress, $userPhone, $email, $productsPrice, $totalPrice, $paymentMethod, $paymentStatus, $status, $productsName, $productsItems]);
            
            $orderId = (int) $this->db->lastInsertId();

            // set order_id: ORD00001 (5 digits)
            $upd = $this->db->prepare("UPDATE orders SET order_id = CONCAT('ORD', LPAD(id, 5, '0')) WHERE id = ?");
            $upd->execute([$orderId]);

            return $orderId;
        } catch (PDOException $e) {
            error_log('Order creation error: ' . $e->getMessage());
            throw new \Exception('ERR_CREATE_ORDER_FAILED');
        }
    }

    // addOrderItem removed in merged orders model

    public function getOrderHistory(int $userId, int $page = 1, int $limit = 10): array
    {
        try {
            $offset = ($page - 1) * $limit;

            // Get total count
            $countStmt = $this->db->prepare('SELECT COUNT(*) as total FROM orders WHERE user_id = ?');
            $countStmt->execute([$userId]);
            $total = $countStmt->fetch()['total'];

            // Get orders
            $stmt = $this->db->prepare(
                'SELECT id, order_id, user_id, user_name, user_address, user_phone, products_name, products_items, products_price, total_price, payment_method, payment_status, status, create_date, update_date 
                 FROM orders 
                 WHERE user_id = ? 
                 ORDER BY create_date DESC 
                 LIMIT ? OFFSET ?'
            );
            $stmt->execute([$userId, $limit, $offset]);
            $orders = $stmt->fetchAll();

            // No order_items; products summarized in orders.products_name

            return [
                'orders' => $orders,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int) $total,
                    'totalPages' => (int) ceil($total / $limit)
                ]
            ];
        } catch (PDOException $e) {
            throw new \Exception('ERR_GET_ORDER_HISTORY_FAILED');
        }
    }

    public function findById(int $orderId, ?int $userId): array
    {
        try {
            // For guest orders (userId is null), only query by orderId
            if ($userId === null) {
                $stmt = $this->db->prepare(
                    'SELECT id, order_id, user_id, user_name, user_address, user_phone, products_name, products_items, products_price, total_price, payment_method, payment_status, status, create_date, update_date FROM orders WHERE id = ? AND user_id IS NULL'
                );
                $stmt->execute([$orderId]);
            } else {
                $stmt = $this->db->prepare(
                    'SELECT id, order_id, user_id, user_name, user_address, user_phone, products_name, products_items, products_price, total_price, payment_method, payment_status, status, create_date, update_date FROM orders WHERE id = ? AND user_id = ?'
                );
                $stmt->execute([$orderId, $userId]);
            }
            
            $order = $stmt->fetch();
            if (!$order) {
                throw new \Exception('ERR_ORDER_NOT_FOUND');
            }

            return $order;
        } catch (PDOException $e) {
            throw new \Exception('ERR_GET_ORDER_FAILED');
        }
    }

    /**
     * Find order by order_id (ORD00001) and email for guest lookup
     */
    public function findByOrderNumberAndEmail(string $orderNumber, string $email): ?array
    {
        try {
            $stmt = $this->db->prepare(
                'SELECT id, order_id, user_id, user_name, user_address, user_phone, email, products_name, products_items, products_price, total_price, payment_method, payment_status, status, create_date, update_date FROM orders WHERE order_id = ? AND email = ?'
            );
            $stmt->execute([$orderNumber, $email]);
            
            $order = $stmt->fetch();
            return $order ?: null;
        } catch (PDOException $e) {
            error_log('findByOrderNumberAndEmail error: ' . $e->getMessage());
            return null;
        }
    }
}
