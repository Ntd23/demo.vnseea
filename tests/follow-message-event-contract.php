<?php

function follow_message_event_assert($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "follow message event contract failed: {$message}\n");
        exit(1);
    }
}

$root = dirname(__DIR__);
$functions = file_get_contents($root . '/assets/includes/functions_one.php');
$follow = file_get_contents($root . '/api/v2/endpoints/follow-user.php');
$follow_request = file_get_contents($root . '/api/v2/endpoints/follow-request-action.php');
$push = file_get_contents($root . '/assets/includes/vnseea_push_delivery.php');

follow_message_event_assert(
    strpos($functions, 'function VNSEEA_RegisterFollowMessageEvent') !== false &&
    strpos($functions, "'type_two' => 'follow_event'") !== false,
    'accepted follows must create a dedicated system message'
);
follow_message_event_assert(
    strpos($functions, "? 'user_followed'") !== false &&
    strpos($functions, "'target_user_id'") !== false,
    'follow messages must be returned as canonical system events'
);
follow_message_event_assert(
    strpos($follow, "\$follow_message = 'followed';") !== false &&
    strpos($follow, 'VNSEEA_RegisterFollowMessageEvent') !== false,
    'direct follows must create the system event only after becoming active'
);
follow_message_event_assert(
    strpos($follow_request, "\$_POST['request_action'] == 'accept'") !== false &&
    strpos($follow_request, 'VNSEEA_RegisterFollowMessageEvent') !== false,
    'accepted private follow requests must create the same event'
);
follow_message_event_assert(
    strpos($push, "\$type_two === 'follow_event'") !== false &&
    strpos($push, "'Đã theo dõi bạn'") !== false,
    'follow message push must not expose its transport token'
);

fwrite(STDOUT, "follow message event contract: ok\n");
