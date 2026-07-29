<?php

$root = dirname(__DIR__);

function call_delivery_source($root, $path)
{
    $full_path = $root . '/' . $path;
    return file_exists($full_path) ? file_get_contents($full_path) : '';
}

function assert_call_delivery($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$push = call_delivery_source($root, 'assets/includes/vnseea_push_delivery.php');
$direct = call_delivery_source($root, 'assets/includes/vnseea_livekit_call.php');
$group = call_delivery_source($root, 'api/v2/endpoints/group_call.php');
$apns = call_delivery_source($root, 'assets/includes/functions_two.php');

assert_call_delivery(
    strpos($push, 'function VNSEEA_SendImmediateCallPush') !== false,
    'calls must use the installation registry delivery service'
);
assert_call_delivery(
    strpos($push, "if (!empty(\$result['invalid_token']))") !== false &&
        strpos($push, 'VNSEEA_DeactivateRejectedPushToken($target)') !== false,
    'immediate call delivery must deactivate only the rejected installation token'
);
assert_call_delivery(
    strpos($push, "array('realtime', 'onesignal', 'voip')") !== false &&
        strpos($push, "\$realtime_state = 'unavailable'") !== false &&
        strpos($push, "'partial'") !== false &&
        strpos($push, "'failed'") !== false,
    'call delivery state must expose every channel and aggregate status'
);
assert_call_delivery(
    strpos($direct, "'delivery' => VNSEEA_BuildCallDeliveryState") !== false,
    'direct call creation must return delivery state'
);
assert_call_delivery(
    strpos($group, "'delivery' => \$delivery") !== false &&
        strpos($group, '$delivery = VNSEEA_BuildCallDeliveryState(null, array());') !== false,
    'group call creation must return delivery state'
);
assert_call_delivery(
    strpos($apns, 'CURLOPT_SSL_VERIFYPEER, true') !== false &&
        strpos($apns, 'CURLOPT_SSL_VERIFYHOST, 2') !== false,
    'APNs requests must explicitly verify TLS'
);
assert_call_delivery(
    strpos($direct, "if (\$delivery['state'] === 'failed')") === false &&
        strpos($group, "if (\$delivery['state'] === 'failed')") === false,
    'failed delivery must not cancel the call'
);

echo "call delivery state contract: OK\n";
