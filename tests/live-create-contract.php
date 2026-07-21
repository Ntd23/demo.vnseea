<?php

$root = dirname(__DIR__);

function live_create_assert_true($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

function live_create_assert_same($expected, $actual, $message)
{
    if ($expected !== $actual) {
        fwrite(STDERR, "FAIL: {$message}\nExpected: " . var_export($expected, true) . "\nActual: " . var_export($actual, true) . "\n");
        exit(1);
    }
}

$helperPath = $root . '/assets/includes/vnseea_live.php';
live_create_assert_true(file_exists($helperPath), 'canonical live creation helper must exist');

require_once $helperPath;

live_create_assert_same('0', VNSEEA_LivePrivacyDatabaseValue(0), 'public privacy must be bound as an ENUM string');
live_create_assert_same('1', VNSEEA_LivePrivacyDatabaseValue('1'), 'friends privacy must stay a string');
live_create_assert_same('2', VNSEEA_LivePrivacyDatabaseValue(2), 'followers privacy must stay a string');
live_create_assert_same('3', VNSEEA_LivePrivacyDatabaseValue('3'), 'only-me privacy must stay a string');
live_create_assert_same('0', VNSEEA_LivePrivacyDatabaseValue(99), 'invalid privacy must fall back to public');

$error = VNSEEA_LiveCreateError('live_already_running');
live_create_assert_same(409, $error['status'], 'active live must return conflict');
live_create_assert_same('live_already_running', $error['error_code'], 'error code must be stable');
live_create_assert_same(false, $error['retryable'], 'active live must not be retried automatically');

$helper = file_get_contents($helperPath);
$xhr = file_get_contents($root . '/xhr/live.php');
$api = file_get_contents($root . '/api/v2/endpoints/live.php');

live_create_assert_true(strpos($helper, 'startTransaction()') !== false, 'live post creation must start a transaction');
live_create_assert_true(strpos($helper, 'FOR UPDATE') !== false, 'live creation must lock the host before its final active-live check');
live_create_assert_true(strpos($helper, 'if (!$db->commit())') !== false, 'live post creation must verify commit success');
live_create_assert_true(strpos($helper, 'rollback()') !== false, 'live post creation must rollback failures');
live_create_assert_true(strpos($helper, "'postPrivacy' => VNSEEA_LivePrivacyDatabaseValue") !== false, 'live insert must bind postPrivacy as a string');
live_create_assert_true(strpos($helper, 'VNSEEA_LivePostsHasAnonymousColumn') !== false, 'live create must tolerate a partial privacy migration');
live_create_assert_true(strpos($xhr, 'VNSEEA_CreateLiveSession') !== false, 'XHR create must delegate to the canonical helper');
live_create_assert_true(strpos($api, 'VNSEEA_CreateLiveSession') !== false, 'API v2 create must delegate to the canonical helper');

fwrite(STDOUT, "live create contract: ok\n");
