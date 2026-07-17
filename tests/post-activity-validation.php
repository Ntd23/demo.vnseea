<?php

require_once __DIR__ . '/../assets/includes/vnseea_post_activity.php';

function assert_same($expected, $actual, $message)
{
    if ($expected !== $actual) {
        fwrite(STDERR, $message . "\nExpected: " . var_export($expected, true) . "\nActual: " . var_export($actual, true) . "\n");
        exit(1);
    }
}

assert_same('saved', VNSEEA_PostActivityNormalizeCategory('saved'), 'Saved category must be accepted.');
assert_same('reaction', VNSEEA_PostActivityNormalizeCategory('reaction'), 'Reaction category must be accepted.');
assert_same('comment', VNSEEA_PostActivityNormalizeCategory('comment'), 'Comment category must be accepted.');
assert_same('share', VNSEEA_PostActivityNormalizeCategory('share'), 'Share category must be accepted.');
assert_same(null, VNSEEA_PostActivityNormalizeCategory('activities'), 'Unknown category must be rejected.');

assert_same(20, VNSEEA_PostActivityNormalizeLimit(null), 'Missing limit must use the default.');
assert_same(1, VNSEEA_PostActivityNormalizeLimit('1'), 'Minimum limit must be accepted.');
assert_same(30, VNSEEA_PostActivityNormalizeLimit(30), 'Maximum limit must be accepted.');
assert_same(null, VNSEEA_PostActivityNormalizeLimit(0), 'Zero limit must be rejected.');
assert_same(null, VNSEEA_PostActivityNormalizeLimit(31), 'Oversized limit must be rejected.');

$cursor = VNSEEA_PostActivityEncodeCursor(array('sort' => 123, 'post_id' => 45));
assert_same(array('sort' => 123, 'post_id' => 45), VNSEEA_PostActivityDecodeCursor($cursor), 'Cursor must round-trip.');
assert_same(null, VNSEEA_PostActivityDecodeCursor('not-a-valid-cursor'), 'Malformed cursor must be rejected.');

$root = dirname(__DIR__);
$endpoint = file_get_contents($root . '/api/v2/endpoints/post-activity.php');
$service = file_get_contents($root . '/assets/includes/vnseea_post_activity.php');

foreach (array('T_SAVED_POSTS', 'T_REACTIONS', 'T_COMMENTS', 'T_COMMENTS_REPLIES', 'T_POSTS') as $table) {
    if (strpos($service, $table) === false) {
        fwrite(STDERR, "Missing direct-state table: {$table}\n");
        exit(1);
    }
}

if (strpos($service, 'T_ACTIVITIES') !== false || strpos($endpoint, 'Wo_GetActivities') !== false) {
    fwrite(STDERR, "Post activity must not depend on Wo_Activities.\n");
    exit(1);
}

if (strpos($endpoint, "\$_POST['user_id']") !== false) {
    fwrite(STDERR, "Endpoint must only use the authenticated user id.\n");
    exit(1);
}

echo "post-activity validation: ok\n";
