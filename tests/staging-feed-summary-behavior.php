<?php

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "CLI only\n");
    exit(1);
}

$root = !empty($argv[1]) ? rtrim($argv[1], '/') : dirname(__DIR__);
$user_id = !empty($argv[2]) ? (int)$argv[2] : 1;
$post_id = !empty($argv[3]) ? (int)$argv[3] : 0;
if (!is_file($root . '/assets/init.php') || $post_id < 1) {
    fwrite(STDERR, "Usage: php staging-feed-summary-behavior.php <app-root> <viewer-id> <post-id>\n");
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
    fwrite(STDERR, "Viewer not found\n");
    exit(1);
}
$wo['loggedin'] = true;
$wo['lang'] = Wo_LangsFromDB($wo['user']['language']);

function feed_summary_behavior_assert($condition, $message)
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

$direct_album = Wo_GetAlbumPhotos($post_id);
$transaction_started = mysqli_begin_transaction($sqlConnect);
if (!$transaction_started) {
    fwrite(STDERR, "Could not start fixture transaction\n");
    exit(1);
}

try {
    feed_summary_behavior_assert(
        mysqli_query($sqlConnect, 'UPDATE ' . T_POSTS . " SET `poll_id` = 1 WHERE `id` = {$post_id}") === true,
        'could not mark fixture post as poll'
    );
    $option_ids = array();
    foreach (array('First option', 'Second option', 'Third option') as $text) {
        $safe_text = Wo_Secure($text);
        feed_summary_behavior_assert(
            mysqli_query(
                $sqlConnect,
                'INSERT INTO ' . T_POLLS . " (`post_id`, `text`, `time`) VALUES ({$post_id}, '{$safe_text}', " . time() . ')'
            ) === true,
            'could not insert poll option'
        );
        $option_ids[] = (int)mysqli_insert_id($sqlConnect);
    }
    foreach (array(
        array($user_id, $option_ids[0]),
        array(5, $option_ids[0]),
        array(1818, $option_ids[1]),
    ) as $vote) {
        feed_summary_behavior_assert(
            mysqli_query(
                $sqlConnect,
                'INSERT INTO ' . T_VOTES . " (`user_id`, `post_id`, `option_id`) VALUES (" . (int)$vote[0] . ", {$post_id}, " . (int)$vote[1] . ')'
            ) === true,
            'could not insert poll vote'
        );
    }

    VNSEEA_PrimePostDataBatch(array($post_id), array('profile' => 'feed_summary'));
    $summary = Wo_PostData($post_id);
    feed_summary_behavior_assert(is_array($summary), 'summary post did not hydrate');
    feed_summary_behavior_assert(empty($summary['get_post_comments']), 'feed summary hydrated comment rows');
    feed_summary_behavior_assert((int)$summary['post_comments'] > 0, 'feed summary lost comment count');
    feed_summary_behavior_assert(!empty($summary['publisher']['name']), 'feed summary lost publisher name');
    feed_summary_behavior_assert(!empty($summary['publisher']['avatar']), 'feed summary lost publisher avatar');
    feed_summary_behavior_assert(count($summary['options']) === 3, 'poll options were not batched');
    feed_summary_behavior_assert((int)$summary['options'][0]['option_votes'] === 2, 'first poll option count is wrong');
    feed_summary_behavior_assert((int)$summary['options'][1]['option_votes'] === 1, 'second poll option count is wrong');
    feed_summary_behavior_assert((int)$summary['options'][2]['option_votes'] === 0, 'third poll option count is wrong');
    feed_summary_behavior_assert((int)$summary['options'][0]['all'] === 3, 'poll total is wrong');
    feed_summary_behavior_assert((int)$summary['voted_id'] === $option_ids[0], 'viewer vote was not batched');

    $summary_album = !empty($summary['photo_album']) ? $summary['photo_album'] : (!empty($summary['photo_multi']) ? $summary['photo_multi'] : array());
    feed_summary_behavior_assert(
        json_encode($summary_album) === json_encode($direct_album),
        'batched album media differs from legacy helper output'
    );

    unset($GLOBALS['vnseea_post_batch_context']);
    $detail = Wo_PostData($post_id);
    feed_summary_behavior_assert(!empty($detail['get_post_comments']), 'full post detail no longer hydrates comments');

    mysqli_rollback($sqlConnect);
    echo "staging feed summary behavior: ok\n";
} catch (Throwable $error) {
    mysqli_rollback($sqlConnect);
    fwrite(STDERR, 'FAIL: ' . $error->getMessage() . "\n");
    exit(1);
}
