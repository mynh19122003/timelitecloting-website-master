<?php

// Remove any CORS headers that might be set by PHP-FPM or other sources
// CORS is handled centrally at the API gateway (nginx)
// Must remove headers BEFORE any output or header() calls

// Remove headers immediately and repeatedly
header_remove('Access-Control-Allow-Origin');
header_remove('Access-Control-Allow-Methods');
header_remove('Access-Control-Allow-Headers');
header_remove('Access-Control-Allow-Credentials');
header_remove('Access-Control-Max-Age');

// Use output buffering to catch and remove headers at shutdown
ob_start();
register_shutdown_function(function() {
    // Remove all CORS headers at shutdown
    header_remove('Access-Control-Allow-Origin');
    header_remove('Access-Control-Allow-Methods');
    header_remove('Access-Control-Allow-Headers');
    header_remove('Access-Control-Allow-Credentials');
    header_remove('Access-Control-Max-Age');
    
    // Also check headers_list and remove any CORS headers
    $headers = headers_list();
    foreach ($headers as $header) {
        if (stripos($header, 'Access-Control-') === 0) {
            // Extract header name from "Header-Name: value" format
            $headerName = explode(':', $header)[0];
            header_remove($headerName);
        }
    }
});

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php_errors.log');

// Set timezone
date_default_timezone_set('UTC');

// Response content type
header('Content-Type: application/json');

// Note: CORS is handled centrally at the API gateway (nginx). Avoid setting
// Access-Control-* headers here to prevent duplicate/contradictory headers.

// Load Composer autoloader
require __DIR__ . '/vendor/autoload.php';

// Remove CORS headers again after autoloader (in case packages set them)
header_remove('Access-Control-Allow-Origin');
header_remove('Access-Control-Allow-Methods');
header_remove('Access-Control-Allow-Headers');
header_remove('Access-Control-Allow-Credentials');
header_remove('Access-Control-Max-Age');

// Simple routing
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Log for debugging
error_log("PHP REQUEST_URI: " . $requestUri);
error_log("PHP REQUEST_METHOD: " . $requestMethod);

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Health check endpoint
if ($path === '/health') {
    http_response_code(200);
    echo json_encode([
        'status' => 'OK',
        'timestamp' => date('c'),
        'service' => 'ecommerce-backend-php',
        'version' => '1.0.0'
    ]);
    exit;
}

// Debug endpoint
if ($path === '/debug') {
    http_response_code(200);
    echo json_encode([
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'N/A',
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'N/A',
        'SCRIPT_FILENAME' => $_SERVER['SCRIPT_FILENAME'] ?? 'N/A',
        'DOCUMENT_ROOT' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
        'PATH_INFO' => $_SERVER['PATH_INFO'] ?? 'N/A',
        'QUERY_STRING' => $_SERVER['QUERY_STRING'] ?? 'N/A',
        'php_input' => file_get_contents('php://input'),
        'db_test' => \App\Config\Database::testConnection() ? 'OK' : 'FAILED'
    ]);
    exit;
}

// API routing
$pathParts = explode('/', trim($path, '/'));
error_log('[PHP Router] pathParts: ' . json_encode($pathParts));

$apiIndex = array_search('api', $pathParts);
error_log('[PHP Router] apiIndex: ' . ($apiIndex !== false ? $apiIndex : 'not found'));

if ($apiIndex !== false && count($pathParts) > $apiIndex + 1) {
    $resource = $pathParts[$apiIndex + 1];
    $action = $pathParts[$apiIndex + 2] ?? '';
    $id = $pathParts[$apiIndex + 3] ?? '';
    
    error_log('[PHP Router] resource: ' . $resource);
    error_log('[PHP Router] action: ' . $action);
    error_log('[PHP Router] id: ' . $id);

    try {
        switch ($resource) {
            case 'users':
                $controller = new \App\Controllers\UserController();
                switch ($action) {
                    case 'register':
                        if ($requestMethod === 'POST') {
                            $controller->register();
                        } else {
                            sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                        }
                        break;
                    case 'login':
                        if ($requestMethod === 'POST') {
                            $controller->login();
                        } else {
                            sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                        }
                        break;
                    case 'change-password':
                        if ($requestMethod === 'PUT') {
                            $controller->changePassword();
                        } else {
                            sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                        }
                        break;
                    case 'profile':
                        if ($requestMethod === 'GET') {
                            $controller->getProfile();
                        } elseif ($requestMethod === 'PUT') {
                            $controller->updateProfile();
                        } else {
                            sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                        }
                        break;
                    case 'forgot-password':
                        if ($requestMethod === 'POST') {
                            $controller->forgotPassword();
                        } else {
                            sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                        }
                        break;
                    case 'reset-password':
                        if ($requestMethod === 'POST') {
                            $controller->resetPassword();
                        } else {
                            sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                        }
                        break;
                    case 'verify-email':
                        if ($requestMethod === 'POST') {
                            $controller->verifyEmail();
                        } else {
                            sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                        }
                        break;
                    case 'resend-verification':
                        if ($requestMethod === 'POST') {
                            $controller->resendVerification();
                        } else {
                            sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                        }
                        break;
                    default:
                        sendErrorResponse(404, 'ERR_NOT_FOUND', 'Endpoint not found');
                }
                break;

            case 'products':
                $controller = new \App\Controllers\ProductController();
                // Check if action is a numeric ID (e.g., /api/products/1)
                if ($action && is_numeric($action)) {
                    $_GET['id'] = $action;
                    if ($requestMethod === 'GET') {
                        $controller->getProductById();
                    } else {
                        sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                    }
                } elseif ($id && is_numeric($id)) {
                    // Handle /api/products/something/123
                    $_GET['id'] = $id;
                    if ($requestMethod === 'GET') {
                        $controller->getProductById();
                    } else {
                        sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                    }
                } else {
                    if ($requestMethod === 'GET') {
                        $controller->getProducts();
                    } else {
                        sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                    }
                }
                break;

            case 'orders':
                $controller = new \App\Controllers\OrderController();
                // Check if action is 'history'
                if ($action === 'history') {
                    if ($requestMethod === 'GET') {
                        $controller->getOrderHistory();
                    } else {
                        sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                    }
                // Check if action is a numeric ID (e.g., /api/orders/1)
                } elseif ($action && is_numeric($action)) {
                    $_GET['id'] = $action;
                    if ($requestMethod === 'GET') {
                        $controller->getOrderById();
                    } else {
                        sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                    }
                } elseif ($id && is_numeric($id)) {
                    $_GET['id'] = $id;
                    if ($requestMethod === 'GET') {
                        $controller->getOrderById();
                    } else {
                        sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                    }
                } else {
                    if ($requestMethod === 'POST') {
                        $controller->createOrder();
                    } else {
                        sendErrorResponse(405, 'ERR_METHOD_NOT_ALLOWED', 'Method not allowed');
                    }
                }
                break;

            default:
                sendErrorResponse(404, 'ERR_NOT_FOUND', 'Endpoint not found');
        }
    } catch (\Exception $e) {
        error_log('PHP Error: ' . $e->getMessage());
        sendErrorResponse(500, 'ERR_INTERNAL_SERVER_ERROR', 'Internal server error');
    }
} else {
    sendErrorResponse(404, 'ERR_NOT_FOUND', 'Endpoint not found');
}

function sendErrorResponse(int $statusCode, string $error, string $message): void
{
    http_response_code($statusCode);
    echo json_encode([
        'error' => $error,
        'message' => $message
    ]);
    exit;
}
