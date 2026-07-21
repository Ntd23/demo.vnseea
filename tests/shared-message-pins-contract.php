<?php

$root = dirname(__DIR__);

function assert_pin_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$migration = file_get_contents($root . '/database/migrations/20260721_shared_message_pins.sql');
$tables = file_get_contents($root . '/assets/includes/tabels.php');
$exceptions = file_get_contents($root . '/api/v2/endpoints/Exceptions/exceptions.php');
$pin = file_get_contents($root . '/api/v2/endpoints/pin_message.php');
$pinned = file_get_contents($root . '/api/v2/endpoints/get_pin_message.php');
$messages = file_get_contents($root . '/assets/includes/functions_one.php');
$group_messages = file_get_contents($root . '/assets/includes/functions_three.php');

assert_pin_contract(strpos($migration, 'CREATE TABLE IF NOT EXISTS `Wo_MessagePins`') !== false, 'shared message pin table is missing');
assert_pin_contract(strpos($migration, 'UNIQUE KEY `message_id` (`message_id`)') !== false, 'message_id must be unique');
assert_pin_contract(strpos($migration, 'INSERT IGNORE INTO `Wo_MessagePins`') !== false, 'legacy pins must be migrated idempotently');
assert_pin_contract(strpos($tables, "define('T_MESSAGE_PINS', 'Wo_MessagePins')") !== false, 'message pin table constant is missing');
assert_pin_contract(strpos($exceptions, 'VNSEEA_CanUnpinSharedMessage') !== false, 'shared unpin policy helper is missing');
assert_pin_contract(strpos($exceptions, "if (\$type !== 'group')") !== false, 'direct chat must only allow the original pinner to unpin');
assert_pin_contract(strpos($exceptions, 'Wo_IsAdmin()') !== false && strpos($exceptions, 'T_GROUP_CHAT') !== false, 'group owner/admin unpin policy is missing');
assert_pin_contract(strpos($pin, "'type_two' => 'message_pin_event'") !== false, 'pin event must be persisted as a system message');
assert_pin_contract(strpos($pin, "'reply_id'") !== false, 'pin event must reference the pinned message');
assert_pin_contract(strpos($pin, 'startTransaction') !== false && strpos($pin, 'commit') !== false && strpos($pin, 'rollback') !== false, 'pin and event must be transactional');
assert_pin_contract(strpos($pin, 'T_MESSAGE_PINS') < strpos($pin, "\$event_id = \$db->insert(T_MESSAGES"), 'pin must be inserted before the system event');
assert_pin_contract(strpos($pin, "\$db->commit();", strpos($pin, "\$event_id = \$db->insert(T_MESSAGES")) < strpos($pin, 'VNSEEA_PublishRealtimeMessageChange($event_id)'), 'realtime must publish only after commit');
assert_pin_contract(strpos($pin, 'Wo_SendPushNotification') === false && strpos($pin, 'OneSignal') === false, 'pin event must not send a push notification');
assert_pin_contract(strpos($pinned, 'pinned_by_user_id') !== false, 'pinned response must expose actor id');
assert_pin_contract(strpos($pinned, 'can_unpin') !== false, 'pinned response must expose unpin permission');
assert_pin_contract(strpos($messages, 'return VNSEEA_AttachMessageSystemEvent($fetched_data)') !== false, 'direct conversation preview must expose the pin event');
assert_pin_contract(strpos($group_messages, 'VNSEEA_AttachMessageSystemEvent($fetched_data)') !== false, 'group conversation preview must expose the pin event');

echo "shared message pins contract: OK\n";
