<?php

$root = dirname(__DIR__);
$failures = array();

function marketplace_request_assert($condition, $message)
{
    global $failures;
    if (!$condition) {
        $failures[] = $message;
    }
}

$market = file_get_contents($root . '/api/v2/endpoints/market.php');
$exceptions = file_get_contents($root . '/api/v2/endpoints/Exceptions/exceptions.php');
$messages = file_get_contents($root . '/assets/includes/functions_one.php');
$legacyProducts = file_get_contents($root . '/xhr/products.php');
$adminSettings = file_get_contents($root . '/xhr/admin_setting.php');
$migrationPath = $root . '/database/migrations/20260721_marketplace_order_requests.sql';
$requestStart = strpos($market, 'function VNSEEA_MarketRequestOrder()');
$requestEnd = strpos($market, "if (!function_exists('VNSEEA_ChangeMarketRequestOrderStatus'))", $requestStart);
$requestFlow = $requestStart !== false && $requestEnd !== false
    ? substr($market, $requestStart, $requestEnd - $requestStart)
    : '';

marketplace_request_assert(file_exists($migrationPath), 'order request migration must exist');
$migration = file_exists($migrationPath) ? file_get_contents($migrationPath) : '';

marketplace_request_assert(strpos($migration, '`order_flow`') !== false, 'migration must add order_flow');
marketplace_request_assert(strpos($migration, '`stock_reserved`') !== false, 'migration must add stock_reserved');
marketplace_request_assert(strpos($migration, '`market_order_hash`') !== false, 'migration must add message order hash');

marketplace_request_assert(strpos($market, "type'] == 'ensure_cart'") !== false, 'market API must expose ensure_cart');
marketplace_request_assert(strpos($market, "type'] == 'request_order'") !== false, 'market API must expose request_order');
marketplace_request_assert(strpos($market, "'order_flow' => 'request'") !== false, 'request orders must be marked canonical');
marketplace_request_assert(strpos($market, "'stock_reserved' => 0") !== false, 'request creation must not reserve stock');
marketplace_request_assert(strpos($market, "'type_two' => 'market_order_request'") !== false, 'request must create a canonical chat message');
marketplace_request_assert(strpos($market, "'market_order_hash' =>") !== false, 'request message must reference the order hash');
marketplace_request_assert(strpos($market, 'startTransaction()') !== false, 'request creation must be transactional');
marketplace_request_assert(strpos($market, '$cart_deleted = $db->where') !== false, 'request creation must verify selected cart rows are deleted');
marketplace_request_assert(strpos($market, "throw new Exception('could not remove ordered cart items')") !== false, 'cart deletion failure must rollback the request');
marketplace_request_assert(strpos($market, "if (\$status === 'accepted')") !== false, 'seller acceptance must reserve stock for request orders');
marketplace_request_assert(strpos($market, 'function VNSEEA_ChangeMarketRequestOrderStatus') !== false, 'request order status changes must use a dedicated transaction helper');
marketplace_request_assert(strpos($market, 'FOR UPDATE') !== false, 'request order status changes must lock order and product rows');
marketplace_request_assert(strpos($market, "if (\$order_flow === 'request')") !== false, 'request order status changes must bypass the legacy status updater');
marketplace_request_assert(strpos($market, "(int)\$product->status !== 0") !== false, 'request-order must reject sold products');
marketplace_request_assert(strpos($market, "(int)\$product['status'] !== 0") !== false, 'ensure-cart must reject sold products');
marketplace_request_assert(strpos($requestFlow, 'T_USERS') === false, 'request creation must not mutate user balances');
marketplace_request_assert(strpos($requestFlow, 'T_PAYMENT_TRANSACTIONS') === false, 'request creation must not insert payment transactions');
marketplace_request_assert(strpos($requestFlow, '$db->dec(') === false, 'request creation must not decrement stock');
marketplace_request_assert(
    strpos($requestFlow, '$db->commit()') < strpos($requestFlow, 'VNSEEA_PublishRealtimeMessageChange'),
    'request realtime must publish only after commit'
);

marketplace_request_assert(strpos($exceptions, 'marketRequestOrderValidation') !== false, 'request order validation must be centralized');
marketplace_request_assert(strpos($exceptions, 'product_ids') !== false, 'request validation must accept selected product IDs');
marketplace_request_assert(substr_count($exceptions, "preg_match('/^[1-9][0-9]*$/',") >= 2, 'request IDs must be strict positive integers');
marketplace_request_assert(strpos($exceptions, 'hash_id') !== false && strpos($exceptions, 'hash_order') !== false && strpos($exceptions, 'order_hash') !== false, 'order hash aliases must be normalized');
marketplace_request_assert(strpos($exceptions, 'request orders do not support refunds') !== false, 'request orders must not enter the refund flow');

marketplace_request_assert(strpos($messages, 'VNSEEA_IsMarketRequestOrderHash') !== false, 'legacy and admin refund paths need a shared request-order guard');
marketplace_request_assert(strpos($legacyProducts, 'VNSEEA_IsMarketRequestOrderHash') !== false, 'legacy product refund/status paths must guard request orders');
marketplace_request_assert(substr_count($adminSettings, 'VNSEEA_IsMarketRequestOrderHash') >= 2, 'single and bulk admin refund approval must guard request orders');

marketplace_request_assert(strpos($messages, 'VNSEEA_AttachMarketplaceMessageContext') !== false, 'message responses must attach canonical marketplace context');

if (!empty($failures)) {
    foreach ($failures as $failure) {
        fwrite(STDERR, "FAIL: {$failure}\n");
    }
    exit(1);
}

fwrite(STDOUT, "marketplace order request contract: ok\n");
