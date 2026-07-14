<?php

function assert_contains($needle, $haystack, $message)
{
    if (strpos($haystack, $needle) === false) {
        fwrite(STDERR, $message . "\nMissing: " . $needle . "\n");
        exit(1);
    }
}

$root = dirname(__DIR__);
$exceptions = file_get_contents($root . '/api/v2/endpoints/Exceptions/exceptions.php');
$pin = file_get_contents($root . '/api/v2/endpoints/pin_message.php');
$pinned = file_get_contents($root . '/api/v2/endpoints/get_pin_message.php');
$report = file_get_contents($root . '/api/v2/endpoints/report_user.php');
$functions = file_get_contents($root . '/assets/includes/functions_three.php');

assert_contains('VNSEEA_GetOwnedUserChat', $exceptions, 'User chat ownership helper is missing.');
assert_contains('VNSEEA_IsMessageInAuthorizedChat', $exceptions, 'Message authorization helper is missing.');
assert_contains('VNSEEA_IsMessageInAuthorizedChat', $pin, 'Pin endpoint does not authorize the message.');
assert_contains("where('type'", $pinned, 'Pinned-message lookup is not scoped by chat type.');
assert_contains('VNSEEA_IsMessageInAuthorizedChat', $pinned, 'Pinned-message endpoint does not recheck access.');
assert_contains("\$_POST['ensure_reported']", $report, 'Idempotent report mode is missing.');
assert_contains('Wo_EnsureReportUser', $report, 'Report endpoint does not use the idempotent helper.');
assert_contains('function Wo_EnsureReportUser', $functions, 'Idempotent report helper is missing.');
assert_contains('GET_LOCK', $functions, 'Concurrent report requests are not serialized.');
assert_contains('RELEASE_LOCK', $functions, 'Report advisory lock is not released.');

echo "conversation-details backend validation: ok\n";
