<?php

$root = dirname(__DIR__);
$failures = array();

function product_detail_assert($condition, $message)
{
    global $failures;
    if (!$condition) {
        $failures[] = $message;
    }
}

$endpoint = file_get_contents($root . '/api/v2/endpoints/get-products.php');
$productsHelper = file_get_contents($root . '/assets/includes/functions_three.php');

product_detail_assert(
    strpos($endpoint, '$options[\'product_id\']') !== false,
    'get-products endpoint must forward product_id'
);
product_detail_assert(
    strpos($endpoint, '$options[\'limit\'] = 1') !== false,
    'single-product requests must be limited to one result'
);
product_detail_assert(
    substr_count($productsHelper, '!empty($filter_data[\'product_id\'])') >= 2,
    'Wo_GetProducts must filter product_id in regular and distance queries'
);
product_detail_assert(
    substr_count($productsHelper, 'AND `id` = \'{$product_id}\'') >= 2,
    'both product queries must constrain SQL to the requested product'
);

if (!empty($failures)) {
    foreach ($failures as $failure) {
        fwrite(STDERR, "FAIL: {$failure}\n");
    }
    exit(1);
}

fwrite(STDOUT, "product detail contract: ok\n");
