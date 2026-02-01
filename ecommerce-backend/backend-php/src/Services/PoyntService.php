<?php
namespace App\Services;

class PoyntService {
    private string $nodeBackendUrl;

    public function __construct() {
        // Node backend URL within Docker network
        $this->nodeBackendUrl = 'http://backend-node:3001';
    }

    /**
     * Charge credit card via Poynt by calling Node.js service
     * @param array $cardData - array with number, expirationMonth, expirationYear, cvv
     * @param float $amount - amount in dollars
     * @param string $orderId - reference order ID
     * @return array - transaction result
     * @throws \Exception on payment failure
     */
    public function chargeCard(array $cardData, float $amount, string $orderId): array {
        // Validate card data
        if (!isset($cardData['number']) || !isset($cardData['expirationMonth']) || 
            !isset($cardData['expirationYear']) || !isset($cardData['cvv'])) {
            throw new \Exception('Missing required card data fields');
        }

        error_log('[PoyntService] Processing payment - Order: ' . $orderId . ', Amount: $' . $amount);

        // Call Node.js Poynt service endpoint
        $endpoint = $this->nodeBackendUrl . '/api/poynt/charge-card';
        
        $payload = [
            'card' => [
                'number' => $cardData['number'],
                'expirationMonth' => $cardData['expirationMonth'],
                'expirationYear' => $cardData['expirationYear'],
                'cvv' => $cardData['cvv']
            ],
            'amount' => $amount,
            'orderId' => $orderId
        ];

        error_log('[PoyntService] Calling Node backend: ' . $endpoint);
        error_log('[PoyntService] Payload: ' . json_encode([
            'amount' => $amount,
            'orderId' => $orderId,
            'cardLast4' => substr($cardData['number'], -4)
        ]));

        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            error_log('[PoyntService] cURL error: ' . $curlError);
            throw new \Exception('Payment service connection error: ' . $curlError);
        }

        error_log('[PoyntService] Response HTTP Code: ' . $httpCode);
        error_log('[PoyntService] Response Body: ' . $response);

        if ($httpCode !== 200) {
            $errorData = json_decode($response, true);
            $errorMessage = $errorData['message'] ?? $errorData['error'] ?? 'Payment processing failed';
            error_log('[PoyntService] Payment failed: ' . $errorMessage);
            throw new \Exception($errorMessage);
        }

        $result = json_decode($response, true);
        
        if (!$result || !isset($result['success'])) {
            throw new \Exception('Invalid payment response format');
        }

        if (!$result['success']) {
            $errorMessage = $result['message'] ?? 'Payment declined';
            throw new \Exception($errorMessage);
        }

        error_log('[PoyntService] Payment successful - Transaction ID: ' . ($result['transactionId'] ?? 'N/A'));

        return $result;
    }
}
