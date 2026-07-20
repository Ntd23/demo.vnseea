<?php

$root = dirname(__DIR__);

function shared_post_story_source($root, $relative)
{
    $contents = file_get_contents($root . '/' . $relative);
    if ($contents === false) {
        fwrite(STDERR, "Unable to read {$relative}\n");
        exit(1);
    }
    return $contents;
}

$migration = shared_post_story_source($root, 'database/migrations/20260720_shared_post_stories.sql');
$create = shared_post_story_source($root, 'api/v2/endpoints/create-story.php');
$stories = shared_post_story_source($root, 'assets/includes/functions_three.php');

$assertions = array(
    array(strpos($migration, "COLUMN_NAME = 'story_type'") !== false, 'migration must add story_type idempotently'),
    array(strpos($migration, "COLUMN_NAME = 'source_post_id'") !== false, 'migration must add source_post_id idempotently'),
    array(strpos($migration, "INDEX_NAME = 'idx_story_source_post'") !== false, 'migration must add the source index idempotently'),
    array(strpos($create, "'shared_post'") !== false, 'create-story must support shared_post'),
    array(strpos($create, 'VNSEEA_ResolveShareableSourcePostId') !== false, 'create-story must flatten and authorize the source'),
    array(strpos($stories, 'VNSEEA_CanViewSharedPostStory') !== false, 'story reads must re-check source visibility'),
);

foreach ($assertions as $assertion) {
    if (!$assertion[0]) {
        fwrite(STDERR, "FAIL: {$assertion[1]}\n");
        exit(1);
    }
}

$fixtures = array(
    10 => array('id' => 10, 'parent_id' => 0, 'user_id' => 7, 'postPrivacy' => 0, 'is_anonymous' => 0),
    20 => array('id' => 20, 'parent_id' => 10, 'user_id' => 7, 'postPrivacy' => 0, 'is_anonymous' => 0),
    30 => array('id' => 30, 'parent_id' => 31, 'user_id' => 7, 'postPrivacy' => 0, 'is_anonymous' => 0),
    31 => array('id' => 31, 'parent_id' => 30, 'user_id' => 7, 'postPrivacy' => 0, 'is_anonymous' => 0),
    40 => array('id' => 40, 'parent_id' => 0, 'user_id' => 8, 'postPrivacy' => 3, 'is_anonymous' => 0),
);

$wo = array('loggedin' => false);
require_once $root . '/assets/includes/vnseea_privacy.php';

$loader = function ($post_id) use ($fixtures) {
    return isset($fixtures[(int) $post_id]) ? $fixtures[(int) $post_id] : array();
};

if (VNSEEA_ResolveShareableSourcePostId(20, 7, $loader) !== 10) {
    fwrite(STDERR, "FAIL: nested source must resolve to the root post\n");
    exit(1);
}
if (VNSEEA_ResolveShareableSourcePostId(30, 7, $loader) !== 0) {
    fwrite(STDERR, "FAIL: cyclic source must be rejected\n");
    exit(1);
}
if (VNSEEA_ResolveShareableSourcePostId(40, 7, $loader) !== 0) {
    fwrite(STDERR, "FAIL: a private source owned by another user must be rejected\n");
    exit(1);
}

fwrite(STDOUT, "shared post story contract: ok\n");
