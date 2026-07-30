<?php

$root = dirname(__DIR__);

function post_tags_assert_true($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$helper_path = $root . '/assets/includes/vnseea_post_tags.php';
$migration_path = $root . '/database/migrations/20260728_post_tagged_users.sql';
$endpoint_path = $root . '/api/v2/endpoints/post-taggable-users.php';
$new_post_path = $root . '/api/v2/endpoints/new_post.php';
$functions_path = $root . '/assets/includes/functions_one.php';
$tables_path = $root . '/assets/includes/tabels.php';

post_tags_assert_true(file_exists($helper_path), 'post tag helper must exist');
post_tags_assert_true(file_exists($migration_path), 'post tag migration must exist');
post_tags_assert_true(file_exists($endpoint_path), 'taggable users endpoint must exist');

require_once $helper_path;

$normalized = VNSEEA_NormalizeTaggedUserIds('["9","3","9",4]');
post_tags_assert_true($normalized['valid'] === true, 'valid ids must pass');
post_tags_assert_true($normalized['ids'] === array(9, 3, 4), 'ids must be positive, unique and ordered');

$too_many = VNSEEA_NormalizeTaggedUserIds(json_encode(range(1, 21)));
post_tags_assert_true($too_many['valid'] === false, 'more than twenty ids must fail');
post_tags_assert_true($too_many['error_code'] === 'tagged_users_limit', 'limit failure must be stable');

$invalid = VNSEEA_NormalizeTaggedUserIds('["2","bad"]');
post_tags_assert_true($invalid['valid'] === false, 'non numeric ids must fail');

$helper = file_get_contents($helper_path);
$migration = file_get_contents($migration_path);
$endpoint = file_get_contents($endpoint_path);
$new_post = file_get_contents($new_post_path);
$functions = file_get_contents($functions_path);
$tables = file_get_contents($tables_path);

post_tags_assert_true(strpos($migration, 'CREATE TABLE IF NOT EXISTS `Wo_PostTaggedUsers`') !== false, 'migration must be idempotent');
post_tags_assert_true(strpos($migration, 'UNIQUE KEY `uniq_post_tagged_user` (`post_id`, `user_id`)') !== false, 'migration must dedupe post and user');
post_tags_assert_true(strpos($tables, "T_POST_TAGGED_USERS") !== false, 'table constant must exist');
post_tags_assert_true(strpos($helper, 'VNSEEA_CanTagUserForPostRequest') !== false, 'server must recheck tag visibility');
post_tags_assert_true(strpos($helper, 'VNSEEA_SavePostTaggedUsers') !== false, 'helper must save canonical tag rows');
post_tags_assert_true(strpos($helper, 'VNSEEA_GetPostTaggedUsers') !== false, 'helper must hydrate canonical tag rows');
post_tags_assert_true(strpos($endpoint, 'VNSEEA_SearchTaggableUsers') !== false, 'endpoint must delegate to canonical search');
post_tags_assert_true(strpos($new_post, "tagged_user_ids") !== false, 'new post endpoint must accept canonical ids');
post_tags_assert_true(strpos($new_post, 'mysqli_begin_transaction') !== false, 'tagged post creation must be transactional');
post_tags_assert_true(strpos($new_post, 'VNSEEA_SavePostTaggedUsers') !== false, 'new post must persist tags');
post_tags_assert_true(strpos($new_post, 'mysqli_commit') !== false, 'new post must commit before notifying');
post_tags_assert_true(strpos($new_post, 'VNSEEA_NotifyPostTaggedUsers') !== false, 'new post must notify tagged users');
post_tags_assert_true(
    strpos($new_post, '$should_register_album_photos') !== false,
    'post creation must distinguish a pre-uploaded single photo from deferred album photos'
);
post_tags_assert_true(
    strpos($new_post, "if (\$should_register_album_photos)") !== false,
    'a pre-uploaded single photo must not be uploaded again after the post insert'
);
post_tags_assert_true(
    strpos($new_post, "'post_media_save_failed'") !== false,
    'media dependency failures must not be reported as tagged-user failures'
);
post_tags_assert_true(strpos($functions, 'VNSEEA_GetPostTaggedUsers') !== false, 'Wo_PostData must hydrate tagged users');
post_tags_assert_true(strpos($functions, 'T_POST_TAGGED_USERS') !== false, 'post deletion must clean tag rows');

fwrite(STDOUT, "post tags contract: ok\n");
