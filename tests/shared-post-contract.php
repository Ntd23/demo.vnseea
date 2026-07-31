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
$functions = shared_post_source($root, 'assets/includes/functions_three.php');
$share_function_start = strpos($functions, 'function Wo_SharePostOn');
$share_function_end = strpos($functions, '// manage packages', $share_function_start);
$share_function = ($share_function_start !== false && $share_function_end !== false)
    ? substr($functions, $share_function_start, $share_function_end - $share_function_start)
    : '';

$assertions = array(
    array(strpos($privacy, 'function VNSEEA_AttachSharedPostInfo') !== false, 'missing canonical shared_info helper'),
    array(strpos($privacy, 'VNSEEA_MAX_SHARED_POST_DEPTH') !== false, 'shared source traversal must be bounded'),
    array(strpos($privacy, 'get_post_comments') !== false, 'shared source payload must strip comments'),
    array(strpos($posts, 'VNSEEA_AttachSharedPostInfo') !== false, 'posts endpoint must use canonical shared_info helper'),
    array(substr_count($posts, '$complete_shared_post(') === 3, 'all three share destinations must use one validated completion path'),
    array(strpos($detail, 'VNSEEA_AttachSharedPostInfo') !== false, 'get-post-data must attach shared_info'),
    array(strpos($privacy, 'function VNSEEA_PrepareSharedPostCloneData') !== false, 'shared posts need one canonical clone-data helper'),
    array(strpos($share_function, '$db->insert(T_POSTS, $post_data)') !== false, 'shared posts must use a prepared insert that preserves SQL NULL'),
    array(strpos($share_function, "implode('\\', \\'', \$post_data)") === false, 'shared posts must not flatten NULL values into empty strings'),
    array(strpos($share_function, '$db->startTransaction()') !== false, 'shared post clone and media must be transactional'),
    array(strpos($share_function, '$db->commit()') !== false, 'shared post transaction must commit explicitly'),
    array(strpos($share_function, '$db->rollback()') !== false, 'shared post transaction must roll back on dependency failure'),
    array(strpos($posts, "\$user_id = \$page['user_id'];") === false, 'group sharing must not read an undefined page'),
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

$clone = VNSEEA_PrepareSharedPostCloneData(
    array(
        'id' => '80',
        'post_id' => '80',
        'user_id' => '10',
        'page_id' => '11',
        'group_id' => '12',
        'event_id' => '13',
        'recipient_id' => '14',
        'postMapLat' => null,
        'postMapLng' => null,
        'postText' => 'source',
        'postType' => 'photo',
    ),
    99,
    77,
    'group',
    80,
    'https://demo.vnseea.vn/post/80',
    123456
);
if (
    array_key_exists('id', $clone)
    || $clone['postMapLat'] !== null
    || $clone['postMapLng'] !== null
    || (int) $clone['group_id'] !== 77
    || (int) $clone['page_id'] !== 0
    || (int) $clone['event_id'] !== 0
    || (int) $clone['recipient_id'] !== 0
) {
    fwrite(STDERR, "FAIL: shared clone data must preserve SQL NULL and reset source ownership\n");
    exit(1);
}

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
