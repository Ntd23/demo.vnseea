<?php

function assert_message_runtime_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$root = dirname(__DIR__);
$functions_one = file_get_contents($root . '/assets/includes/functions_one.php');
$send_message = file_get_contents($root . '/api/v2/endpoints/send-message.php');
$group_chat = file_get_contents($root . '/api/v2/endpoints/group_chat.php');
$comments = file_get_contents($root . '/api/v2/endpoints/comments.php');
$get_pinned = file_get_contents($root . '/api/v2/endpoints/get_pin_message.php');
$pin_message = file_get_contents($root . '/api/v2/endpoints/pin_message.php');
$reaction = file_get_contents($root . '/api/v2/endpoints/react_message.php');
$read_chats = file_get_contents($root . '/api/v2/endpoints/read_chats.php');

assert_message_runtime_contract(
    strpos($send_message, '$is_audio_message') !== false &&
        strpos($send_message, "'m4a'") !== false &&
        strpos($send_message, '$media === false') !== false,
    'direct voice upload must accept M4A and reject failed uploads'
);
assert_message_runtime_contract(
    strpos($group_chat, '$is_audio_message') !== false &&
        strpos($group_chat, "\$message_data['type_two'] = 'audio'") !== false &&
        strpos($group_chat, '$media === false') !== false,
    'group voice upload must remain an audio message and reject failed uploads'
);
assert_message_runtime_contract(
    strpos($comments, "'types' => 'mp3,wav,ogg,m4a,mp4,aac'") !== false &&
        strpos($comments, "\$fileInfo['is_sound'] = 1") !== false &&
        strpos($comments, '$media === false') !== false,
    'voice comments must accept iOS M4A audio and reject failed uploads'
);
assert_message_runtime_contract(
    strpos($get_pinned, "['pinned_at']") !== false &&
        strpos($get_pinned, "orderBy('time', 'DESC')") !== false,
    'pinned messages must expose pinned_at in newest-first order'
);
assert_message_runtime_contract(
    strpos($pin_message, "'time' => time()") !== false,
    'pinning again must update the pin timestamp'
);
assert_message_runtime_contract(
    strpos($functions_one, 'function VNSEEA_PublishRealtimeMessageChange') !== false,
    'canonical message realtime publisher is missing'
);
assert_message_runtime_contract(
    strpos($reaction, 'VNSEEA_PublishRealtimeMessageChange') !== false &&
        strpos($pin_message, 'VNSEEA_PublishRealtimeMessageChange') !== false,
    'reaction and pin mutations must publish only after success'
);
assert_message_runtime_contract(
    strpos($read_chats, "\$_POST['recipient_id']") !== false &&
        strpos($read_chats, 'Wo_PublishRealtimeNotification($sender_id') !== false,
    'seen mutations must target the active conversation and notify the sender'
);

echo "message realtime, voice and pin contract: ok\n";
