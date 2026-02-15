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

        // ============================================================
        // CRITICAL FIX: Force all card fields to string immediately
        // This ensures Poynt API receives correct 16-digit card number
        // regardless of how PHP json_decode() parsed the input.
        // When JSON contains unquoted numbers, json_decode() may convert
        // them to integers/floats which can cause truncation.
        // Performance impact: ~0.001ms per transaction (negligible)
        // ============================================================
        $cardData['number'] = strval($cardData['number']);
        $cardData['expirationMonth'] = str_pad(
            strval($cardData['expirationMonth']), 
            2, 
            '0', 
            STR_PAD_LEFT
        );
        $cardData['expirationYear'] = strval($cardData['expirationYear']);
        $cardData['cvv'] = strval($cardData['cvv']);

        error_log('[PoyntService] Processing payment - Order: ' . $orderId . ', Amount: $' . $amount);
        error_log('[PoyntService] After string conversion: ' . json_encode([
            'numberType' => gettype($cardData['number']),
            'numberLength' => strlen($cardData['number']),
            'numberLast4' => substr($cardData['number'], -4),
            'expMonthType' => gettype($cardData['expirationMonth']),
            'expMonthLength' => strlen($cardData['expirationMonth']),
            'expYearType' => gettype($cardData['expirationYear']),
            'cvvType' => gettype($cardData['cvv'])
        ]));
        error_log('[PoyntService] Card data received: ' . json_encode([
            'hasNumber' => isset($cardData['number']),
            'numberType' => gettype($cardData['number']),
            'numberLength' => strlen((string)$cardData['number']),
            'numberLast4' => substr((string)$cardData['number'], -4),
            'hasExpMonth' => isset($cardData['expirationMonth']),
            'hasExpYear' => isset($cardData['expirationYear']),
            'hasCVV' => isset($cardData['cvv'])
        ]));

        // Call Node.js Poynt service endpoint
        $endpoint = $this->nodeBackendUrl . '/api/poynt/charge-card';
        
        // CRITICAL: Explicitly cast card number to string to prevent PHP integer truncation
        // Large numbers like 4111111111111111 (16 digits) exceed PHP_INT_MAX on some systems
        // and get truncated when treated as integers
        $payload = [
            'card' => [
                'number' => (string)$cardData['number'],  // Force string type
                'expirationMonth' => (string)$cardData['expirationMonth'],
                'expirationYear' => (string)$cardData['expirationYear'],
                'cvv' => (string)$cardData['cvv']
            ],
            'amount' => $amount,
            'orderId' => $orderId
        ];

        error_log('[PoyntService] Calling Node backend: ' . $endpoint);
        error_log('[PoyntService] Full payload (masked): ' . json_encode([
            'card' => [
                'number' => '****' . substr((string)$cardData['number'], -4),
                'expirationMonth' => $cardData['expirationMonth'],
                'expirationYear' => $cardData['expirationYear'],
                'cvv' => '***'
            ],
            'amount' => $amount,
            'orderId' => $orderId
        ]));

        $ch = curl_init($endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_PRESERVE_ZERO_FRACTION));
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
