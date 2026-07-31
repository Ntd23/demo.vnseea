<?php

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "CLI only\n");
    exit(1);
}

$root = !empty($argv[1]) ? rtrim($argv[1], '/') : dirname(__DIR__);
$user_id = !empty($argv[2]) ? (int)$argv[2] : 1;
$limit = !empty($argv[3]) ? max(1, min(50, (int)$argv[3])) : 20;
$publisher_id = !empty($argv[4]) ? (int)$argv[4] : 0;
if (!is_file($root . '/assets/init.php')) {
    fwrite(STDERR, "Invalid application root\n");
    exit(1);
}

$_SERVER['HTTP_HOST'] = 'demo.vnseea.vn';
$_SERVER['REQUEST_URI'] = '/api/posts';
$_SERVER['HTTPS'] = 'on';
$_SERVER['SERVER_PORT'] = 443;

chdir($root);
require $root . '/assets/init.php';

$wo['loggedin'] = false;
$wo['user'] = Wo_UserData($user_id);
if (empty($wo['user']['user_id'])) {
    fwrite(STDERR, "Benchmark user not found\n");
    exit(1);
}
$wo['loggedin'] = true;
$wo['lang'] = Wo_LangsFromDB($wo['user']['language']);

$db_stats_before = function_exists('mysqli_get_connection_stats')
    ? mysqli_get_connection_stats($sqlConnect)
    : array();
$started_at = microtime(true);
$posts = Wo_GetPosts(array(
    'limit' => $limit,
    'publisher_id' => $publisher_id,
    'after_post_id' => 0,
    'placement' => 'multi_image_post',
    'hydration_profile' => 'feed_summary',
    'anonymous' => true,
));
$elapsed = microtime(true) - $started_at;
$db_stats_after = function_exists('mysqli_get_connection_stats')
    ? mysqli_get_connection_stats($sqlConnect)
    : array();
$db_stat_delta = function ($key) use ($db_stats_before, $db_stats_after) {
    return isset($db_stats_after[$key])
        ? (int)$db_stats_after[$key] - (isset($db_stats_before[$key]) ? (int)$db_stats_before[$key] : 0)
        : null;
};

$comments_hydrated = 0;
$media_items = 0;
$poll_options = 0;
$publisher_missing = 0;
foreach ((array)$posts as $post) {
    $comments_hydrated += !empty($post['get_post_comments']) && is_array($post['get_post_comments'])
        ? count($post['get_post_comments'])
        : 0;
    $media_items += !empty($post['photo_album']) && is_array($post['photo_album'])
        ? count($post['photo_album'])
        : 0;
    $media_items += !empty($post['photo_multi']) && is_array($post['photo_multi'])
        ? count($post['photo_multi'])
        : 0;
    $poll_options += !empty($post['options']) && is_array($post['options'])
        ? count($post['options'])
        : 0;
    if (empty($post['publisher']) || empty($post['publisher']['name']) || empty($post['publisher']['avatar'])) {
        $publisher_missing++;
    }
}

echo json_encode(array(
    'elapsed_seconds' => round($elapsed, 6),
    'post_count' => count((array)$posts),
    'comments_hydrated' => $comments_hydrated,
    'media_items' => $media_items,
    'poll_options' => $poll_options,
    'publisher_missing' => $publisher_missing,
    'db_result_queries' => $db_stat_delta('result_set_queries'),
    'db_non_result_queries' => $db_stat_delta('non_result_set_queries'),
    'db_com_query' => $db_stat_delta('com_query'),
    'peak_memory_bytes' => memory_get_peak_usage(true),
), JSON_UNESCAPED_SLASHES) . PHP_EOL;
