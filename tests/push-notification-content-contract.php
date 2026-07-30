<?php

$root = dirname(__DIR__);
require_once $root . '/assets/includes/vnseea_push_delivery.php';

function assert_push_notification_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

function assert_push_notification_text($notification, $language, $expected, $message)
{
    $actual = VNSEEA_NotificationPushText($notification, $language);
    assert_push_notification_contract(
        $actual === $expected,
        $message . "\nExpected: {$expected}\nActual: {$actual}"
    );
}

assert_push_notification_text(
    array('type' => 'reaction', 'text' => 'post'),
    'vi',
    'Đã bày tỏ cảm xúc về bài viết của bạn',
    'reaction pushes must not expose the internal post token'
);
assert_push_notification_text(
    array('type' => 'reaction', 'text' => 'comment'),
    'vi',
    'Đã bày tỏ cảm xúc về bình luận của bạn',
    'comment reaction pushes must identify the target'
);
assert_push_notification_text(
    array('type' => 'reaction', 'text' => 'replay'),
    'en',
    'Reacted to your reply',
    'reply reaction pushes must normalize the legacy replay token'
);
assert_push_notification_text(
    array('type' => 'comment', 'text' => 'Nội dung bình luận'),
    'vi',
    'Đã bình luận: “Nội dung bình luận”',
    'comment pushes must wrap content in a clear action'
);
assert_push_notification_text(
    array('type' => 'comment_reply', 'text' => 'Thanks'),
    'en',
    'Replied to your comment: “Thanks”',
    'reply pushes must wrap content in a clear action'
);
assert_push_notification_text(
    array('type' => 'live_video', 'text' => ''),
    'vi',
    'Đang phát trực tiếp',
    'live pushes need a meaningful fallback'
);
assert_push_notification_text(
    array('type' => 'viewed_story', 'text' => ''),
    'vi',
    'Đã xem tin của bạn',
    'story view pushes need a meaningful fallback'
);
assert_push_notification_text(
    array('type' => 'future_content', 'text' => 'poll'),
    'vi',
    'Bạn có thông báo mới',
    'unknown notification types must not expose a raw technical token'
);

assert_push_notification_contract(
    function_exists('VNSEEA_NotificationPushRoutingData'),
    'canonical social push routing helper is missing'
);

$routing = VNSEEA_NotificationPushRoutingData(array(
    'type' => 'comment',
    'type2' => 'post_image',
    'notifier_id' => '7',
    'post_id' => '42',
    'comment_id' => '11',
    'reply_id' => '0',
    'page_id' => '3',
    'group_id' => '4',
    'group_chat_id' => '5',
    'event_id' => '6',
    'thread_id' => '8',
    'blog_id' => '9',
    'story_id' => '10',
    'url' => 'index.php?link1=post&id=42',
    'full_link' => ''
));

foreach (array(
    'notification_type' => 'comment',
    'type' => 'comment',
    'type2' => 'post_image',
    'user_id' => '7',
    'notifier_id' => '7',
    'post_id' => '42',
    'comment_id' => '11',
    'page_id' => '3',
    'group_id' => '4',
    'group_chat_id' => '5',
    'event_id' => '6',
    'thread_id' => '8',
    'blog_id' => '9',
    'story_id' => '10',
    'url' => 'index.php?link1=post&id=42'
) as $key => $expected) {
    assert_push_notification_contract(
        isset($routing[$key]) && (string)$routing[$key] === $expected,
        "canonical routing payload is missing {$key}"
    );
}

assert_push_notification_contract(
    !empty($routing['focus_comments']),
    'comment notifications must identify the comments destination'
);

$product_routing = VNSEEA_NotificationPushRoutingData(array(
    'type' => 'new_review',
    'url' => 'index.php?link1=products&id=12'
));
assert_push_notification_contract(
    isset($product_routing['product_id']) &&
        (string)$product_routing['product_id'] === '12',
    'product notifications must carry a canonical product_id'
);

$job_routing = VNSEEA_NotificationPushRoutingData(array(
    'type' => 'apply_job',
    'url' => 'index.php?link1=timeline&u=shop&type=job_apply&id=24'
));
assert_push_notification_contract(
    isset($job_routing['job_id']) &&
        (string)$job_routing['job_id'] === '24',
    'job notifications must carry a canonical job_id'
);

$funding_routing = VNSEEA_NotificationPushRoutingData(array(
    'type' => 'fund_donate',
    'url' => 'index.php?link1=show_fund&id=sXcNDtHAyWNz1F6'
));
assert_push_notification_contract(
    isset($funding_routing['funding_id']) &&
        (string)$funding_routing['funding_id'] === 'sXcNDtHAyWNz1F6',
    'funding notifications must carry a canonical funding_id'
);

$order_routing = VNSEEA_NotificationPushRoutingData(array(
    'type' => 'status_changed',
    'url' => 'index.php?link1=customer_order&id=9702086a6865aeafad1'
));
assert_push_notification_contract(
    isset($order_routing['order_id']) &&
        (string)$order_routing['order_id'] === '9702086a6865aeafad1',
    'order notifications must carry a canonical order_id'
);

echo "push notification content contract passed\n";
