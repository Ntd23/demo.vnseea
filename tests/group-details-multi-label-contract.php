<?php

function assert_group_details_contract($condition, $message)
{
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$root = dirname(__DIR__);
$group_chat = file_get_contents($root . '/api/v2/endpoints/group_chat.php');
$mute = file_get_contents($root . '/api/v2/endpoints/mute.php');
$functions_one = file_get_contents($root . '/assets/includes/functions_one.php');
$functions_three = file_get_contents($root . '/assets/includes/functions_three.php');
$tables = file_get_contents($root . '/assets/includes/tabels.php');
$clear_migration = file_get_contents($root . '/database/migrations/20260721_group_chat_history_clears.sql');
$labels_migration = file_get_contents($root . '/database/migrations/20260721_multi_user_tag_assignments.sql');

assert_group_details_contract(
    strpos($group_chat, "'get_media'") !== false &&
        strpos($group_chat, "'clear_history'") !== false &&
        strpos($group_chat, '$filter_keyword') === false &&
        strpos($group_chat, 'VNSEEA_GroupApiCollectMessages') !== false &&
        strpos($group_chat, 'VNSEEA_GroupApiCanAccess') !== false,
    'group search/media/clear actions must use valid inputs'
);
assert_group_details_contract(
    strpos($mute, "T_GROUP_CHAT") !== false &&
        strpos($mute, "T_GROUP_CHAT_USERS") !== false &&
        strpos($mute, "where('active', 1)") !== false,
    'group mute must validate active membership or ownership'
);
assert_group_details_contract(
    strpos($tables, 'T_GROUP_CHAT_HISTORY_CLEARS') !== false &&
        strpos($clear_migration, 'cleared_message_id') !== false &&
        strpos($clear_migration, 'UNIQUE KEY') !== false,
    'private group history needs an idempotent per-user watermark'
);
assert_group_details_contract(
    strpos($functions_one, 'ON DUPLICATE KEY UPDATE `tag_id` = VALUES(`tag_id`)') === false &&
        strpos($functions_one, 'ORDER BY UTA.id DESC') !== false &&
        strpos($labels_migration, '`owner_id`,`target_user_id`,`tag_id`') !== false,
    'labels must be independently attachable and ordered newest first'
);
assert_group_details_contract(
    strpos($functions_one, 'WHERE UTA.owner_id={$owner_id} AND UTA.target_user_id={$target_user_id} ORDER BY UTA.id DESC') !== false,
    'target label API must return every assignment newest first'
);
assert_group_details_contract(
    strpos($functions_three, 'DELETE FROM " . T_GROUP_CHAT_HISTORY_CLEARS') !== false &&
        strpos($functions_three, 'DELETE pin FROM " . T_MESSAGE_PINS') !== false,
    'deleting a group must remove private history watermarks and orphaned message pins'
);
assert_group_details_contract(
    strpos($functions_one, 'function VNSEEA_PublishRealtimeGroupChange') !== false &&
        substr_count($group_chat, 'VNSEEA_PublishRealtimeGroupChange') >= 6,
    'successful group metadata and membership mutations must invalidate realtime clients'
);

echo "group details and multi-label contract: ok\n";
