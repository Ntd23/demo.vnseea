<?php

$root = dirname(__DIR__);

function shared_post_source($root, $relative)
{
    $contents = file_get_contents($root . '/' . $relative);
    if ($contents === false) {
        fwrite(STDERR, "Unable to read {$relative}\n");
        exit(1);
    }
    return $contents;
}

$privacy = shared_post_source($root, 'assets/includes/vnseea_privacy.php');
$posts = shared_post_source($root, 'api/v2/endpoints/posts.php');
$detail = shared_post_source($root, 'api/v2/endpoints/get-post-data.php');

$assertions = array(
    array(strpos($privacy, 'function VNSEEA_AttachSharedPostInfo') !== false, 'missing canonical shared_info helper'),
    array(strpos($privacy, 'VNSEEA_MAX_SHARED_POST_DEPTH') !== false, 'shared source traversal must be bounded'),
    array(strpos($privacy, 'get_post_comments') !== false, 'shared source payload must strip comments'),
    array(strpos($posts, 'VNSEEA_AttachSharedPostInfo') !== false, 'posts endpoint must use canonical shared_info helper'),
    array(substr_count($posts, 'VNSEEA_AttachSharedPostInfo($new_post') >= 3, 'all three share responses must attach shared_info'),
    array(strpos($detail, 'VNSEEA_AttachSharedPostInfo') !== false, 'get-post-data must attach shared_info'),
);

foreach ($assertions as $assertion) {
    if (!$assertion[0]) {
        fwrite(STDERR, "FAIL: {$assertion[1]}\n");
        exit(1);
    }
}

$shared_post_fixtures = array(
    20 => array('id' => 20, 'parent_id' => 10, 'postText' => 'nested'),
    10 => array(
        'id' => 10,
        'parent_id' => 0,
        'postText' => 'root',
        'publisher' => array('name' => 'Author', 'email' => 'private@example.com'),
        'get_post_comments' => array(array('id' => 1)),
    ),
    30 => array('id' => 30, 'parent_id' => 31),
    31 => array('id' => 31, 'parent_id' => 30),
);

function Wo_PostData($post_id)
{
    global $shared_post_fixtures;
    return isset($shared_post_fixtures[(int) $post_id])
        ? $shared_post_fixtures[(int) $post_id]
        : false;
}

$wo = array('loggedin' => false);
require_once $root . '/assets/includes/vnseea_privacy.php';

$flattened = VNSEEA_AttachSharedPostInfo(
    array('id' => 50, 'parent_id' => 20),
    array('email')
);
if ((int) $flattened['shared_info']['id'] !== 10) {
    fwrite(STDERR, "FAIL: nested shares were not flattened to the root source\n");
    exit(1);
}
if (isset($flattened['shared_info']['get_post_comments']) || isset($flattened['shared_info']['publisher']['email'])) {
    fwrite(STDERR, "FAIL: shared source leaked comments or private publisher fields\n");
    exit(1);
}

$cycle = VNSEEA_AttachSharedPostInfo(array('id' => 60, 'parent_id' => 30));
if (!empty($cycle['shared_info'])) {
    fwrite(STDERR, "FAIL: cyclic shares must not expose a source payload\n");
    exit(1);
}

$missing = VNSEEA_AttachSharedPostInfo(array('id' => 70, 'parent_id' => 999));
if (!empty($missing['shared_info'])) {
    fwrite(STDERR, "FAIL: inaccessible sources must not be exposed\n");
    exit(1);
}

fwrite(STDOUT, "shared post contract: ok\n");
