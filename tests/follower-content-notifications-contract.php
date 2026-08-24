<?php

$root = dirname(__DIR__);

function follower_content_source($root, $path)
{
    $full_path = $root . '/' . $path;
    return file_exists($full_path) ? file_get_contents($full_path) : '';
}

function assert_follower_content_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$migration = follower_content_source(
    $root,
    'database/migrations/20260824_follower_content_notifications.sql'
);
$tables = follower_content_source($root, 'assets/includes/tabels.php');
$runtime = follower_content_source(
    $root,
    'assets/includes/vnseea_content_notifications.php'
);
$init = follower_content_source($root, 'assets/init.php');
$new_post = follower_content_source($root, 'api/v2/endpoints/new_post.php');
$create_story = follower_content_source($root, 'api/v2/endpoints/create-story.php');
$worker = follower_content_source($root, 'workers/push-delivery-worker.php');
$push = follower_content_source($root, 'assets/includes/vnseea_push_delivery.php');
$notification_runtime = follower_content_source($root, 'assets/includes/functions_one.php');

assert_follower_content_contract(
    strpos($migration, 'CREATE TABLE IF NOT EXISTS `Wo_ContentNotificationJobs`') !== false &&
        strpos($migration, 'UNIQUE KEY `content_target` (`content_type`, `content_id`)') !== false,
    'content notification jobs need an idempotent outbox table'
);
assert_follower_content_contract(
    strpos($migration, 'Wo_ContentNotificationMigrationState') !== false &&
        strpos($migration, 'START TRANSACTION') !== false &&
        strpos($migration, 'followers_default_enabled_v1') !== false &&
        strpos($migration, 'UPDATE `Wo_Followers`') !== false &&
        strpos($migration, 'SET `notify` = 1') !== false,
    'existing active follows need an atomic one-time backfill marker'
);
assert_follower_content_contract(
    strpos($tables, "define('T_CONTENT_NOTIFICATION_JOBS'") !== false,
    'content notification jobs table constant is missing'
);
assert_follower_content_contract(
    strpos($init, "includes/vnseea_content_notifications.php") !== false,
    'content notification runtime must be loaded by the application'
);

foreach (array(
    'VNSEEA_EnqueueFollowerContentNotification',
    'VNSEEA_ProcessFollowerContentNotificationQueue',
    'VNSEEA_ContentNotificationIsEligiblePost',
    'VNSEEA_ContentNotificationIsEligibleStory'
) as $function_name) {
    assert_follower_content_contract(
        strpos($runtime, "function {$function_name}") !== false,
        "{$function_name} is missing"
    );
}

if ($runtime !== '') {
    require_once $root . '/assets/includes/vnseea_content_notifications.php';
}
if (function_exists('VNSEEA_ContentNotificationIsEligiblePost')) {
    assert_follower_content_contract(
        VNSEEA_ContentNotificationIsEligiblePost(array(
            'id' => 10,
            'user_id' => 7,
            'active' => 1,
            'page_id' => 0,
            'group_id' => 0,
            'event_id' => 0,
            'recipient_id' => 0,
            'is_anonymous' => 0,
            'live_time' => 0
        )),
        'an active personal post should be eligible'
    );
    assert_follower_content_contract(
        !VNSEEA_ContentNotificationIsEligiblePost(array(
            'id' => 11,
            'user_id' => 7,
            'active' => 1,
            'page_id' => 0,
            'group_id' => 0,
            'event_id' => 0,
            'recipient_id' => 0,
            'is_anonymous' => 1,
            'live_time' => 0
        )),
        'anonymous posts must not reveal their author through follower notifications'
    );
    assert_follower_content_contract(
        !VNSEEA_ContentNotificationIsEligiblePost(array(
            'id' => 12,
            'user_id' => 7,
            'active' => 1,
            'page_id' => 4,
            'group_id' => 0,
            'event_id' => 0,
            'recipient_id' => 0,
            'is_anonymous' => 0,
            'live_time' => 0
        )),
        'Page content must not be treated as personal followed content'
    );
}
if (function_exists('VNSEEA_ContentNotificationIsEligibleStory')) {
    assert_follower_content_contract(
        VNSEEA_ContentNotificationIsEligibleStory(array(
            'id' => 20,
            'user_id' => 7,
            'expire' => time() + 3600,
            'ad_id' => null
        )),
        'an active personal story should be eligible'
    );
    assert_follower_content_contract(
        !VNSEEA_ContentNotificationIsEligibleStory(array(
            'id' => 21,
            'user_id' => 7,
            'expire' => time() - 1,
            'ad_id' => null
        )),
        'expired stories must not fan out notifications'
    );
}

assert_follower_content_contract(
    strpos($runtime, 'T_FOLLOWERS') !== false &&
        strpos($runtime, "`active` = '1'") !== false &&
        strpos($runtime, "follow.`notify` = '1'") !== false &&
        strpos($runtime, 'VNSEEA_CanViewPost') !== false &&
        strpos($runtime, 'VNSEEA_CanViewStory') !== false,
    'fan-out must target active followers and recheck canonical content privacy'
);
assert_follower_content_contract(
    strpos($notification_runtime, '`following_id`,`follower_id`,`active`,`notify`') !== false &&
        strpos($notification_runtime, "SET `active` = '1', `notify` = '1'") !== false,
    'new and newly accepted follow relationships must enable notifications by default'
);
assert_follower_content_contract(
    strpos($runtime, "'new_post'") !== false &&
        strpos($runtime, "'new_story'") !== false &&
        strpos($runtime, 'Wo_RegisterNotification') !== false,
    'fan-out must create canonical post and story notifications'
);
assert_follower_content_contract(
    strpos($runtime, 'cursor_follow_id') !== false &&
        strpos($runtime, 'lease_until') !== false &&
        strpos($runtime, 'unable to register follower content notification') !== false,
    'fan-out must page followers, lease jobs and retry failed notification inserts'
);

assert_follower_content_contract(
    strpos($new_post, "VNSEEA_EnqueueFollowerContentNotification('post'") !== false &&
        strpos($new_post, '$post_active == 1') !== false,
    'published posts must enqueue fan-out only after successful creation'
);
assert_follower_content_contract(
    strpos($create_story, "VNSEEA_EnqueueFollowerContentNotification('story'") !== false &&
        strpos($create_story, "'api_status'] === 200") !== false,
    'stories must enqueue fan-out only after the final successful response is ready'
);
assert_follower_content_contract(
    strpos($worker, 'VNSEEA_ProcessFollowerContentNotificationQueue') !== false,
    'the CLI push worker must process content fan-out jobs'
);
assert_follower_content_contract(
    strpos($notification_runtime, "empty(\$data['skip_post_hydration'])") !== false &&
        strpos($notification_runtime, "empty(\$data['skip_email'])") !== false,
    'fan-out notifications must avoid repeated post hydration and email work'
);
assert_follower_content_contract(
    strpos($push, "'new_post' => 'Vừa đăng một bài viết mới'") !== false &&
        strpos($push, "'new_story' => 'Vừa đăng một tin mới'") !== false &&
        strpos($push, "'new_post' => 'Posted a new post'") !== false &&
        strpos($push, "'new_story' => 'Added a new story'") !== false,
    'push copy must clearly describe new followed content in Vietnamese and English'
);

echo "follower content notifications contract passed\n";
