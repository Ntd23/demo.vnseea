<?php

$root = dirname(__DIR__);

$create = file_get_contents($root . '/api/v2/endpoints/create-story.php');
if ($create === false) {
    fwrite(STDERR, "Unable to read api/v2/endpoints/create-story.php\n");
    exit(1);
}

$mention_start = strpos($create, "'type' => 'story_mention'");
$follower_start = strpos($create, "function_exists('VNSEEA_EnqueueFollowerContentNotification')");

$assertions = array(
    array(
        strpos($create, "strlen(\$_POST['story_overlay']) > 6000") !== false,
        'story_overlay must accept the app overlay limit of 6000 characters'
    ),
    array(
        strpos($create, 'json_encode($story_overlay, JSON_UNESCAPED_SLASHES)') !== false
            && strpos($create, 'json_encode($story_overlay, JSON_UNESCAPED_UNICODE') === false,
        'story_overlay must be stored as ASCII JSON so emoji fit the utf8 overlay_data column'
    ),
    array(
        $mention_start !== false,
        'mentioned people must get a story_mention notification'
    ),
    array(
        strpos($create, "VNSEEA_CanViewStory(\$story_data, \$mentioned_user_id)") !== false,
        'mention notifications must respect the story audience'
    ),
    array(
        strpos($create, "\$mentioned_user_id != \$wo['user']['id']") !== false
            && strpos($create, 'count($mentioned_user_ids) >= 10') !== false,
        'mentions must skip the author and cap the number of notifications'
    ),
    array(
        $mention_start !== false && $follower_start !== false && $mention_start < $follower_start,
        'mention notifications must be sent only after the story was created'
    ),
);

foreach ($assertions as $assertion) {
    if (!$assertion[0]) {
        fwrite(STDERR, "FAIL: {$assertion[1]}\n");
        exit(1);
    }
}

echo "story overlay mention contract: ok\n";
