<?php

$root = dirname(__DIR__);
require_once $root . '/assets/includes/vnseea_push_delivery.php';

function assert_group_message_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$group_chat = file_get_contents($root . '/api/v2/endpoints/group_chat.php');
$direct_chat = file_get_contents($root . '/api/v2/endpoints/send-message.php');
$functions_one = file_get_contents($root . '/assets/includes/functions_one.php');

$inline_payload = rawurlencode(json_encode(array(
    'author' => 'Người gửi Web',
    'quote' => 'Tin nhắn gốc',
    'targetMessageId' => 91,
)));
$descriptor = VNSEEA_MessagePushDescriptor(array(
    'text' => '__VNSEEA_MINI_REPLY__:' . $inline_payload . "\nTôi đồng ý",
), 'vi');
assert_group_message_contract(
    $descriptor['text'] === 'Tôi đồng ý',
    'push preview must strip the legacy Nuxt reply envelope'
);

assert_group_message_contract(
    strpos($group_chat, "\$_POST['mentioned_user_ids']") !== false &&
        strpos($group_chat, 'VNSEEA_PrepareGroupMessageMentions') !== false,
    'group send must validate explicit mentioned member ids'
);
assert_group_message_contract(
    strpos($group_chat, "'reply_id' => \$reply_id") !== false,
    'reply_id must be part of the message insert instead of a later update'
);
assert_group_message_contract(
    strpos($direct_chat, "'reply_id' => \$reply_id") !== false &&
        strpos($direct_chat, "update(T_MESSAGES,array('reply_id'") === false,
    'direct message replies must also be inserted atomically'
);
assert_group_message_contract(
    strpos($functions_one, 'function VNSEEA_AttachMessageMentions') !== false &&
        strpos($functions_one, "['mentions']") !== false,
    'message responses must expose hydrated mention users'
);
assert_group_message_contract(
    strpos($group_chat, 'VNSEEA_RegisterGroupMessageMentions') >
        strpos($group_chat, 'Wo_RegisterMessageGroup($message_data)'),
    'mention notifications must only be created after the message insert succeeds'
);
assert_group_message_contract(
    strpos($functions_one, "empty(\$data['skip_push'])") !== false,
    'in-app mention notifications must support suppressing duplicate push delivery'
);

echo "group message contract: ok\n";
