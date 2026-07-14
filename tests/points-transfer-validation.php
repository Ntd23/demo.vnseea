<?php
require_once __DIR__ . '/../assets/includes/vnseea_points_transfer.php';

function assert_same($expected, $actual, $message) {
    if ($expected !== $actual) {
        fwrite(STDERR, $message . "\nExpected: " . var_export($expected, true) . "\nActual: " . var_export($actual, true) . "\n");
        exit(1);
    }
}

assert_same(1, Wo_PointsTransferParsePositiveInteger(1), 'Integer one must be accepted.');
assert_same(15, Wo_PointsTransferParsePositiveInteger('15'), 'Digit string must be accepted.');
assert_same(2147483647, Wo_PointsTransferParsePositiveInteger('2147483647'), 'Maximum supported points value must be accepted.');

foreach (array(0, '0', -1, '-1', 1.5, '1.5', '1e3', '+1', '2147483648', true, '', null) as $invalid) {
    assert_same(null, Wo_PointsTransferParsePositiveInteger($invalid), 'Invalid points value was accepted.');
}

assert_same('pt_valid_request_00001', Wo_PointsTransferNormalizeRequestId('pt_valid_request_00001'), 'Valid request id must be accepted.');
assert_same(null, Wo_PointsTransferNormalizeRequestId('short'), 'Short request id must be rejected.');
assert_same(null, Wo_PointsTransferNormalizeRequestId('pt invalid request id'), 'Unsafe request id must be rejected.');

echo "points-transfer validation: ok\n";
