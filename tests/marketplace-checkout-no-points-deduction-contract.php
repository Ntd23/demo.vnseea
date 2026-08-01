<?php

$root = dirname(__DIR__);
$market = file_get_contents($root . '/api/v2/endpoints/market.php');
$failures = array();

function marketplace_checkout_no_points_assert($condition, $message)
{
    global $failures;
    if (!$condition) {
        $failures[] = $message;
    }
}

$buyStart = strpos($market, "elseif (\$_POST['type'] == 'buy')");
$checkoutStart = strpos($market, "elseif (\$_POST['type'] == 'checkout')", $buyStart);
$purchasedStart = strpos($market, "elseif (\$_POST['type'] == 'purchased')", $checkoutStart);

$buyFlow = $buyStart !== false && $checkoutStart !== false
    ? substr($market, $buyStart, $checkoutStart - $buyStart)
    : '';
$checkoutFlow = $checkoutStart !== false && $purchasedStart !== false
    ? substr($market, $checkoutStart, $purchasedStart - $checkoutStart)
    : '';

marketplace_checkout_no_points_assert($buyFlow !== '', 'market buy flow must exist');
marketplace_checkout_no_points_assert($checkoutFlow !== '', 'market checkout flow must exist');
marketplace_checkout_no_points_assert(
    strpos($buyFlow, "['points'] = \$db->dec") === false,
    'market buy must not deduct buyer VNSEEA points'
);
marketplace_checkout_no_points_assert(
    strpos($buyFlow, '$total_points += $line_points;') !== false,
    'market orders must retain VNSEEA totals for order review and records'
);
marketplace_checkout_no_points_assert(
    strpos($checkoutFlow, '$wo[\'total_points\'] += ($checkout_unit_points * $wo[\'item\']->units);') !== false,
    'checkout snapshot must retain VNSEEA totals for order review'
);

if (!empty($failures)) {
    foreach ($failures as $failure) {
        fwrite(STDERR, "FAIL: {$failure}\n");
    }
    exit(1);
}

fwrite(STDOUT, "marketplace checkout no-points-deduction contract: ok\n");
